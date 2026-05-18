import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { backendFetch } from '../utils/api';
import './ChatWidget.css';

const ChatWidget = ({ chatId, orderId, onClose, isMinimized, onToggleMinimize }) => {
  const { socket, user } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatId && socket) {
      if (!socket.connected) {
        console.warn('[ChatWidget] Socket not connected, attempting to reconnect');
        // Try to reconnect
        if (socket.disconnected) {
          socket.connect();
        }
        return;
      }

      console.log('[ChatWidget] Socket connected, joining chat:', chatId);
      // Join chat room
      socket.emit('join-chat', chatId);

      // Load chat and messages
      loadChatAndMessages();

      // Listen for new messages
      socket.on('new-message', (data) => {
        console.log('[ChatWidget] New message received:', data.message);
        if (data.chatId === chatId) {
          setMessages(prev => [...prev, data.message]);
        }
      });

      // Listen for typing indicators
      socket.on('user-typing', (data) => {
        if (data.chatId === chatId && data.userId !== user._id) {
          setTypingUsers(prev => {
            if (!prev.find(u => u.userId === data.userId)) {
              return [...prev, { userId: data.userId, userName: data.userName }];
            }
            return prev;
          });
        }
      });

      socket.on('user-stopped-typing', (data) => {
        if (data.chatId === chatId) {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }
      });

      return () => {
        socket.emit('leave-chat', chatId);
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('user-stopped-typing');
      };
    }
  }, [chatId, socket, user]);

  const loadChatAndMessages = async () => {
    try {
      setLoading(true);
      const [chatResponse, messagesResponse] = await Promise.all([
        backendFetch(`/api/chat/chats/${chatId}`),
        backendFetch(`/api/chat/chats/${chatId}/messages`)
      ]);

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        setChat(chatData);
      }

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!socket || !socket.connected) {
      console.error('[ChatWidget] Socket not connected, cannot send message');
      alert('Connection lost. Please refresh the page.');
      return;
    }

    try {
      const response = await backendFetch(`/api/chat/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: newMessage,
          messageType: 'text'
        })
      });

      if (response.ok) {
        console.log('[ChatWidget] Message sent successfully');
        setNewMessage('');
        stopTyping();
      } else {
        const error = await response.json();
        console.error('[ChatWidget] Failed to send message:', error);
        alert('Failed to send message: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('[ChatWidget] Error sending message:', error);
      alert('Error sending message: ' + error.message);
    }
  };

  const startTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing-start', {
        chatId,
        userId: user._id,
        userName: user.name
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit('typing-stop', {
        chatId,
        userId: user._id
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  const getParticipantName = (userId) => {
    if (!chat) return 'Unknown';
    const participant = chat.participants.find(p => p.userId === userId);
    return participant ? participant.name : 'Unknown';
  };

  const getParticipantRole = (userId) => {
    if (!chat) return '';
    const participant = chat.participants.find(p => p.userId === userId);
    return participant ? participant.role : '';
  };

  if (isMinimized) {
    return (
      <div className="chat-widget minimized" onClick={onToggleMinimize}>
        <div className="chat-header">
          <div className="chat-title">
            <i className="fas fa-comments"></i>
            Chat - Order {orderId}
          </div>
          <div className="chat-actions">
            <button onClick={(e) => { e.stopPropagation(); onClose(); }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        {messages.length > 0 && (
          <div className="last-message-preview">
            <small>{messages[messages.length - 1].senderName}: {messages[messages.length - 1].content.substring(0, 30)}...</small>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div className="chat-title">
          <i className="fas fa-comments"></i>
          Chat - Order {orderId}
        </div>
        <div className="chat-actions">
          <button onClick={onToggleMinimize}>
            <i className="fas fa-minus"></i>
          </button>
          <button onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div className="chat-participants">
        {chat?.participants.map(participant => (
          <div key={participant.userId} className="participant">
            <span className="participant-name">{participant.name}</span>
            <span className={`participant-role ${participant.role}`}>
              {participant.role}
            </span>
          </div>
        ))}
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map(message => (
            <div
              key={message._id}
              className={`message ${message.senderId === user._id ? 'own' : 'other'}`}
            >
              <div className="message-header">
                <span className="sender-name">
                  {message.senderId === user._id ? 'You' : message.senderName}
                </span>
                <span className="sender-role">{getParticipantRole(message.senderId)}</span>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))
        )}

        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.map(user => user.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            startTyping();
          }}
          onKeyDown={stopTyping}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="send-button" disabled={!newMessage.trim()}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;