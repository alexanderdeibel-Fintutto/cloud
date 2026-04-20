import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Shield, Users, BarChart3 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await signUp(email, password, fullName);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #0f3460 100%)' }}
    >
      {/* Left side — Branding mit echtem Fintutto Farbverlauf */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Hintergrund-Gradient lila → teal → orange */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.35) 0%, rgba(56,189,248,0.2) 50%, rgba(251,146,60,0.25) 100%)',
          }}
        />
        {/* Dekorative Kreise */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #fb923c 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-12">
            <h1
              className="text-5xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Fintutto
            </h1>
            <p className="text-xl" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Ihre professionelle Finanzbuchhaltung
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: TrendingUp, label: 'Echtzeit-Übersicht', desc: 'Alle Finanzdaten auf einen Blick', color: '#a78bfa' },
              { icon: Shield, label: 'Sichere Daten', desc: 'Enterprise-Grade Sicherheit', color: '#38bdf8' },
              { icon: Users, label: 'Multi-Mandanten', desc: 'Mehrere Firmen verwalten', color: '#34d399' },
              { icon: BarChart3, label: 'Intelligente Berichte', desc: 'Automatisierte Auswertungen', color: '#fb923c' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{ background: `${color}22`, border: `1px solid ${color}44` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {label}
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — Login-Formular */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Fintutto
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Ihre Finanzbuchhaltung</p>
          </div>

          <Card
            className="border-0"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>
                Willkommen
              </CardTitle>
              <CardDescription style={{ color: 'rgba(255,255,255,0.5)' }}>
                Melden Sie sich an oder erstellen Sie ein Konto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList
                  className="grid w-full grid-cols-2 mb-6"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <TabsTrigger value="login">Anmelden</TabsTrigger>
                  <TabsTrigger value="register">Registrieren</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" style={{ color: 'rgba(255,255,255,0.8)' }}>E-Mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@firma.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" style={{ color: 'rgba(255,255,255,0.8)' }}>Passwort</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                      />
                    </div>
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full font-semibold"
                      disabled={loading}
                      style={{ background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', border: 'none', color: '#fff' }}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Anmelden
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" style={{ color: 'rgba(255,255,255,0.8)' }}>Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Max Mustermann"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerEmail" style={{ color: 'rgba(255,255,255,0.8)' }}>E-Mail</Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="name@firma.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword" style={{ color: 'rgba(255,255,255,0.8)' }}>Passwort</Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="Mindestens 6 Zeichen"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert style={{ borderColor: 'rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.1)' }}>
                        <AlertDescription style={{ color: '#34d399' }}>{success}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full font-semibold"
                      disabled={loading}
                      style={{ background: 'linear-gradient(135deg, #fb923c, #e879f9)', border: 'none', color: '#fff' }}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Registrieren
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
