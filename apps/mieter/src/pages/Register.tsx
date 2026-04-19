import { useState, useMemo, useEffect } from "react";
import mieterLogo from "@/assets/mieter-logo.svg";

import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Building2, Wrench, Home, Gauge, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");

  // Store referral code in localStorage for later use after email confirmation
  useEffect(() => {
    if (referralCode) {
      localStorage.setItem("referral_code", referralCode);
    }
  }, [referralCode]);

  const passwordStrength = useMemo(() => {
    let score = 0;
    const checks = { length: password.length >= 8, upper: /[A-Z]/.test(password), lower: /[a-z]/.test(password), number: /[0-9]/.test(password), special: /[!@#$%^&*(),.?":{}|<>]/.test(password) };
    if (checks.length) score++; if (checks.upper) score++; if (checks.lower) score++; if (checks.number) score++; if (checks.special) score++;
    return { score, checks };
  }, [password]);

  const getStrengthColor = () => { if (passwordStrength.score <= 2) return "bg-destructive"; if (passwordStrength.score <= 3) return "bg-warning"; return "bg-success"; };
  const getStrengthLabel = () => { if (passwordStrength.score <= 2) return "Schwach"; if (passwordStrength.score <= 3) return "Mittel"; return "Stark"; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast({ variant: "destructive", title: "Fehler", description: "Die Passwörter stimmen nicht überein." }); return; }
    if (!passwordStrength.checks.length) { toast({ variant: "destructive", title: "Fehler", description: "Das Passwort muss mindestens 8 Zeichen lang sein." }); return; }
    if (!passwordStrength.checks.upper || !passwordStrength.checks.lower || !passwordStrength.checks.number) {
      toast({ variant: "destructive", title: "Fehler", description: "Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten." }); return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) { toast({ variant: "destructive", title: "Registrierung fehlgeschlagen", description: error.message }); }
    else { toast({ title: "Registrierung erfolgreich", description: "Bitte bestätigen Sie Ihre E-Mail-Adresse." }); navigate("/login"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-radial" />
      <div className="fixed inset-0 bg-black/15 -z-10" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-6 animate-slide-up">
          <img src={mieterLogo} alt="Fintutto Mieter" className="w-20 h-20 rounded-3xl mx-auto mb-4 shadow-2xl shadow-primary/30 animate-float" />
          <h1 className="text-2xl font-bold text-white">Fintutto Mieter</h1>
          <p className="text-white/70 mt-1">Neues Konto erstellen</p>
        </div>

        <AnimatedCard delay={100}>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle as="h2" className="text-xl">Registrieren</CardTitle>
            <CardDescription>Erstellen Sie Ihr Mieter-Konto</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="Max Mustermann" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 transition-all focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" placeholder="ihre@email.de" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 transition-all focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 transition-all focus:ring-2 focus:ring-primary/20" />
                {password.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-300", getStrengthColor())} style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                      </div>
                      <span className={cn("text-xs font-medium", passwordStrength.score <= 2 ? "text-destructive" : passwordStrength.score <= 3 ? "text-warning" : "text-success")}>{getStrengthLabel()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <RequirementItem met={passwordStrength.checks.length} label="Mind. 8 Zeichen" />
                      <RequirementItem met={passwordStrength.checks.upper} label="Großbuchstabe" />
                      <RequirementItem met={passwordStrength.checks.lower} label="Kleinbuchstabe" />
                      <RequirementItem met={passwordStrength.checks.number} label="Zahl" />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className={cn("h-12 transition-all focus:ring-2 focus:ring-primary/20", confirmPassword && password !== confirmPassword && "border-destructive focus:ring-destructive/20")} />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1"><X className="h-3 w-3" />Passwörter stimmen nicht überein</p>
                )}
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Wird erstellt...</>) : "Konto erstellen"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Bereits ein Konto? </span>
              <Link to="/login" className="text-primary hover:underline font-semibold">Anmelden</Link>
            </div>
          </CardContent>
        </AnimatedCard>
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

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 transition-colors", met ? "text-success" : "text-muted-foreground")}>
      {met ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
      <span>{label}</span>
    </div>
  );
}
