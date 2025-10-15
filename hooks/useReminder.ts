import { useEffect } from 'react';

interface Reminder {
  enabled: boolean;
  time: string; // HH:mm format
}

interface ReminderSettings {
  morning: Reminder;
  evening: Reminder;
}

const showNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/vite.svg', // Optional: add an icon
    });
  }
};

export const useReminder = () => {
  useEffect(() => {
    const checkReminders = () => {
      try {
        const settings: ReminderSettings | null = JSON.parse(localStorage.getItem('reminderSettings') || 'null');
        if (!settings) return;

        // Fix: Corrected typo `new today()` to `new Date()`.
        const now = new Date();
        const todayStr = now.toLocaleDateString();

        // Check morning reminder
        if (settings.morning.enabled) {
          const lastSent = localStorage.getItem('lastMorningNotification');
          const [hour, minute] = settings.morning.time.split(':').map(Number);
          if (now.getHours() === hour && now.getMinutes() === minute && lastSent !== todayStr) {
            showNotification('Rutina Matutina ☀️', '¡Es hora de empezar tu rutina de cuidado de la piel de la mañana!');
            localStorage.setItem('lastMorningNotification', todayStr);
          }
        }

        // Check evening reminder
        if (settings.evening.enabled) {
          const lastSent = localStorage.getItem('lastEveningNotification');
          const [hour, minute] = settings.evening.time.split(':').map(Number);
          if (now.getHours() === hour && now.getMinutes() === minute && lastSent !== todayStr) {
            showNotification('Rutina Nocturna 🌙', '¡No te olvides de tu rutina de cuidado de la piel de la noche!');
            localStorage.setItem('lastEveningNotification', todayStr);
          }
        }
      } catch (error) {
        console.error("Failed to parse reminder settings:", error);
      }
    };

    // Check every 30 seconds
    const intervalId = setInterval(checkReminders, 30000);

    // Initial check on mount
    checkReminders();

    return () => clearInterval(intervalId);
  }, []);
};
