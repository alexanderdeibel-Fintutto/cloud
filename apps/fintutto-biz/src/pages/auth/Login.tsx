import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Briefcase, TrendingUp, Shield, FileText } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Ungueltige Anmeldedaten. Bitte pruefen Sie E-Mail und Passwort."
          : error.message
      );
      setIsLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Left Hero */}
        <div className="hidden lg:flex flex-col gap-8 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Briefcase className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Fintutto Biz</h1>
              <p className="text-sm text-muted-foreground">Freelancer Finance OS</p>
            </div>
          </div>
          <div className="space-y-6">
            <FeatureItem
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              title="Umsatz im Blick"
              description="Einnahmen, Ausgaben und Gewinn auf einen Blick"
            />
            <FeatureItem
              icon={<FileText className="h-5 w-5 text-primary" />}
              title="Rechnungen erstellen"
              description="Professionelle Rechnungen in Sekunden"
            />
            <FeatureItem
              icon={<Shield className="h-5 w-5 text-primary" />}
              title="Steuer-Uebersicht"
              description="EUeR und USt automatisch berechnet"
            />
          </div>
        </div>

        {/* Right Login Card */}
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <Briefcase className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-white">Fintutto Biz</h1>
                <p className="text-sm text-muted-foreground">Freelancer Finance OS</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold text-white mb-1">Anmelden</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Melden Sie sich an, um auf Ihr Konto zuzugreifen
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white">
                  E-Mail-Adresse
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="ihre@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white">
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Anmelden
              </button>

              <p className="text-sm text-muted-foreground text-center pt-2">
                Noch kein Konto?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Jetzt registrieren
                </Link>
              </p>
              <Link
                to="/preise"
                className="block text-sm text-muted-foreground hover:text-primary text-center"
              >
                Preise ansehen →
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
