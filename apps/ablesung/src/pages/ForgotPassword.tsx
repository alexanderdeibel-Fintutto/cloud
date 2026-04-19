import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <AuthLayout title="E-Mail gesendet" subtitle="">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Falls ein Konto mit <strong>{email}</strong> existiert, haben wir Ihnen 
            einen Link zum Zurücksetzen Ihres Passworts gesendet.
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full mt-4">
              Zurück zur Anmeldung
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Passwort vergessen?" subtitle="Wir senden Ihnen einen Reset-Link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="ihre@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Senden...
            </>
          ) : (
            'Link senden'
          )}
        </Button>

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Anmeldung
        </Link>
      </form>
    </AuthLayout>
  );
}
