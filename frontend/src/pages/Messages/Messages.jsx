import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import useAuth from '../../hooks/useAuth';
import './Messages.css';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const targetTripId = searchParams.get('trip');

  const { socket, onlineUsers, isConnected } = useSocket();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { type: 'direct'|'trip', id: string, name: string }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const activeChatRef = useRef(null); // Ref to avoid stale closure

  // Keep the ref in sync with state
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // 1. Fetch recent conversations list
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

  // 2. Resolve Active Chat from URL
  useEffect(() => {
    if (targetUserId) {
      setActiveChat({ type: 'direct', id: targetUserId, name: 'User' });
    } else if (targetTripId) {
      setActiveChat({ type: 'trip', id: targetTripId, name: 'Trip Group' });
      if (socket) socket.emit('join_trip', targetTripId);
    }
  }, [targetUserId, targetTripId, socket]);

  // 3. Fetch messages when activeChat changes
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const url = activeChat.type === 'trip' 
          ? `/messages/trip/${activeChat.id}` 
          : `/messages/${activeChat.id}`;
        
        const { data } = await API.get(url);
        setMessages(data.data);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    fetchMessages();

    // Cleanup typing state
    setTypingUser('');
  }, [activeChat]);

  // 4. Socket Listeners — use ref to avoid stale closures
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const chat = activeChatRef.current;
      if (!chat) return;

      // Check if message belongs to current active chat
      const isForCurrentDirect = chat.type === 'direct' 
        && (msg.sender._id === chat.id || msg.receiver === chat.id);
      const isForCurrentTrip = chat.type === 'trip' && msg.trip === chat.id;

      if (isForCurrentDirect || isForCurrentTrip) {
        setMessages((prev) => {
          // De-duplicate: don't add if we already have a message with same _id or tempId
          if (msg._id && prev.some(m => m._id === msg._id)) return prev;
          // Remove the optimistic message (matched by tempId) and replace with DB version
          if (msg.tempId) {
            const filtered = prev.filter(m => m.tempId !== msg.tempId);
            return [...filtered, msg];
          }
          return [...prev, msg];
        });
        scrollToBottom();
      }
      
      // Update conversations list
      fetchConversations();
    };

    const handleMessageSaved = ({ tempId, savedMessage }) => {
      // Replace the optimistic/pending message with the real DB message
      setMessages((prev) => prev.map(m => 
        m.tempId === tempId ? { ...savedMessage, status: 'sent' } : m
      ));
    };

    const handleMessageError = ({ tempId, error }) => {
      // Mark the optimistic message as failed
      setMessages((prev) => prev.map(m =>
        m.tempId === tempId ? { ...m, status: 'failed' } : m
      ));
      console.error('Message send failed:', error);
    };

    const handleTyping = (name) => setTypingUser(name);
    const handleStopTyping = () => setTypingUser('');

    socket.on('message_received', handleNewMessage);
    socket.on('message_saved', handleMessageSaved);
    socket.on('message_error', handleMessageError);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('message_received', handleNewMessage);
      socket.off('message_saved', handleMessageSaved);
      socket.off('message_error', handleMessageError);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, fetchConversations]);

  // 5. Helpers
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !activeChat) return;

    const room = activeChat.id;
    socket.emit('typing', { room, user: user.name.split(' ')[0] });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', room);
    }, 2000);
  };

  // Retry a failed message
  const retryMessage = (failedMsg) => {
    setMessages((prev) => prev.filter(m => m.tempId !== failedMsg.tempId));
    // Re-send it
    const msgData = {
      tempId: failedMsg.tempId,
      sender: { _id: user._id, name: user.name },
      content: failedMsg.content,
    };
    if (activeChat.type === 'direct') {
      msgData.receiver = { _id: activeChat.id };
    } else {
      msgData.trip = activeChat.id;
    }

    // Add optimistic message back
    const optimistic = {
      tempId: failedMsg.tempId,
      sender: { _id: user._id, name: user.name },
      content: failedMsg.content,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    if (socket && isConnected) {
      socket.emit('new_message', msgData);
    } else {
      // Fallback: send via REST API
      sendViaRest(msgData, failedMsg.tempId);
    }
  };

  // REST API fallback for when socket is down
  const sendViaRest = async (msgData, tempId) => {
    try {
      const payload = {
        content: msgData.content,
        receiver: msgData.receiver?._id,
        trip: msgData.trip,
      };
      const url = msgData.trip 
        ? `/messages/trip/${msgData.trip}` 
        : `/messages/${msgData.receiver._id}`;
      
      const { data } = await API.post(url, payload);
      
      // Replace optimistic message with saved version
      setMessages((prev) => prev.map(m =>
        m.tempId === tempId ? { ...data.data, status: 'sent' } : m
      ));
      fetchConversations();
    } catch (err) {
      // Mark as failed
      setMessages((prev) => prev.map(m =>
        m.tempId === tempId ? { ...m, status: 'failed' } : m
      ));
      console.error('REST fallback send failed:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const content = newMessage.trim();

    // Optimistic update: show message immediately with "sending" status
    const optimisticMsg = {
      tempId,
      sender: { _id: user._id, name: user.name },
      content,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');
    scrollToBottom();

    // Stop typing immediately
    if (socket) {
      socket.emit('stop_typing', activeChat.id);
    }

    const msgData = {
      tempId,
      sender: { _id: user._id, name: user.name },
      content,
    };

    if (activeChat.type === 'direct') {
      msgData.receiver = { _id: activeChat.id };
    } else {
      msgData.trip = activeChat.id;
    }

    // Try socket first, fallback to REST
    if (socket && isConnected) {
      socket.emit('new_message', msgData);
      // Set a timeout — if no ack within 5s, try REST fallback
      setTimeout(() => {
        setMessages((prev) => {
          const msg = prev.find(m => m.tempId === tempId);
          if (msg && msg.status === 'sending') {
            // Still pending — try REST
            sendViaRest(msgData, tempId);
          }
          return prev;
        });
      }, 5000);
    } else {
      // Socket is down, use REST directly
      sendViaRest(msgData, tempId);
    }
  };

  // ─── Render ───
  return (
    <div className="messages-page animate-fade-in">
      {/* Sidebar */}
      <div className="messages-sidebar">
        <div className="messages-sidebar__header">
          <h2>Messages</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: isConnected ? '#10b981' : '#ef4444' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#ef4444', display: 'inline-block' }}></span>
            {isConnected ? 'Live' : 'Reconnecting...'}
          </div>
        </div>
        <div className="messages-sidebar__list">
          {conversations.map((conv) => (
            <div 
              key={conv._id} 
              className={`conversation-item ${activeChat?.id === conv._id ? 'active' : ''}`}
              onClick={() => {
                setSearchParams({ user: conv._id });
              }}
            >
              <div className="conversation-avatar">
                {conv.profilePicture ? (
                  <img src={conv.profilePicture} alt={conv.name} />
                ) : (
                  conv.name?.charAt(0)
                )}
                {onlineUsers.includes(conv._id) && <div className="online-indicator"></div>}
              </div>
              <div className="conversation-info">
                <h4>{conv.name}</h4>
                <p>{conv.latestMessage}</p>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <p style={{ padding: '1.5rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              No recent conversations. Head to Buddy Finder to start chatting!
            </p>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {activeChat ? (
          <>
            <div className="chat-window__header">
              <div className="conversation-avatar" style={{ width: '40px', height: '40px' }}>
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

            <div className="chat-window__messages">
              {messages.map((msg, i) => {
                const isMe = msg.sender._id === user._id;
                return (
                  <div key={msg._id || msg.tempId || i} className={`message-bubble ${isMe ? 'sent' : 'received'} ${msg.status === 'failed' ? 'failed' : ''}`}>
                    {!isMe && activeChat.type === 'trip' && (
                      <div className="message-sender">{msg.sender.name}</div>
                    )}
                    {msg.content}
                    <div className="message-time">
                      {msg.status === 'sending' && <span className="msg-status sending">⏳</span>}
                      {msg.status === 'failed' && (
                        <span 
                          className="msg-status failed" 
                          onClick={() => retryMessage(msg)}
                          title="Click to retry"
                          style={{ cursor: 'pointer' }}
                        >
                          ❌ Tap to retry
                        </span>
                      )}
                      {!msg.status && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.status === 'sent' && (
                        <>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="msg-status sent"> ✓</span>
                        </>
                      )}
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
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
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
