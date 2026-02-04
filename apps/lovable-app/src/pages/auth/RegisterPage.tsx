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

const registerSchema = z.object({
  firstName: z.string().min(1, 'Vorname erforderlich'),
  lastName: z.string().min(1, 'Nachname erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Mindestens 8 Zeichen'),
  confirmPassword: z.string(),
  companyName: z.string().min(1, 'Firmenname erforderlich'),
  legalForm: z.string().min(1, 'Rechtsform erforderlich'),
  acceptTerms: z.boolean().refine((val) => val === true, 'AGB müssen akzeptiert werden'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const legalForms = [
  { value: 'EINZELUNTERNEHMEN', label: 'Einzelunternehmen' },
  { value: 'FREIBERUFLER', label: 'Freiberufler' },
  { value: 'GBR', label: 'GbR' },
  { value: 'OHG', label: 'OHG' },
  { value: 'KG', label: 'KG' },
  { value: 'GMBH', label: 'GmbH' },
  { value: 'UG', label: 'UG (haftungsbeschränkt)' },
  { value: 'AG', label: 'AG' },
  { value: 'GMBH_CO_KG', label: 'GmbH & Co. KG' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast.success('Konto erfolgreich erstellt!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Konto erstellen</CardTitle>
        <CardDescription>
          Starten Sie mit Ihrer kostenlosen 30-Tage-Testversion
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                placeholder="Max"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                placeholder="Mustermann"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-4">Firmendaten</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Firmenname</Label>
                <Input
                  id="companyName"
                  placeholder="Meine Firma GmbH"
                  {...register('companyName')}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalForm">Rechtsform</Label>
                <select
                  id="legalForm"
                  {...register('legalForm')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Bitte wählen...</option>
                  {legalForms.map((form) => (
                    <option key={form.value} value={form.value}>
                      {form.label}
                    </option>
                  ))}
                </select>
                {errors.legalForm && (
                  <p className="text-sm text-red-500">{errors.legalForm.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="acceptTerms"
              {...register('acceptTerms')}
              className="mt-1 rounded"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-600">
              Ich akzeptiere die{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">AGB</a> und{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">Datenschutzbestimmungen</a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
          )}

          <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              'Kostenlos registrieren'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Bereits registriert?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Jetzt anmelden
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
