import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import useAuth from '../../hooks/useAuth';
import './Messages.css';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const targetTripId = searchParams.get('trip');

  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { type: 'direct'|'trip', id: string, name: string }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef(null);
  let typingTimeout = useRef(null);

  // 1. Fetch recent conversations list
  const fetchConversations = async () => {
    try {
      const { data } = await API.get('/messages/conversations');
      setConversations(data.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

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

  // 4. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Check if message belongs to current active chat
      const isForCurrentDirect = activeChat?.type === 'direct' && (msg.sender._id === activeChat.id || msg.receiver === activeChat.id);
      const isForCurrentTrip = activeChat?.type === 'trip' && msg.trip === activeChat.id;

      if (isForCurrentDirect || isForCurrentTrip) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
      
      // Update conversations list (pull it again to be safe and simple)
      fetchConversations();
    };

    const handleTyping = (name) => setTypingUser(name);
    const handleStopTyping = () => setTypingUser('');

    socket.on('message_received', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('message_received', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, activeChat]);

  // 5. Helpers
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !activeChat) return;

    const room = activeChat.type === 'trip' ? activeChat.id : activeChat.id;
    socket.emit('typing', { room, user: user.name.split(' ')[0] });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', room);
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeChat) return;

    const msgData = {
      sender: { _id: user._id, name: user.name },
      content: newMessage,
    };

    if (activeChat.type === 'direct') {
      msgData.receiver = { _id: activeChat.id };
    } else {
      msgData.trip = activeChat.id;
    }

    socket.emit('new_message', msgData);
    
    // Stop typing immediately
    const room = activeChat.type === 'trip' ? activeChat.id : activeChat.id;
    socket.emit('stop_typing', room);

    setNewMessage('');
  };

  // ─── Render ───
  return (
    <div className="messages-page animate-fade-in">
      {/* Sidebar */}
      <div className="messages-sidebar">
        <div className="messages-sidebar__header">
          <h2>Messages</h2>
        </div>
        <div className="messages-sidebar__list">
          {conversations.map((conv) => (
            <div 
              key={conv._id} 
              className={`conversation-item ${activeChat?.id === conv._id ? 'active' : ''}`}
              onClick={() => {
                setSearchParams({ user: conv._id }); // Assuming direct for now from list
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
                  <div key={i} className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                    {!isMe && activeChat.type === 'trip' && (
                      <div className="message-sender">{msg.sender.name}</div>
                    )}
                    {msg.content}
                    <div className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
