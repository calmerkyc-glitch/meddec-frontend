import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { backendFetch } from '../utils/api';
import ChatWidget from './ChatWidget';
import './ChatManager.css';

const ChatManager = () => {
  const { notifications, user } = useSocket();
  const { token } = useAuth();
  const [activeChats, setActiveChats] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState(new Set());

  // Handle chat notifications and custom events
  useEffect(() => {
    const chatNotifications = notifications.filter(n =>
      n.type === 'chat_invitation' || n.type === 'new_chat_message'
    );

    chatNotifications.forEach(notification => {
      if (!activeChats.find(chat => chat.chatId === notification.chatId)) {
        openChat(notification.chatId, notification.orderId);
      }
    });
  }, [notifications, activeChats]);

  // Listen for custom openChat events
  useEffect(() => {
    const handleOpenChat = (event) => {
      const { chatId, orderId } = event.detail;
      openChat(chatId, orderId);
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  // Load user's active chats on mount
  useEffect(() => {
    if (token && user) {
      loadActiveChats();
    }
  }, [token, user]);

  const loadActiveChats = async () => {
    try {
      const response = await backendFetch('/api/chat/chats');
      if (response.ok) {
        const chats = await response.json();
        // Auto-open chats with unread messages
        chats.forEach(chat => {
          if (chat.unreadCount > 0) {
            openChat(chat._id, chat.orderId);
          }
        });
      }
    } catch (error) {
      console.error('Error loading active chats:', error);
    }
  };

  const openChat = async (chatId, orderId) => {
    if (activeChats.find(chat => chat.chatId === chatId)) {
      // Chat already open, just unminimize it
      setMinimizedChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
      return;
    }

    // If no chatId provided, create a new chat for the order
    let finalChatId = chatId;
    if (!chatId && orderId) {
      try {
        const response = await backendFetch(`/api/chat/orders/${orderId}/chat`, {
          method: 'POST',
          body: JSON.stringify({ chatType: 'order-support' })
        });

        if (response.ok) {
          const chatData = await response.json();
          finalChatId = chatData._id;
        }
      } catch (error) {
        console.error('Error creating chat:', error);
        return;
      }
    }

    if (finalChatId) {
      setActiveChats(prev => [...prev, {
        chatId: finalChatId,
        orderId: orderId || 'Unknown'
      }]);
    }
  };

  const closeChat = (chatId) => {
    setActiveChats(prev => prev.filter(chat => chat.chatId !== chatId));
    setMinimizedChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(chatId);
      return newSet;
    });
  };

  const toggleMinimize = (chatId) => {
    setMinimizedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  // Handle notification clicks to open chats
  const handleNotificationClick = (notification) => {
    if (notification.type === 'chat_invitation' || notification.type === 'new_chat_message') {
      openChat(notification.chatId, notification.orderId);
    }
  };

  // Update notification click handler in the context
  useEffect(() => {
    // This would be handled by the notification component
    // For now, we'll handle it through the existing notification system
  }, []);

  if (activeChats.length === 0) {
    return null;
  }

  return (
    <div className="chat-manager">
      {activeChats.map((chat, index) => (
        <div
          key={chat.chatId}
          className="chat-widget-container"
          style={{
            right: `${20 + (index * 370)}px`,
            zIndex: 1000 + index
          }}
        >
          <ChatWidget
            chatId={chat.chatId}
            orderId={chat.orderId}
            onClose={() => closeChat(chat.chatId)}
            isMinimized={minimizedChats.has(chat.chatId)}
            onToggleMinimize={() => toggleMinimize(chat.chatId)}
          />
        </div>
      ))}
    </div>
  );
};

export default ChatManager;