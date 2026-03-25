import { useState, useEffect } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Settings,
  User,
  Bell,
  Clock,
  Download,
  Upload,
  Trash2,
  Info,
  Leaf,
  Shield,
  Database,
  ExternalLink,
  Droplets,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEYS = {
  notifications: 'pm_notification_prefs',
  reminderTime: 'pm_reminder_time',
};

interface NotificationPrefs {
  waterReminders: boolean;
  fertilizeReminders: boolean;
}

function loadNotificationPrefs(): NotificationPrefs {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.notifications);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { waterReminders: true, fertilizeReminders: true };
}

function saveNotificationPrefs(prefs: NotificationPrefs) {
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(prefs));
}

function loadReminderTime(): string {
  return localStorage.getItem(STORAGE_KEYS.reminderTime) || '09:00';
}

function saveReminderTime(time: string) {
  localStorage.setItem(STORAGE_KEYS.reminderTime, time);
}

export default function SettingsPage() {
  const { user } = useAuth();
  const {
    apartments,
    rooms,
    plants,
    careEvents,
    vacationPlans,
    shoppingItems,
  } = usePlants();

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(loadNotificationPrefs);
  const [reminderTime, setReminderTime] = useState(loadReminderTime);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Persist notification prefs
  useEffect(() => {
    saveNotificationPrefs(notifPrefs);
  }, [notifPrefs]);

  useEffect(() => {
    saveReminderTime(reminderTime);
  }, [reminderTime]);

  function handleExportData() {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      apartments,
      rooms,
      plants,
      careEvents,
      vacationPlans,
      shoppingItems,
      settings: {
        notificationPrefs: notifPrefs,
        reminderTime,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pflanzen-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Daten erfolgreich exportiert');
  }

  function handleImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          if (!data.version) {
            toast.error('Ungültiges Dateiformat. Bitte eine gueltige Backup-Datei verwenden.');
            return;
          }

          // Import into localStorage
          if (data.apartments) localStorage.setItem('pm_apartments', JSON.stringify(data.apartments));
          if (data.rooms) localStorage.setItem('pm_rooms', JSON.stringify(data.rooms));
          if (data.plants) localStorage.setItem('pm_plants', JSON.stringify(data.plants));
          if (data.careEvents) localStorage.setItem('pm_care_events', JSON.stringify(data.careEvents));
          if (data.vacationPlans) localStorage.setItem('pm_vacation_plans', JSON.stringify(data.vacationPlans));
          if (data.shoppingItems) localStorage.setItem('pm_shopping_items', JSON.stringify(data.shoppingItems));

          if (data.settings?.notificationPrefs) {
            saveNotificationPrefs(data.settings.notificationPrefs);
            setNotifPrefs(data.settings.notificationPrefs);
          }
          if (data.settings?.reminderTime) {
            saveReminderTime(data.settings.reminderTime);
            setReminderTime(data.settings.reminderTime);
          }

          toast.success('Daten erfolgreich importiert. Seite wird neu geladen...');
          setTimeout(() => window.location.reload(), 1500);
        } catch {
          toast.error('Fehler beim Lesen der Datei. Bitte eine gueltige JSON-Datei verwenden.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleResetData() {
    if (resetConfirmText !== 'LÖSCHEN') {
      toast.error('Bitte "LÖSCHEN" eingeben, um das Zurücksetzen zu bestätigen');
      return;
    }

    // Clear all app data from localStorage
    localStorage.removeItem('pm_apartments');
    localStorage.removeItem('pm_rooms');
    localStorage.removeItem('pm_plants');
    localStorage.removeItem('pm_care_events');
    localStorage.removeItem('pm_vacation_plans');
    localStorage.removeItem('pm_shopping_items');
    localStorage.removeItem(STORAGE_KEYS.notifications);
    localStorage.removeItem(STORAGE_KEYS.reminderTime);

    toast.success('Alle Daten wurden gelöscht. Seite wird neu geladen...');
    setTimeout(() => window.location.reload(), 1500);
  }

  const totalDataItems =
    apartments.length + rooms.length + plants.length + careEvents.length + vacationPlans.length + shoppingItems.length;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground text-sm">App-Konfiguration und Datenverwaltung</p>
        </div>
      </div>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5" />
            Über die App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground">
              <Leaf className="h-9 w-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Pflanzen-Manager</h3>
              <p className="text-muted-foreground">von Fintutto</p>
              <p className="text-sm text-muted-foreground mt-1">Version 1.0.0</p>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Der Pflanzen-Manager hilft dir, deine Zimmerpflanzen optimal zu pflegen.
            Verwalte Giesspläne, Urlaubsvertretungen und Einkaufslisten -- alles an einem Ort.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" asChild>
              <a href="https://fintutto.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Fintutto.com
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Benutzerprofil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user.user_metadata?.name || 'Benutzer'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Angemeldet via Supabase</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Lokaler Benutzer</p>
                  <p className="text-sm text-muted-foreground">
                    Daten werden lokal im Browser gespeichert
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                Deine Daten sind nur in diesem Browser verfügbar. Erstelle ein Konto, um deine
                Daten geräteübergreifend zu synchronisieren.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <Label htmlFor="water-reminders" className="font-medium cursor-pointer">
                  Giess-Erinnerungen
                </Label>
                <p className="text-sm text-muted-foreground">
                  Benachrichtigung, wenn Pflanzen gegossen werden müssen
                </p>
              </div>
            </div>
            <Switch
              id="water-reminders"
              checked={notifPrefs.waterReminders}
              onCheckedChange={(checked) =>
                setNotifPrefs((prev) => ({ ...prev, waterReminders: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <Label htmlFor="fertilize-reminders" className="font-medium cursor-pointer">
                  Dünge-Erinnerungen
                </Label>
                <p className="text-sm text-muted-foreground">
                  Benachrichtigung, wenn Pflanzen gedüngt werden müssen
                </p>
              </div>
            </div>
            <Switch
              id="fertilize-reminders"
              checked={notifPrefs.fertilizeReminders}
              onCheckedChange={(checked) =>
                setNotifPrefs((prev) => ({ ...prev, fertilizeReminders: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <Label htmlFor="reminder-time" className="font-medium cursor-pointer">
                  Standard-Erinnerungszeit
                </Label>
                <p className="text-sm text-muted-foreground">
                  Uhrzeit, zu der Erinnerungen angezeigt werden
                </p>
              </div>
            </div>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Datenverwaltung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data overview */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">Gespeicherte Daten:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <span>{apartments.length} Wohnungen</span>
              <span>{rooms.length} Räume</span>
              <span>{plants.length} Pflanzen</span>
              <span>{careEvents.length} Pflege-Einträge</span>
              <span>{vacationPlans.length} Urlaubspläne</span>
              <span>{shoppingItems.length} Einkaufsartikel</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Insgesamt {totalDataItems} Einträge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Export */}
            <Button variant="outline" onClick={handleExportData} className="justify-start h-auto py-3">
              <Download className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">Daten exportieren</p>
                <p className="text-xs text-muted-foreground font-normal">
                  Als JSON-Datei herunterladen
                </p>
              </div>
            </Button>

            {/* Import */}
            <Button variant="outline" onClick={handleImportData} className="justify-start h-auto py-3">
              <Upload className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">Daten importieren</p>
                <p className="text-xs text-muted-foreground font-normal">
                  Aus JSON-Datei wiederherstellen
                </p>
              </div>
            </Button>
          </div>

          <Separator />

          {/* Reset */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold text-destructive">Alle Daten zurücksetzen</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Hiermit werden alle gespeicherten Daten unwiderruflich gelöscht. Erstelle vorher
              ein Backup über die Export-Funktion.
            </p>

            {showResetConfirm ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="reset-confirm" className="text-sm">
                    Gib <span className="font-mono font-bold">LÖSCHEN</span> ein, um zu bestätigen:
                  </Label>
                  <Input
                    id="reset-confirm"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    placeholder="LÖSCHEN"
                    className="max-w-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleResetData}
                    disabled={resetConfirmText !== 'LÖSCHEN'}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Endgültig löschen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetConfirmText('');
                    }}
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Daten zurücksetzen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
