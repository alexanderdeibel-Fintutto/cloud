import { useEffect, useCallback, useRef } from 'react';
import { CareReminder } from '@/types';

const STORAGE_KEY = 'pm_notifications_enabled';
const LAST_NOTIFIED_KEY = 'pm_last_notified';
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

function getNotificationsEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setNotificationsEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

function getLastNotified(): string | null {
  try {
    return localStorage.getItem(LAST_NOTIFIED_KEY);
  } catch {
    return null;
  }
}

function setLastNotified() {
  localStorage.setItem(LAST_NOTIFIED_KEY, new Date().toISOString());
}

export function useNotifications(getOverdueReminders: () => CareReminder[]) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const isEnabled = getNotificationsEnabled();

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const result = await Notification.requestPermission();
    if (result === 'granted') {
      setNotificationsEnabled(true);
      return true;
    }
    return false;
  }, [isSupported]);

  const disable = useCallback(() => {
    setNotificationsEnabled(false);
  }, []);

  const sendNotification = useCallback(
    (title: string, body: string) => {
      if (!isSupported || Notification.permission !== 'granted') return;
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'plant-care-reminder',
        });
      } catch {
        // Notification constructor can fail in some environments
      }
    },
    [isSupported]
  );

  const checkAndNotify = useCallback(() => {
    if (!isEnabled || !isSupported || Notification.permission !== 'granted')
      return;

    // Only notify once per 4 hours
    const lastNotified = getLastNotified();
    if (lastNotified) {
      const hoursSince =
        (Date.now() - new Date(lastNotified).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 4) return;
    }

    const overdue = getOverdueReminders();
    if (overdue.length === 0) return;

    const waterCount = overdue.filter((r) => r.type === 'water').length;
    const fertilizeCount = overdue.filter((r) => r.type === 'fertilize').length;

    const parts: string[] = [];
    if (waterCount > 0)
      parts.push(
        `${waterCount} ${waterCount === 1 ? 'Pflanze muss' : 'Pflanzen muessen'} gegossen werden`
      );
    if (fertilizeCount > 0)
      parts.push(
        `${fertilizeCount} ${fertilizeCount === 1 ? 'Pflanze muss' : 'Pflanzen muessen'} geduengt werden`
      );

    sendNotification(
      `Pflanzen-Pflege faellig!`,
      parts.join(' und ') + '.'
    );
    setLastNotified();
  }, [isEnabled, isSupported, getOverdueReminders, sendNotification]);

  useEffect(() => {
    if (!isEnabled || !isSupported) return;

    // Initial check after a short delay
    const timeout = setTimeout(checkAndNotify, 5000);

    // Periodic checks
    intervalRef.current = setInterval(checkAndNotify, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isEnabled, isSupported, checkAndNotify]);

  return {
    isSupported,
    isEnabled,
    permission: isSupported ? Notification.permission : ('denied' as NotificationPermission),
    requestPermission,
    disable,
    sendNotification,
    checkAndNotify,
  };
}
