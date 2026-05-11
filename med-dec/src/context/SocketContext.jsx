import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import soundService from '../utils/soundService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.IO server
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);

        // Join user-specific room
        newSocket.emit('join-user-room', user._id);

        // Join role-specific room
        newSocket.emit('join-role-room', user.role);

        // Subscribe to order updates if user has active orders
        if (user.role === 'patient' && user.activeOrders) {
          user.activeOrders.forEach(orderId => {
            newSocket.emit('subscribe-order', orderId);
          });
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Notification events
      newSocket.on('order-placed', (data) => {
        soundService.play('orderUpdate');
        addNotification({
          id: Date.now(),
          type: 'order-placed',
          title: 'Order Placed',
          message: `Your order ${data.orderId} has been placed successfully`,
          orderId: data.orderId,
          timestamp: new Date(),
          read: false
        });
      });

      newSocket.on('pharmacy-response', (data) => {
        soundService.play('orderUpdate');
        addNotification({
          id: Date.now(),
          type: 'pharmacy-response',
          title: data.accepted ? 'Order Accepted' : 'Order Rejected',
          message: data.accepted
            ? `Pharmacy has accepted your order ${data.orderId}`
            : `Pharmacy has rejected your order ${data.orderId}. Reason: ${data.reason || 'Not specified'}`,
          orderId: data.orderId,
          timestamp: new Date(),
          read: false
        });
      });

      newSocket.on('logistics-assigned', (data) => {
        soundService.play('orderUpdate');
        addNotification({
          id: Date.now(),
          type: 'logistics-assigned',
          title: 'Delivery Assigned',
          message: `A delivery driver has been assigned to your order ${data.orderId}`,
          orderId: data.orderId,
          timestamp: new Date(),
          read: false
        });
      });

      newSocket.on('delivery-update', (data) => {
        soundService.play('orderUpdate');
        addNotification({
          id: Date.now(),
          type: 'delivery-update',
          title: 'Delivery Update',
          message: `Your order ${data.orderId} is ${data.status.replace('_', ' ')}`,
          orderId: data.orderId,
          timestamp: new Date(),
          read: false
        });
      });

      newSocket.on('delivery-completed', (data) => {
        soundService.play('orderUpdate');
        addNotification({
          id: Date.now(),
          type: 'delivery-completed',
          title: 'Order Delivered',
          message: `Your order ${data.orderId} has been delivered successfully`,
          orderId: data.orderId,
          timestamp: new Date(),
          read: false
        });
      });

      // Chat-related events
      newSocket.on('chat_invitation', (data) => {
        soundService.play('notification');
        addNotification({
          id: Date.now(),
          type: 'chat_invitation',
          title: 'New Chat Started',
          message: `${data.senderName} (${data.senderRole}) started a chat regarding order ${data.orderId}`,
          chatId: data.chatId,
          orderId: data.orderId,
          timestamp: new Date(),
          read: false
        });
      });

      newSocket.on('new_chat_message', (data) => {
        soundService.play('notification');
        addNotification({
          id: Date.now(),
          type: 'new_chat_message',
          title: 'New Message',
          message: `${data.senderName}: ${data.message}`,
          chatId: data.chatId,
          orderId: data.orderId,
          timestamp: new Date(),
          read: false
        });
      });

      newSocket.on('call_request', (data) => {
        soundService.play('incomingCall');
        addNotification({
          id: Date.now(),
          type: 'call_request',
          title: 'Call Request',
          message: `${data.requesterName} wants a ${data.targetRole === 'logistics' ? 'rider' : 'pharmacy'} callback for order ${data.orderId}`,
          orderId: data.orderId,
          timestamp: new Date(),
          read: false
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const subscribeToOrder = (orderId) => {
    if (socket && socket.connected) {
      socket.emit('subscribe-order', orderId);
    }
  };

  const unsubscribeFromOrder = (orderId) => {
    if (socket && socket.connected) {
      socket.emit('unsubscribe-order', orderId);
    }
  };

  const value = {
    socket,
    notifications,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    subscribeToOrder,
    unsubscribeFromOrder
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};