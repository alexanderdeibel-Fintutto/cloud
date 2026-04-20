import {
  Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle,
  Trash2, FileText, Wallet, Target, RefreshCw, HardDrive, Settings, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications, type Notification, type NotificationType, PRIORITY_CONFIG } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bgColor: string }> = {
  'info': { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  'success': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  'warning': { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  'error': { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  'invoice-due': { icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  'invoice-overdue': { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  'payment-received': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  'low-balance': { icon: Wallet, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  'budget-exceeded': { icon: Target, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  'recurring-due': { icon: RefreshCw, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  'tax-reminder': { icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  'backup-reminder': { icon: HardDrive, color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
  'system': { icon: Settings, color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
};

const priorityColors: Record<string, string> = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
};

export function NotificationCenter() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    urgentNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  const recentNotifications = notifications.slice(0, 10);
  const hasUrgent = urgentNotifications.length > 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", hasUrgent && "animate-pulse")}
        >
          <Bell className={cn("h-5 w-5", hasUrgent && "text-red-500")} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
                hasUrgent && "bg-red-600"
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h4 className="font-semibold">Benachrichtigungen</h4>
            {hasUrgent && (
              <p className="text-xs text-red-500 font-medium">
                {urgentNotifications.length} dringende Meldung{urgentNotifications.length !== 1 ? 'en' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-8">
              <CheckCheck className="h-3 w-3 mr-1" />
              Alle gelesen
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm font-medium">Keine Benachrichtigungen</p>
              <p className="text-xs mt-1">Sie sind auf dem neuesten Stand!</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => {
                const config = typeConfig[notification.type] || typeConfig.info;
                const Icon = config.icon;
                const priorityClass = priorityColors[notification.priority] || priorityColors.medium;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-3 hover:bg-accent/50 transition-colors cursor-pointer group border-l-4',
                      priorityClass,
                      !notification.read && 'bg-accent/20'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={cn('p-2 rounded-full shrink-0', config.bgColor)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              'text-sm font-medium truncate',
                              !notification.read && 'font-semibold'
                            )}>
                              {notification.title}
                            </p>
                            {notification.priority === 'urgent' && (
                              <Badge variant="destructive" className="h-5 text-[10px]">
                                Dringend
                              </Badge>
                            )}
                            {notification.priority === 'high' && (
                              <Badge variant="outline" className="h-5 text-[10px] border-orange-500 text-orange-500">
                                Wichtig
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: de })}
                          </p>
                          {notification.link && (
                            <span className="text-xs text-primary">Anzeigen →</span>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2 flex gap-2">
          <Button variant="ghost" className="flex-1 justify-center text-sm" asChild>
            <Link to="/benachrichtigungen">Alle anzeigen</Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/benachrichtigungen?tab=settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
