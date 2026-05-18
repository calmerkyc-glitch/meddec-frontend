import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { backendFetch } from '../utils/api';
import soundService from '../utils/soundService';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useSocket();
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const [volume, setVolume] = useState(soundService.getVolume());
  const [respondingTo, setRespondingTo] = useState(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMuteToggle = () => {
    const newMutedState = soundService.toggleMute();
    setIsMuted(newMutedState);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    soundService.setVolume(newVolume);
    setVolume(newVolume);
  };

  const handleCallResponse = async (notification, response) => {
    if (!notification.requesterId) {
      console.error('[NotificationBell] Cannot respond: requesterID not found');
      return;
    }

    setRespondingTo(notification.id);
    try {
      console.log('[NotificationBell] Sending call response:', response);
      const result = await backendFetch('/api/chat/call-response', {
        token,
        method: 'POST',
        body: JSON.stringify({
          orderId: notification.orderId,
          requesterId: notification.requesterId,
          response
        })
      });
      const data = await result.json();
      if (!result.ok) {
        console.error('[NotificationBell] Call response failed:', data);
        alert('Failed to respond to call');
        return;
      }
      markAsRead(notification.id);
    } catch (error) {
      console.error('[NotificationBell] Error:', error);
      alert('Error responding to call');
    } finally {
      setRespondingTo(null);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle chat notifications
    if (notification.type === 'chat_invitation' || notification.type === 'new_chat_message') {
      // Emit event to open chat (handled by ChatManager)
      window.dispatchEvent(new CustomEvent('openChat', {
        detail: { chatId: notification.chatId, orderId: notification.orderId }
      }));
    }

    // Close notification panel
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="notification-container">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              <div className="sound-controls">
                <button
                  onClick={handleMuteToggle}
                  className={`mute-btn ${isMuted ? 'muted' : ''}`}
                  title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                >
                  <i className={`fas fa-${isMuted ? 'volume-mute' : 'volume-up'}`}></i>
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  title={`Volume: ${Math.round(volume * 100)}%`}
                />
              </div>
              {notifications.length > 0 && (
                <>
                  <button onClick={markAllAsRead} className="mark-read-btn">
                    Mark all read
                  </button>
                  <button onClick={clearNotifications} className="clear-btn">
                    Clear all
                  </button>
                </>
              )}
              <button onClick={() => setIsOpen(false)} className="close-btn">
                ×
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <i className="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.type === 'order-placed' && <i className="fas fa-shopping-cart"></i>}
                    {notification.type === 'pharmacy-response' && notification.title.includes('Accepted') && <i className="fas fa-check-circle"></i>}
                    {notification.type === 'pharmacy-response' && notification.title.includes('Rejected') && <i className="fas fa-times-circle"></i>}
                    {notification.type === 'logistics-assigned' && <i className="fas fa-truck"></i>}
                    {notification.type === 'delivery-update' && <i className="fas fa-shipping-fast"></i>}
                    {notification.type === 'delivery-completed' && <i className="fas fa-box-open"></i>}
                    {notification.type === 'call_request' && <i className="fas fa-phone-square-alt"></i>}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.timestamp)}</div>
                    {notification.type === 'call_request' && (
                      <div className="call-actions">
                        <button
                          className="call-accept-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallResponse(notification, 'accepted');
                          }}
                          disabled={respondingTo === notification.id}
                        >
                          {respondingTo === notification.id ? 'Processing...' : '✓ Accept'}
                        </button>
                        <button
                          className="call-decline-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallResponse(notification, 'declined');
                          }}
                          disabled={respondingTo === notification.id}
                        >
                          {respondingTo === notification.id ? 'Processing...' : '✕ Decline'}
                        </button>
                      </div>
                    )}
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;