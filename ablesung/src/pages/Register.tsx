import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Die Passwörter stimmen nicht überein.',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Registrierung fehlgeschlagen',
        description: error.message,
      });
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <AuthLayout title="E-Mail bestätigen" subtitle="">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center shadow-soft"
          >
            <CheckCircle className="w-10 h-10 text-success" />
          </motion.div>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Wir haben Ihnen eine E-Mail an
            </p>
            <p className="font-semibold text-foreground">{email}</p>
            <p className="text-muted-foreground text-sm">
              gesendet. Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
            </p>
          </div>
          <Link to="/login">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" className="w-full mt-4 h-12 rounded-xl font-semibold">
                Zurück zur Anmeldung
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Konto erstellen" subtitle="Registrieren Sie sich kostenlos">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Feature highlight */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
        >
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Zählerstand per Foto erfassen • Automatische Auswertung
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="email" className="text-sm font-medium">E-Mail</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="ihre@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 transition-all"
              required
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="password" className="text-sm font-medium">Passwort</Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="password"
              type="password"
              placeholder="Mindestens 6 Zeichen"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 transition-all"
              required
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Passwort bestätigen</Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Passwort wiederholen"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-11 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 transition-all"
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button 
              type="submit" 
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold rounded-xl shadow-glow text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registrieren...
                </>
              ) : (
                <>
                  Registrieren
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground pt-2"
        >
          Bereits ein Konto?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Jetzt anmelden
          </Link>
        </motion.p>
      </form>
    </AuthLayout>
  );
}
