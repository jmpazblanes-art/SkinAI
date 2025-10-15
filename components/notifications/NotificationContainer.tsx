import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import Toast from './Toast';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div 
      aria-live="polite"
      className="fixed top-5 right-5 z-50 space-y-3 w-80"
    >
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;