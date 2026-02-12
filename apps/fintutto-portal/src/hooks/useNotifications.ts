import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'invoice-due'
  | 'invoice-overdue'
  | 'payment-received'
  | 'low-balance'
  | 'budget-exceeded'
  | 'recurring-due'
  | 'tax-reminder'
  | 'backup-reminder'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  dismissed: boolean;
  link?: string;
  created_at: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  enabled: boolean;
  categories: {
    [key in NotificationType]?: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NOTIFICATIONS_STORAGE_KEY = 'fintutto_notifications';
const SETTINGS_STORAGE_KEY = 'fintutto_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  categories: {
    'info': true,
    'success': true,
    'warning': true,
    'error': true,
    'invoice-due': true,
    'invoice-overdue': true,
    'payment-received': true,
    'low-balance': true,
    'budget-exceeded': true,
    'recurring-due': true,
    'tax-reminder': true,
    'backup-reminder': true,
    'system': true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export function useNotifications() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (!currentCompany) return;

    const storedSettings = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_${currentCompany.id}`);
    if (storedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, [currentCompany]);

  // Fetch from Supabase or localStorage
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Try Supabase first
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications from Supabase:', error);
      // Fall back to localStorage
      setUseLocalStorage(true);
      loadFromLocalStorage();
    } else if (data) {
      const typedData: Notification[] = data.map(n => ({
        id: n.id,
        type: (n.type || 'info') as NotificationType,
        title: n.title,
        message: n.message,
        priority: 'medium' as NotificationPriority,
        read: n.read || false,
        dismissed: false,
        link: n.link || undefined,
        created_at: n.created_at,
      }));
      setNotifications(typedData);
      setUnreadCount(typedData.filter(n => !n.read).length);
    }
    setLoading(false);
  }, [user]);

  // Load from localStorage fallback
  const loadFromLocalStorage = useCallback(() => {
    if (!currentCompany) return;

    const stored = localStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${currentCompany.id}`);
    if (stored) {
      try {
        const parsed: Notification[] = JSON.parse(stored);
        // Filter out expired and dismissed
        const now = new Date().toISOString();
        const valid = parsed.filter(n =>
          !n.dismissed &&
          (!n.expires_at || n.expires_at > now)
        );
        setNotifications(valid);
        setUnreadCount(valid.filter(n => !n.read).length);
      } catch {
        // Generate demo notifications
        const demo = generateDemoNotifications();
        setNotifications(demo);
        setUnreadCount(demo.filter(n => !n.read).length);
      }
    } else {
      const demo = generateDemoNotifications();
      setNotifications(demo);
      setUnreadCount(demo.filter(n => !n.read).length);
    }
  }, [currentCompany]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Save to localStorage
  const saveToLocalStorage = useCallback((list: Notification[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${currentCompany.id}`, JSON.stringify(list));
  }, [currentCompany]);

  // Save settings
  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    if (!currentCompany) return;
    localStorage.setItem(`${SETTINGS_STORAGE_KEY}_${currentCompany.id}`, JSON.stringify(newSettings));
    setSettings(newSettings);
  }, [currentCompany]);

  // Add notification
  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read' | 'dismissed'>) => {
    if (!settings.enabled) return;
    if (settings.categories[notification.type] === false) return;

    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = settings.quietHours.start.split(':').map(Number);
      const [endH, endM] = settings.quietHours.end.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (startMinutes > endMinutes) {
        if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) return;
      } else {
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return;
      }
    }

    if (useLocalStorage || !user) {
      // Add to localStorage
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        read: false,
        dismissed: false,
      };
      const updated = [newNotification, ...notifications];
      setNotifications(updated);
      setUnreadCount(prev => prev + 1);
      saveToLocalStorage(updated);
      return newNotification;
    }

    // Add to Supabase
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding notification:', error);
      return;
    }

    if (data) {
      const typedData: Notification = {
        id: data.id,
        type: data.type as NotificationType,
        title: data.title,
        message: data.message,
        priority: notification.priority || 'medium',
        read: false,
        dismissed: false,
        link: data.link || undefined,
        created_at: data.created_at,
      };
      setNotifications(prev => [typedData, ...prev]);
      setUnreadCount(prev => prev + 1);
      return typedData;
    }
  };

  // Mark as read
  const markAsRead = async (id: string) => {
    if (useLocalStorage || !user) {
      const updated = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read).length);
      saveToLocalStorage(updated);
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (useLocalStorage || !user) {
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
      saveToLocalStorage(updated);
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Dismiss notification
  const dismissNotification = async (id: string) => {
    if (useLocalStorage || !user) {
      const updated = notifications.map(n =>
        n.id === id ? { ...n, dismissed: true } : n
      );
      setNotifications(updated.filter(n => !n.dismissed));
      setUnreadCount(updated.filter(n => !n.read && !n.dismissed).length);
      saveToLocalStorage(updated);
      return;
    }

    await deleteNotification(id);
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    const notification = notifications.find(n => n.id === id);

    if (useLocalStorage || !user) {
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      saveToLocalStorage(updated);
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return;
    }

    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Clear all
  const clearAll = async () => {
    if (useLocalStorage || !user) {
      setNotifications([]);
      setUnreadCount(0);
      if (currentCompany) {
        localStorage.removeItem(`${NOTIFICATIONS_STORAGE_KEY}_${currentCompany.id}`);
      }
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing notifications:', error);
      return;
    }

    setNotifications([]);
    setUnreadCount(0);
  };

  // Update settings
  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    saveSettings({ ...settings, ...updates });
  }, [settings, saveSettings]);

  // Toggle category
  const toggleCategory = useCallback((category: NotificationType) => {
    saveSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [category]: !settings.categories[category],
      },
    });
  }, [settings, saveSettings]);

  // Get visible (not dismissed)
  const visibleNotifications = notifications.filter(n => !n.dismissed);

  // Get by priority
  const urgentNotifications = visibleNotifications.filter(n => n.priority === 'urgent');
  const highPriorityNotifications = visibleNotifications.filter(n => n.priority === 'high');

  return {
    notifications: visibleNotifications,
    allNotifications: notifications,
    unreadCount,
    urgentNotifications,
    highPriorityNotifications,
    settings,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    deleteNotification,
    clearAll,
    updateSettings,
    toggleCategory,
    refetch: fetchNotifications,
  };
}

function generateDemoNotifications(): Notification[] {
  const now = new Date();

  return [
    {
      id: 'demo-1',
      type: 'invoice-overdue',
      title: 'Überfällige Rechnung',
      message: 'Rechnung RE-2026-0042 an Mustermann GmbH ist seit 5 Tagen überfällig.',
      priority: 'urgent',
      read: false,
      dismissed: false,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      link: '/rechnungen',
      metadata: { invoiceId: 'inv-123', amount: 4500 },
    },
    {
      id: 'demo-2',
      type: 'invoice-due',
      title: 'Rechnung fällig in 3 Tagen',
      message: 'Rechnung RE-2026-0045 an Tech Solutions AG ist in 3 Tagen fällig.',
      priority: 'high',
      read: false,
      dismissed: false,
      created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      link: '/rechnungen',
    },
    {
      id: 'demo-3',
      type: 'low-balance',
      title: 'Niedriger Kontostand',
      message: 'Das Geschäftskonto hat den Mindeststand von 5.000 € unterschritten.',
      priority: 'high',
      read: false,
      dismissed: false,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      link: '/bankkonten',
      metadata: { currentBalance: 3245.50, threshold: 5000 },
    },
    {
      id: 'demo-4',
      type: 'budget-exceeded',
      title: 'Budget überschritten',
      message: 'Das Marketingbudget für Februar wurde um 15% überschritten.',
      priority: 'medium',
      read: false,
      dismissed: false,
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      link: '/budget',
    },
    {
      id: 'demo-5',
      type: 'payment-received',
      title: 'Zahlung eingegangen',
      message: 'Zahlung von 8.200 € von Tech Solutions AG eingegangen.',
      priority: 'low',
      read: true,
      dismissed: false,
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-6',
      type: 'recurring-due',
      title: 'Wiederkehrende Buchung',
      message: 'Die monatliche Mietzahlung (2.500 €) ist morgen fällig.',
      priority: 'medium',
      read: false,
      dismissed: false,
      created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      link: '/wiederkehrend',
    },
    {
      id: 'demo-7',
      type: 'tax-reminder',
      title: 'USt-Voranmeldung fällig',
      message: 'Die Umsatzsteuer-Voranmeldung für Januar muss bis zum 10. Februar eingereicht werden.',
      priority: 'high',
      read: false,
      dismissed: false,
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      link: '/elster',
    },
    {
      id: 'demo-8',
      type: 'backup-reminder',
      title: 'Datensicherung empfohlen',
      message: 'Sie haben Ihre Daten seit 14 Tagen nicht gesichert.',
      priority: 'low',
      read: true,
      dismissed: false,
      created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      link: '/backup',
    },
  ];
}

// Notification type config
export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, {
  label: string;
  color: string;
  icon: string;
}> = {
  'info': { label: 'Information', color: 'blue', icon: 'Info' },
  'success': { label: 'Erfolg', color: 'green', icon: 'CheckCircle' },
  'warning': { label: 'Warnung', color: 'orange', icon: 'AlertTriangle' },
  'error': { label: 'Fehler', color: 'red', icon: 'XCircle' },
  'invoice-due': { label: 'Rechnung fällig', color: 'orange', icon: 'FileText' },
  'invoice-overdue': { label: 'Rechnung überfällig', color: 'red', icon: 'AlertTriangle' },
  'payment-received': { label: 'Zahlung eingegangen', color: 'green', icon: 'CheckCircle' },
  'low-balance': { label: 'Niedriger Kontostand', color: 'red', icon: 'Wallet' },
  'budget-exceeded': { label: 'Budget überschritten', color: 'orange', icon: 'Target' },
  'recurring-due': { label: 'Wiederkehrende Buchung', color: 'blue', icon: 'RefreshCw' },
  'tax-reminder': { label: 'Steuer-Erinnerung', color: 'purple', icon: 'FileText' },
  'backup-reminder': { label: 'Backup-Erinnerung', color: 'gray', icon: 'HardDrive' },
  'system': { label: 'System', color: 'gray', icon: 'Settings' },
};

export const PRIORITY_CONFIG: Record<NotificationPriority, {
  label: string;
  color: string;
}> = {
  low: { label: 'Niedrig', color: 'gray' },
  medium: { label: 'Mittel', color: 'blue' },
  high: { label: 'Hoch', color: 'orange' },
  urgent: { label: 'Dringend', color: 'red' },
};
