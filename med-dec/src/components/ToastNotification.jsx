import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import './ToastNotification.css';

const ToastNotification = () => {
  const { notifications } = useSocket();
  const [visibleToasts, setVisibleToasts] = useState([]);

  useEffect(() => {
    // Show toast for new unread notifications
    const newUnreadNotifications = notifications.filter(n => !n.read);

    newUnreadNotifications.forEach(notification => {
      if (!visibleToasts.find(toast => toast.id === notification.id)) {
        setVisibleToasts(prev => [...prev, { ...notification, show: true }]);

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setVisibleToasts(prev =>
            prev.map(toast =>
              toast.id === notification.id ? { ...toast, show: false } : toast
            )
          );

          // Remove from DOM after animation
          setTimeout(() => {
            setVisibleToasts(prev => prev.filter(toast => toast.id !== notification.id));
          }, 300);
        }, 5000);
      }
    });
  }, [notifications, visibleToasts]);

  const dismissToast = (id) => {
    setVisibleToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, show: false } : toast
      )
    );

    setTimeout(() => {
      setVisibleToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div className="toast-container">
      {visibleToasts.map(toast => (
        <div
          key={toast.id}
          className={`toast-notification ${toast.show ? 'show' : 'hide'}`}
        >
          <div className="toast-icon">
            {toast.type === 'order-placed' && <i className="fas fa-shopping-cart"></i>}
            {toast.type === 'pharmacy-response' && toast.title.includes('Accepted') && <i className="fas fa-check-circle"></i>}
            {toast.type === 'pharmacy-response' && toast.title.includes('Rejected') && <i className="fas fa-times-circle"></i>}
            {toast.type === 'logistics-assigned' && <i className="fas fa-truck"></i>}
            {toast.type === 'delivery-update' && <i className="fas fa-shipping-fast"></i>}
            {toast.type === 'delivery-completed' && <i className="fas fa-box-open"></i>}
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button
            className="toast-close"
            onClick={() => dismissToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;