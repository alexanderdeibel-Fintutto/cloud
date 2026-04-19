import { useState } from "react";
import mieterLogo from "@/assets/mieter-logo.svg";

import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Wrench, Home, Gauge, ExternalLink } from "lucide-react";
import { lovable } from "@/integrations/lovable";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ variant: "destructive", title: "Anmeldung fehlgeschlagen", description: error.message === "Invalid login credentials" ? "E-Mail oder Passwort ist falsch." : error.message });
    } else { navigate("/"); }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (error) { toast({ variant: "destructive", title: "Google-Anmeldung fehlgeschlagen", description: error.message }); setGoogleLoading(false); }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
    if (error) { toast({ variant: "destructive", title: "Apple-Anmeldung fehlgeschlagen", description: error.message }); setAppleLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-radial" />
      <div className="fixed inset-0 bg-black/15 -z-10" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col lg:flex-row lg:items-center lg:gap-16">
        {/* Left: App Info Block */}
        <div className="text-center lg:text-left mb-8 lg:mb-0 lg:flex-1 animate-slide-up">
          <div className="flex items-center gap-4 justify-center lg:justify-start mb-6">
            <img src={mieterLogo} alt="Fintutto Mieter" className="w-16 h-16 lg:w-20 lg:h-20 rounded-3xl shadow-2xl shadow-primary/30 animate-float" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Fintutto Mieter</h1>
              <p className="text-white/70 mt-0.5">Ihr digitales Mieter-Portal</p>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-4 mt-8">
            <FeatureItem icon="📊" title="Echtzeit-Übersicht" description="Alle Mietdaten auf einen Blick" />
            <FeatureItem icon="🔒" title="Sichere Daten" description="Enterprise-Grade Sicherheit" />
            <FeatureItem icon="💬" title="Direkte Kommunikation" description="Chat mit Ihrer Hausverwaltung" />
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <AnimatedCard delay={100}>
            <CardHeader className="space-y-1">
              <CardTitle as="h2" className="text-xl">Anmelden</CardTitle>
              <CardDescription>Geben Sie Ihre Zugangsdaten ein</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" type="email" placeholder="ihre@email.de" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 transition-all focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 transition-all focus:ring-2 focus:ring-primary/20" />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Wird angemeldet...</>) : "Anmelden"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">oder</span></div>
              </div>

              <Button type="button" variant="outline" className="w-full h-12 text-base font-semibold" onClick={handleGoogleSignIn} disabled={googleLoading}>
                {googleLoading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Wird verbunden...</>) : (
                  <><svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>Mit Google anmelden</>
                )}
              </Button>

              <Button type="button" variant="outline" className="w-full h-12 text-base font-semibold mt-3" onClick={handleAppleSignIn} disabled={appleLoading}>
                {appleLoading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Wird verbunden...</>) : (
                  <><svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>Mit Apple anmelden</>
                )}
              </Button>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Noch kein Konto? </span>
                <Link to="/registrieren" className="text-primary hover:underline font-semibold">Registrieren</Link>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Mobile: Feature list below card */}
        <div className="flex lg:hidden flex-col gap-3 mt-6 px-2">
          <FeatureItem icon="📊" title="Echtzeit-Übersicht" description="Alle Mietdaten auf einen Blick" />
          <FeatureItem icon="🔒" title="Sichere Daten" description="Enterprise-Grade Sicherheit" />
          <FeatureItem icon="💬" title="Direkte Kommunikation" description="Chat mit Ihrer Hausverwaltung" />
        </div>
      </div>

      {/* Ecosystem Cards */}
      <div className="w-full max-w-4xl relative z-10 mt-10 mb-8">
        <p className="text-center text-white/50 text-xs uppercase tracking-widest mb-4">Das Fintutto Ökosystem</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 lg:px-0">
          {ECOSYSTEM_APPS.map((app) => (
            <a key={app.name} href={app.url} target="_blank" rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/[0.12] transition-all">
              <div className={`w-10 h-10 rounded-xl ${app.bgClass} flex items-center justify-center shadow-lg`}>
                <app.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-white/80 text-sm text-center">{app.name}</span>
              <span className="text-[10px] text-white/40 text-center leading-tight">{app.subtitle}</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity">
                Entdecken <ExternalLink className="h-2.5 w-2.5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const ECOSYSTEM_APPS = [
  { name: "Vermietify", subtitle: "Für Vermieter", icon: Building2, bgClass: "bg-primary", url: "https://vermietify.vercel.app" },
  { name: "HausmeisterPro", subtitle: "Facility Management", icon: Wrench, bgClass: "bg-coral", url: "https://hausmeister-pro.vercel.app" },
  { name: "Fintutto Zähler", subtitle: "Digitale Ablesung", icon: Gauge, bgClass: "bg-mint", url: "https://ablesung.vercel.app" },
  { name: "Wohn-Held", subtitle: "Mieter-Portal", icon: Home, bgClass: "bg-sky", url: "https://ft-mieter.lovable.app" },
];

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-lg">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white text-sm">{title}</p>
        <p className="text-white/60 text-xs">{description}</p>
      </div>
    </div>
  );
}
