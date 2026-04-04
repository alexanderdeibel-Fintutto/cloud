import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string | null;
  title: string | null;
  message: string | null;
  type: string | null;
  is_read: boolean | null;
  action_url: string | null;
  app_id: string | null;
  created_at: string | null;
}

export interface EmailEvent {
  id: string;
  event_type: string | null;
  email: string | null;
  subject: string | null;
  template_id: string | null;
  message_id: string | null;
  created_at: string | null;
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Notification[];
    },
  });
}

export function useEmailEvents() {
  return useQuery({
    queryKey: ['email-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as EmailEvent[];
    },
  });
}

export function useNotificationStats() {
  const { data: notifications } = useNotifications();
  const { data: emails } = useEmailEvents();

  return {
    totalNotifications: notifications?.length || 0,
    unread: notifications?.filter(n => !n.is_read).length || 0,
    totalEmails: emails?.length || 0,
    byType: notifications?.reduce((acc, n) => {
      const type = n.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
    emailByEvent: emails?.reduce((acc, e) => {
      const type = e.event_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };
}
