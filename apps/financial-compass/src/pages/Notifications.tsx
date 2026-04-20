import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle,
  Trash2, Filter, FileText, Wallet, Target, RefreshCw, HardDrive, Settings,
  Clock, BellOff, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useNotifications,
  type Notification,
  type NotificationType,
  NOTIFICATION_TYPE_CONFIG,
  PRIORITY_CONFIG,
} from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bgColor: string; label: string }> = {
  'info': { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Info' },
  'success': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Erfolg' },
  'warning': { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'Warnung' },
  'error': { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'Fehler' },
  'invoice-due': { icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'Fällig' },
  'invoice-overdue': { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'Überfällig' },
  'payment-received': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Zahlung' },
  'low-balance': { icon: Wallet, color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'Kontostand' },
  'budget-exceeded': { icon: Target, color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'Budget' },
  'recurring-due': { icon: RefreshCw, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Wiederkehrend' },
  'tax-reminder': { icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-500/10', label: 'Steuer' },
  'backup-reminder': { icon: HardDrive, color: 'text-gray-500', bgColor: 'bg-gray-500/10', label: 'Backup' },
  'system': { icon: Settings, color: 'text-gray-500', bgColor: 'bg-gray-500/10', label: 'System' },
};

const priorityColors: Record<string, string> = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
};

function groupNotificationsByDate(notifications: Notification[]) {
  const groups: { label: string; notifications: Notification[] }[] = [
    { label: 'Heute', notifications: [] },
    { label: 'Gestern', notifications: [] },
    { label: 'Diese Woche', notifications: [] },
    { label: 'Älter', notifications: [] },
  ];

  notifications.forEach((notification) => {
    const date = parseISO(notification.created_at);
    if (isToday(date)) {
      groups[0].notifications.push(notification);
    } else if (isYesterday(date)) {
      groups[1].notifications.push(notification);
    } else if (isThisWeek(date)) {
      groups[2].notifications.push(notification);
    } else {
      groups[3].notifications.push(notification);
    }
  });

  return groups.filter(g => g.notifications.length > 0);
}

export default function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    notifications,
    unreadCount,
    loading,
    settings,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    updateSettings,
    toggleCategory,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    if (searchParams.get('tab') === 'settings') {
      setActiveTab('settings');
    }
  }, [searchParams]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;
    return true;
  });

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Benachrichtigungen</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} ungelesene Benachrichtigungen` : 'Alle Benachrichtigungen gelesen'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Alle gelesen
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Alle löschen
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <Bell className="h-4 w-4 mr-2" />
            Alle
            <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Ungelesen
            {unreadCount > 0 && <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Einstellungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Typ filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                {Object.entries(typeConfig).map(([type, config]) => (
                  <SelectItem key={type} value={type}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Priorität" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Prioritäten</SelectItem>
                <SelectItem value="urgent">Dringend</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Keine Benachrichtigungen</p>
                <p className="text-muted-foreground text-sm">
                  {filter === 'unread' ? 'Alle Benachrichtigungen wurden gelesen.' : 'Sie haben noch keine Benachrichtigungen erhalten.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {groupedNotifications.map((group) => (
                <div key={group.label}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{group.label}</h3>
                  <div className="space-y-2">
                    {group.notifications.map((notification) => {
                      const config = typeConfig[notification.type] || typeConfig.info;
                      const Icon = config.icon;
                      const priorityClass = priorityColors[notification.priority] || priorityColors.medium;

                      return (
                        <Card
                          key={notification.id}
                          className={cn(
                            'transition-colors cursor-pointer hover:bg-accent/50 border-l-4',
                            priorityClass,
                            !notification.read && 'bg-accent/20'
                          )}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className={cn('p-2 rounded-full h-fit', config.bgColor)}>
                                <Icon className={cn('h-5 w-5', config.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className={cn('font-medium', !notification.read && 'font-semibold')}>
                                        {notification.title}
                                      </p>
                                      {notification.priority === 'urgent' && (
                                        <Badge variant="destructive" className="text-xs">Dringend</Badge>
                                      )}
                                      {notification.priority === 'high' && (
                                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                                          Wichtig
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant="outline" className={cn('text-xs hidden sm:inline-flex', config.color)}>
                                      {config.label}
                                    </Badge>
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification.id);
                                        }}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dismissNotification(notification.id);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                  <p className="text-xs text-muted-foreground">
                                    {format(parseISO(notification.created_at), 'PPp', { locale: de })}
                                  </p>
                                  {notification.link && (
                                    <a
                                      href={notification.link}
                                      className="text-xs text-primary hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Anzeigen →
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4 mt-4">
          {notifications.filter(n => !n.read).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">Alles gelesen!</p>
                <p className="text-muted-foreground text-sm">
                  Sie haben keine ungelesenen Benachrichtigungen.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.filter(n => !n.read).map((notification) => {
                const config = typeConfig[notification.type] || typeConfig.info;
                const Icon = config.icon;
                const priorityClass = priorityColors[notification.priority] || priorityColors.medium;

                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      'transition-colors cursor-pointer hover:bg-accent/50 border-l-4 bg-accent/20',
                      priorityClass
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={cn('p-2 rounded-full h-fit', config.bgColor)}>
                          <Icon className={cn('h-5 w-5', config.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{notification.title}</p>
                            {notification.priority === 'urgent' && (
                              <Badge variant="destructive" className="text-xs">Dringend</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(parseISO(notification.created_at), 'PPp', { locale: de })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Allgemeine Einstellungen
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie, wie und wann Sie Benachrichtigungen erhalten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Benachrichtigungen aktiviert</Label>
                  <p className="text-sm text-muted-foreground">
                    Alle Benachrichtigungen ein- oder ausschalten
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(enabled) => updateSettings({ enabled })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Ruhezeiten
              </CardTitle>
              <CardDescription>
                Keine Benachrichtigungen während bestimmter Zeiten erhalten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ruhezeiten aktiviert</Label>
                  <p className="text-sm text-muted-foreground">
                    Benachrichtigungen während der Ruhezeit unterdrücken
                  </p>
                </div>
                <Switch
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(enabled) =>
                    updateSettings({
                      quietHours: { ...settings.quietHours, enabled },
                    })
                  }
                />
              </div>

              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start">Von</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) =>
                        updateSettings({
                          quietHours: { ...settings.quietHours, start: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end">Bis</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) =>
                        updateSettings({
                          quietHours: { ...settings.quietHours, end: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Benachrichtigungstypen
              </CardTitle>
              <CardDescription>
                Wählen Sie, welche Art von Benachrichtigungen Sie erhalten möchten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {(Object.entries(NOTIFICATION_TYPE_CONFIG) as [NotificationType, { label: string }][]).map(
                  ([type, config]) => (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const tc = typeConfig[type] || typeConfig.info;
                          const Icon = tc.icon;
                          return (
                            <div className={cn('p-2 rounded-full', tc.bgColor)}>
                              <Icon className={cn('h-4 w-4', tc.color)} />
                            </div>
                          );
                        })()}
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <Switch
                        checked={settings.categories[type] !== false}
                        onCheckedChange={() => toggleCategory(type)}
                      />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
