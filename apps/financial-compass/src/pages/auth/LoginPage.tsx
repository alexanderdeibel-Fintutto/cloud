import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort erforderlich'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      toast.success('Erfolgreich angemeldet!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Anmeldung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Willkommen zurück</CardTitle>
        <CardDescription>Melden Sie sich in Ihrem Konto an</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Demo Hint */}
        <div className="mb-6 p-4 rounded-lg bg-primary-50 border border-primary-200">
          <p className="text-sm text-primary-800">
            <strong>Demo-Zugang:</strong> Verwenden Sie{' '}
            <code className="bg-primary-100 px-1 rounded">demo@fintutto.cloud</code> mit beliebigem Passwort.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@firma.de"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              <span>Angemeldet bleiben</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
              Passwort vergessen?
            </Link>
          </div>

          <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird angemeldet...
              </>
            ) : (
              'Anmelden'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Noch kein Konto?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Jetzt registrieren
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
