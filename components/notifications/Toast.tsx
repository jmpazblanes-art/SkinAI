import React, { useEffect, useState } from 'react';
import { Notification } from '../../types';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const ICONS = {
  success: <i className="iconoir-check-circle h-6 w-6 text-primary"></i>,
  error: <i className="iconoir-xmark-circle h-6 w-6 text-red-500"></i>,
  info: <i className="iconoir-info-circle h-6 w-6 text-blue-500"></i>,
};

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        handleClose();
    }, 4700); // Start fade out before the 5s removal timeout

    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(onClose, 300); // Wait for fade-out animation to complete
  };

  const animationClass = isFadingOut ? 'animate-fade-out' : 'animate-fade-in-right';

  return (
    <div
      role="alert"
      className={`relative flex items-start w-full max-w-sm p-4 bg-base-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 ${animationClass}`}
    >
      <div className="flex-shrink-0">{ICONS[notification.type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-base-content">{notification.message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={handleClose}
          className="inline-flex text-gray-400 bg-transparent rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <span className="sr-only">Close</span>
          <i className="iconoir-xmark h-5 w-5"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;