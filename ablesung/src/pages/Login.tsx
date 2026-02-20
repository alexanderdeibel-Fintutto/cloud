import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Anmeldung fehlgeschlagen',
        description: error.message === 'Invalid login credentials' 
          ? 'Ungültige E-Mail oder Passwort.' 
          : error.message,
      });
    } else {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <AuthLayout title="Willkommen zurück" subtitle="Melden Sie sich an, um fortzufahren">
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Passwort</Label>
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Vergessen?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 transition-all"
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                  Anmelden...
                </>
              ) : (
                <>
                  Anmelden
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground pt-2"
        >
          Noch kein Konto?{' '}
          <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Jetzt registrieren
          </Link>
        </motion.p>
      </form>
    </AuthLayout>
  );
}
