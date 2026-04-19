import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import mieterLogo from "@/assets/mieter-logo.svg";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { BuildingManagement } from "@/components/buildings/BuildingManagement";
import { 
  User, Bell, Moon, Sun, Lock, Globe, HelpCircle, FileText, Shield, Mail, Smartphone, ChevronRight, Volume2, Vibrate, Crown, Building2
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Einstellungen() {
  const { user } = useAuth();
  const { canManageBuildings, loading: rolesLoading } = useUserRoles();
  const userName = user?.user_metadata?.name || "Mieter";
  const userEmail = user?.email || "";
  const [notifications, setNotifications] = useState({ push: true, email: true, sms: false, sound: true, vibration: true });
  const [darkMode, setDarkMode] = useState(false);

  return (
    <MobileLayout>
      <PageHeader title="Einstellungen" subtitle="Profil & Präferenzen" />

      <div className="px-4 -mt-2 space-y-4 pb-4">
        {/* Profile */}
        <AnimatedCard delay={0} accentColor="primary">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={mieterLogo} alt="Fintutto Mieter" className="w-16 h-16 rounded-2xl shadow-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-background flex items-center justify-center">
                  <span className="text-white text-[10px]">✓</span>
                </div>
              </div>
              <div className="flex-1"><p className="font-bold text-lg">{userName}</p><p className="text-sm text-muted-foreground">{userEmail}</p></div>
              <Button variant="outline" size="sm">Bearbeiten</Button>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Subscription */}
        <Link to="/pricing">
          <AnimatedCard delay={50} accentColor="amber">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-amber flex items-center justify-center shadow-lg"><Crown className="h-6 w-6 text-white" /></div>
                <div className="flex-1"><p className="font-semibold">Kostenloser Plan</p><p className="text-sm text-muted-foreground">Upgrade für Premium-Features</p></div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </AnimatedCard>
        </Link>

        {canManageBuildings && !rolesLoading && <BuildingManagement />}

        {/* Notifications */}
        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide">Benachrichtigungen</h2>
          <AnimatedCard delay={100}>
            <div className="divide-y divide-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><IconBadge icon={Bell} variant="primary" size="sm" /><div><p className="font-medium text-sm">Push-Benachrichtigungen</p><p className="text-xs text-muted-foreground">Sofortige Updates auf Ihr Gerät</p></div></div>
                <Switch checked={notifications.push} onCheckedChange={(checked) => setNotifications({...notifications, push: checked})} />
              </CardContent>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><IconBadge icon={Mail} variant="sky" size="sm" /><div><p className="font-medium text-sm">E-Mail-Benachrichtigungen</p><p className="text-xs text-muted-foreground">Wichtige Updates per E-Mail</p></div></div>
                <Switch checked={notifications.email} onCheckedChange={(checked) => setNotifications({...notifications, email: checked})} />
              </CardContent>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><IconBadge icon={Smartphone} variant="mint" size="sm" /><div><p className="font-medium text-sm">SMS-Benachrichtigungen</p><p className="text-xs text-muted-foreground">Für kritische Meldungen</p></div></div>
                <Switch checked={notifications.sms} onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})} />
              </CardContent>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><IconBadge icon={Volume2} variant="coral" size="sm" /><p className="font-medium text-sm">Ton</p></div>
                <Switch checked={notifications.sound} onCheckedChange={(checked) => setNotifications({...notifications, sound: checked})} />
              </CardContent>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><IconBadge icon={Vibrate} variant="amber" size="sm" /><p className="font-medium text-sm">Vibration</p></div>
                <Switch checked={notifications.vibration} onCheckedChange={(checked) => setNotifications({...notifications, vibration: checked})} />
              </CardContent>
            </div>
          </AnimatedCard>
        </div>

        {/* Appearance */}
        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide">Darstellung</h2>
          <AnimatedCard delay={200}>
            <div className="divide-y divide-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><IconBadge icon={darkMode ? Moon : Sun} variant="secondary" size="sm" /><div><p className="font-medium text-sm">Dark Mode</p><p className="text-xs text-muted-foreground">Dunkles Farbschema</p></div></div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </CardContent>
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3"><IconBadge icon={Globe} variant="sky" size="sm" /><div><p className="font-medium text-sm">Sprache</p><p className="text-xs text-muted-foreground">Deutsch</p></div></div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </div>
          </AnimatedCard>
        </div>

        {/* Security */}
        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide">Sicherheit</h2>
          <AnimatedCard delay={250}>
            <div className="divide-y divide-border/50">
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3"><IconBadge icon={Lock} variant="coral" size="sm" /><div><p className="font-medium text-sm">Passwort ändern</p><p className="text-xs text-muted-foreground">Zuletzt geändert: Vor 30 Tagen</p></div></div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3"><IconBadge icon={Shield} variant="mint" size="sm" /><div><p className="font-medium text-sm">Zwei-Faktor-Authentifizierung</p><p className="text-xs text-muted-foreground">Nicht aktiviert</p></div></div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </div>
          </AnimatedCard>
        </div>

        {/* Help */}
        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide">Hilfe & Rechtliches</h2>
          <AnimatedCard delay={300}>
            <div className="divide-y divide-border/50">
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3"><IconBadge icon={HelpCircle} variant="primary" size="sm" /><p className="font-medium text-sm">Hilfe & FAQ</p></div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3"><IconBadge icon={FileText} variant="sky" size="sm" /><p className="font-medium text-sm">Datenschutzerklärung</p></div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3"><IconBadge icon={FileText} variant="amber" size="sm" /><p className="font-medium text-sm">Nutzungsbedingungen</p></div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </div>
          </AnimatedCard>
        </div>

        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-white/60">Wohn-Held Version 1.0.0</p>
          <p className="text-xs text-white/60 mt-1">Made with ❤️ in Berlin</p>
        </div>
      </div>
    </MobileLayout>
  );
}
