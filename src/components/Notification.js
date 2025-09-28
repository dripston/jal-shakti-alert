import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const Notification = () => {
  const { notifications, removeNotification } = useNotifications();

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notifications.length > 0) {
        removeNotification(notifications[0].id);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  const latestNotification = notifications[0];

  const getIcon = (type) => {
    if (type === 'success') {
      return CheckCircle;
    }
    return AlertTriangle;
  };

  const Icon = getIcon(latestNotification.type);

  return React.createElement('div', {
    className: `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      latestNotification.type === 'success' 
        ? 'bg-green-100 border border-green-200' 
        : 'bg-red-100 border border-red-200'
    }`
  },
    React.createElement('div', { className: 'flex items-start' },
      React.createElement('div', {
        className: `flex-shrink-0 ${
          latestNotification.type === 'success' 
            ? 'text-green-600' 
            : 'text-red-600'
        }`
      },
        React.createElement(Icon, { className: 'h-5 w-5' })
      ),
      React.createElement('div', { className: 'ml-3 flex-1' },
        React.createElement('p', {
          className: `text-sm font-medium ${
            latestNotification.type === 'success' 
              ? 'text-green-800' 
              : 'text-red-800'
          }`
        }, latestNotification.title),
        React.createElement('p', {
          className: `mt-1 text-sm ${
            latestNotification.type === 'success' 
              ? 'text-green-700' 
              : 'text-red-700'
          }`
        }, latestNotification.message)
      ),
      React.createElement('div', { className: 'ml-4 flex-shrink-0 flex' },
        React.createElement('button', {
          onClick: () => removeNotification(latestNotification.id),
          className: `inline-flex ${
            latestNotification.type === 'success' 
              ? 'text-green-500 hover:text-green-700' 
              : 'text-red-500 hover:text-red-700'
          }`
        },
          React.createElement(X, { className: 'h-5 w-5' })
        )
      )
    )
  );
};

export default Notification;