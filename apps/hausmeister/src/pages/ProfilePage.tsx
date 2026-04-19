import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  CheckCircle, 
  Settings, 
  LogOut,
  Moon,
  Bell,
  Loader2,
  Grid3X3,
  CalendarDays,
  ChevronRight,
  Gift
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import { toast } from "sonner";

// Mock user data
const mockUser = {
  id: "user1",
  full_name: "Max Mustermann",
  email: "max.mustermann@hausmeister.de",
  avatar_url: null,
};

// Mock statistics
const weeklyHours = [
  { day: "Mo", hours: 8 },
  { day: "Di", hours: 7.5 },
  { day: "Mi", hours: 8 },
  { day: "Do", hours: 6 },
  { day: "Fr", hours: 4 },
  { day: "Sa", hours: 0 },
  { day: "So", hours: 0 },
];

const monthlyStats = {
  completed: 24,
  total: 32,
};

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme === "dark";
  const [notifications, setNotifications] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const totalWeeklyHours = weeklyHours.reduce((sum, d) => sum + d.hours, 0);
  const initials = mockUser.full_name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      // AuthContext will clear user state and ProtectedRoute will redirect to /login
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Fehler beim Abmelden');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader title="Profil" />

      <div className="px-4 py-4 space-y-4">
        {/* User Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={mockUser.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{mockUser.full_name}</h2>
                <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                <Button variant="link" className="px-0 h-auto text-primary">
                  Profil bearbeiten
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="space-y-2">
          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate("/kalender")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Kalender</h3>
                    <p className="text-sm text-muted-foreground">Termine & Wartungen planen</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate("/apps")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Grid3X3 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Fintutto Apps</h3>
                    <p className="text-sm text-muted-foreground">Alle Apps des Ökosystems entdecken</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate("/empfehlungen")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Empfehlungen</h3>
                    <p className="text-sm text-muted-foreground">Freunde einladen & sparen</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Arbeitszeit diese Woche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-1 h-24 mb-2">
              {weeklyHours.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-primary/80 rounded-t transition-all"
                    style={{ height: `${(day.hours / 10) * 100}%`, minHeight: day.hours > 0 ? '4px' : '0' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              {weeklyHours.map((day) => (
                <span key={day.day} className="flex-1 text-center">{day.day}</span>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gesamt</span>
              <span className="font-semibold">{totalWeeklyHours} Stunden</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aufgaben diesen Monat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(monthlyStats.completed / monthlyStats.total) * 226} 226`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round((monthlyStats.completed / monthlyStats.total) * 100)}%</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">{monthlyStats.completed}</div>
                <div className="text-sm text-muted-foreground">von {monthlyStats.total} erledigt</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <span>Dunkler Modus</span>
              </div>
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span>Benachrichtigungen</span>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full touch-target text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5 mr-2" />
          )}
          {isLoggingOut ? 'Abmelden...' : 'Abmelden'}
        </Button>
      </div>
    </div>
  );
}
