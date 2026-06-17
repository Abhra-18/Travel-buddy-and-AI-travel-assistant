import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import useAuth from '../../hooks/useAuth';
import './Messages.css';

const POLL_INTERVAL_MS = 3000; // Poll every 3 seconds as safety net

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const targetTripId = searchParams.get('trip');

  const { socket, onlineUsers, isConnected } = useSocket();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const activeChatRef = useRef(null);
  const messagesRef = useRef([]); // Always-fresh ref to messages
  const pollRef = useRef(null);
  const isAtBottomRef = useRef(true);

  // Keep refs in sync
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ── Merge incoming messages without duplicates or flicker ──
  const mergeMessages = useCallback((incoming) => {
    setMessages((prev) => {
      const existingIds = new Set(prev.filter(m => m._id).map(m => m._id));
      // Filter out any messages already in state (by _id)
      const truly_new = incoming.filter(m => !existingIds.has(m._id));
      
      if (truly_new.length === 0) return prev;

      // Remove pending/optimistic messages that now have a real _id
      const withoutOptimistic = prev.filter(m => m._id); // drop any temp-only msgs
      return [...withoutOptimistic, ...truly_new];
    });
  }, []);

  // ── Scroll helper ──
  const scrollToBottom = useCallback((force = false) => {
    if (force || isAtBottomRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, []);

  // Track if user has scrolled up (to avoid jerky auto-scroll)
  const handleScroll = (e) => {
    const el = e.currentTarget;
    const threshold = 80; // px from bottom
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  // 1. Fetch conversations sidebar
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await API.get('/messages/conversations');
      setConversations(data.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch full message list for the active chat
  const fetchMessages = useCallback(async (chat, scrollForce = false) => {
    if (!chat) return;
    try {
      const url = chat.type === 'trip'
        ? `/messages/trip/${chat.id}`
        : `/messages/${chat.id}`;
      const { data } = await API.get(url);
      
      setMessages((prev) => {
        // Keep any unsaved optimistic messages (no _id) at the end
        const optimistic = prev.filter(m => !m._id);
        return [...data.data, ...optimistic];
      });

      if (scrollForce) scrollToBottom(true);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  }, [scrollToBottom]);

  // 3. Set up polling — runs every POLL_INTERVAL_MS
  const startPolling = useCallback((chat) => {
    stopPolling();
    if (!chat) return;
    pollRef.current = setInterval(() => {
      fetchMessages(chat, false); // silent refresh, no force-scroll
      fetchConversations();
    }, POLL_INTERVAL_MS);
  }, [fetchMessages, fetchConversations]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // 4. Resolve Active Chat from URL
  useEffect(() => {
    if (targetUserId) {
      const chat = { type: 'direct', id: targetUserId };
      setActiveChat(chat);
      setMessages([]);
      fetchMessages(chat, true);
      startPolling(chat);
      if (socket) socket.emit('join_room', targetUserId);
    } else if (targetTripId) {
      const chat = { type: 'trip', id: targetTripId };
      setActiveChat(chat);
      setMessages([]);
      fetchMessages(chat, true);
      startPolling(chat);
      if (socket) socket.emit('join_trip', targetTripId);
    } else {
      stopPolling();
    }

    return () => stopPolling();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, targetTripId]);

  // Also restart polling when socket connects/disconnects
  useEffect(() => {
    if (activeChatRef.current) {
      startPolling(activeChatRef.current);
    }
    return () => stopPolling();
  }, [isConnected, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // 5. Socket Listeners — instant delivery when socket is alive
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const chat = activeChatRef.current;
      if (!chat) return;

      const isForCurrentDirect = chat.type === 'direct'
        && (msg.sender?._id === chat.id || msg.sender?._id === user._id);
      const isForCurrentTrip = chat.type === 'trip' && msg.trip === chat.id;

      if (isForCurrentDirect || isForCurrentTrip) {
        setMessages((prev) => {
          if (msg._id && prev.some(m => m._id === msg._id)) return prev;
          // Replace matching optimistic message
          const filtered = prev.filter(m => !(m.tempId && m.tempId === msg.tempId));
          return [...filtered, { ...msg, status: 'sent' }];
        });
        scrollToBottom();
        fetchConversations();
      }
    };

    const handleMessageSaved = ({ tempId, savedMessage }) => {
      setMessages((prev) => prev.map(m =>
        m.tempId === tempId ? { ...savedMessage, status: 'sent' } : m
      ));
    };

    const handleMessageError = ({ tempId }) => {
      setMessages((prev) => prev.map(m =>
        m.tempId === tempId ? { ...m, status: 'failed' } : m
      ));
    };

    socket.on('message_received', handleNewMessage);
    socket.on('message_saved', handleMessageSaved);
    socket.on('message_error', handleMessageError);
    socket.on('typing', (name) => setTypingUser(name));
    socket.on('stop_typing', () => setTypingUser(''));

    return () => {
      socket.off('message_received', handleNewMessage);
      socket.off('message_saved', handleMessageSaved);
      socket.off('message_error', handleMessageError);
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, [socket, fetchConversations, scrollToBottom, user._id]);

  // 6. Typing handler
  const handleTypingInput = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeChat || !isConnected) return;
    socket.emit('typing', { room: activeChat.id, user: user.name.split(' ')[0] });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', activeChat.id);
    }, 2000);
  };

  // 7. Send message — optimistic + socket + REST fallback
  const sendViaRest = useCallback(async (content, tempId) => {
    try {
      const url = activeChat.type === 'trip'
        ? `/messages/trip/${activeChat.id}`
        : `/messages/${activeChat.id}`;
      const { data } = await API.post(url, { content });
      setMessages((prev) => prev.map(m =>
        m.tempId === tempId ? { ...data.data, status: 'sent' } : m
      ));
      fetchConversations();
    } catch {
      setMessages((prev) => prev.map(m =>
        m.tempId === tempId ? { ...m, status: 'failed' } : m
      ));
    }
  }, [activeChat, fetchConversations]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const content = newMessage.trim();
    const tempId = `temp_${Date.now()}`;

    // Show immediately (optimistic)
    const optimistic = {
      tempId,
      sender: { _id: user._id, name: user.name },
      content,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');
    scrollToBottom(true);

    if (socket && isConnected) {
      const msgData = {
        tempId,
        sender: { _id: user._id, name: user.name },
        content,
        ...(activeChat.type === 'direct'
          ? { receiver: { _id: activeChat.id } }
          : { trip: activeChat.id }),
      };
      socket.emit('new_message', msgData);
      if (socket) socket.emit('stop_typing', activeChat.id);

      // Timeout fallback — if not ack'd in 4s, use REST
      setTimeout(() => {
        setMessages((prev) => {
          const m = prev.find(p => p.tempId === tempId);
          if (m && m.status === 'sending') sendViaRest(content, tempId);
          return prev;
        });
      }, 4000);
    } else {
      // Socket down — go straight to REST
      sendViaRest(content, tempId);
    }
  };

  const retryMessage = (failedMsg) => {
    setMessages((prev) => prev.filter(m => m.tempId !== failedMsg.tempId));
    const fakeEvt = { preventDefault: () => {} };
    setNewMessage(failedMsg.content);
    setTimeout(() => {
      setNewMessage((v) => { sendMessage({ preventDefault: () => {} }); return v; });
    }, 0);
  };

  // ── Render ──
  return (
    <div className="messages-page animate-fade-in">
      {/* Sidebar */}
      <div className="messages-sidebar">
        <div className="messages-sidebar__header">
          <h2>Messages</h2>
          <div className="connection-badge" data-connected={isConnected}>
            <span className="connection-dot" />
            {isConnected ? 'Live' : 'Reconnecting...'}
          </div>
        </div>
        <div className="messages-sidebar__list">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className={`conversation-item ${activeChat?.id === conv._id ? 'active' : ''}`}
              onClick={() => setSearchParams({ user: conv._id })}
            >
              <div className="conversation-avatar">
                {conv.profilePicture
                  ? <img src={conv.profilePicture} alt={conv.name} />
                  : conv.name?.charAt(0)}
                {onlineUsers.includes(conv._id) && <div className="online-indicator" />}
              </div>
              <div className="conversation-info">
                <h4>{conv.name}</h4>
                <p>{conv.latestMessage}</p>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <p style={{ padding: '1.5rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              No conversations yet. Go to Buddy Finder to start chatting!
            </p>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {activeChat ? (
          <>
            <div className="chat-window__header">
              <div className="conversation-avatar" style={{ width: 40, height: 40 }}>
                {activeChat.type === 'trip' ? '✈️' : '👤'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                  {activeChat.type === 'trip' ? 'Group Trip Chat' : 'Direct Message'}
                </h3>
                {activeChat.type === 'direct' && onlineUsers.includes(activeChat.id) && (
                  <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Online</span>
                )}
              </div>
            </div>

            <div className="chat-window__messages" onScroll={handleScroll}>
              {messages.map((msg, i) => {
                const isMe = msg.sender._id === user._id;
                return (
                  <div
                    key={msg._id || msg.tempId || i}
                    className={`message-bubble ${isMe ? 'sent' : 'received'}${msg.status === 'failed' ? ' failed' : ''}`}
                  >
                    {!isMe && activeChat.type === 'trip' && (
                      <div className="message-sender">{msg.sender.name}</div>
                    )}
                    {msg.content}
                    <div className="message-time">
                      {msg.status === 'sending' && <span className="msg-status sending">⏳</span>}
                      {msg.status === 'failed' && (
                        <span className="msg-status failed" onClick={() => retryMessage(msg)} style={{ cursor: 'pointer' }}>
                          ❌ Retry
                        </span>
                      )}
                      {(!msg.status || msg.status === 'sent') &&
                        new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {typingUser && typingUser !== user.name.split(' ')[0] && (
              <div className="typing-indicator">{typingUser} is typing...</div>
            )}

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder={isConnected ? 'Type a message...' : 'Reconnecting... messages will still send'}
                value={newMessage}
                onChange={handleTypingInput}
                autoComplete="off"
              />
              <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                ➤
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '3rem' }}>💬</span>
            <h3>Select a conversation to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
