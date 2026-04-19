import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import hausmeisterLogo from "@/assets/hausmeister-animated.svg";

export default function SignupPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/aufgaben`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(getErrorMessage(error.message));
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  const getErrorMessage = (message: string): string => {
    if (message.includes('User already registered')) {
      return 'Diese E-Mail-Adresse ist bereits registriert';
    }
    if (message.includes('Invalid email')) {
      return 'Ungültige E-Mail-Adresse';
    }
    if (message.includes('leaked') || message.includes('breach') || message.includes('HIBP') || message.includes('weak') || message.includes('pwned')) {
      return 'Dieses Passwort wurde in einem Datenleck gefunden. Bitte wählen Sie ein sichereres Passwort.';
    }
    if (message.includes('Password')) {
      return 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    return 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Bestätigungs-E-Mail gesendet</CardTitle>
              <CardDescription>
                Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet.
                Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Zurück zur Anmeldung
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={hausmeisterLogo} alt="Fintutto Hausmeister Logo" className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-2xl font-bold text-foreground">Fintutto Hausmeister</h1>
          <p className="text-muted-foreground mt-1">Facility Management App</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Konto erstellen</CardTitle>
            <CardDescription>
              Registrieren Sie sich für ein neues Konto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Max Mustermann"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@beispiel.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground touch-target flex items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <PasswordStrengthMeter password={password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full touch-target" 
                disabled={isLoading}
              >
                {isLoading ? "Wird registriert..." : "Registrieren"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Bereits ein Konto?{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:underline font-medium"
                >
                  Anmelden
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
