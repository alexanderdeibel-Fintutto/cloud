import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Gift,
  Users,
  Copy,
  Check,
  Send,
  TrendingUp,
  Star,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Heart,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getReferralLink,
  getReferralCode,
  getReferralStats,
  getReferrals,
  addReferral,
  REWARDS,
  FINTUTTO_APPS,
  buildCrossMarketingLink,
} from '@/lib/referral';

export default function ReferralPage() {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [, setRefresh] = useState(0);

  const stats = useMemo(() => getReferralStats(), []);
  const referrals = useMemo(() => getReferrals(), []);
  const referralLink = getReferralLink();
  const referralCode = getReferralCode();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Link in die Zwischenablage kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Code kopiert!');
  };

  const handleInvite = () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Bitte gib eine gueltige E-Mail-Adresse ein.');
      return;
    }
    addReferral(email.trim());
    setEmail('');
    setRefresh(n => n + 1);
    toast.success(`Einladung an ${email} vorgemerkt!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-7 w-7 text-primary" />
          Empfehlungsprogramm
        </h1>
        <p className="text-muted-foreground mt-1">
          Lade Freunde ein und erhalte Belohnungen - fuer jede App im Fintutto-Oekosystem.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
              <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{stats.totalInvited}</p>
            <p className="text-xs text-muted-foreground">Eingeladen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold">{stats.totalSignups}</p>
            <p className="text-xs text-muted-foreground">Angemeldet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2">
              <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{stats.creditsEarned}</p>
            <p className="text-xs text-muted-foreground">Credits verdient</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold">{stats.savingsEur.toFixed(2)} EUR</p>
            <p className="text-xs text-muted-foreground">Gespart</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link & Code */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            Dein Empfehlungslink
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="bg-background font-mono text-sm" />
            <Button onClick={handleCopyLink} variant="outline" className="gap-2 shrink-0">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Kopiert!' : 'Kopieren'}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Dein Code:</span>
            <Badge
              variant="outline"
              className="font-mono text-base px-3 py-1 cursor-pointer hover:bg-muted"
              onClick={handleCopyCode}
            >
              {referralCode}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Invite by email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Per E-Mail einladen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="freund@email.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
            />
            <Button onClick={handleInvite} className="bg-green-600 hover:bg-green-700 gap-2 shrink-0">
              <Send className="h-4 w-4" />
              Einladen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reward Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Belohnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-700 dark:text-green-400 mb-2">Du erhaeltst:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  +{REWARDS.perSignup.credits} Credits pro Anmeldung
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  +{REWARDS.perSubscription.credits} Credits + {REWARDS.perSubscription.freeMonths} Gratismonat bei Abo
                </li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Dein Freund erhaelt:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  +{REWARDS.referred.bonusCredits} Bonus-Credits bei Anmeldung
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  {REWARDS.referred.discountPercent}% Rabatt auf den ersten Monat
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent referrals */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deine Empfehlungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.slice(-10).reverse().map(ref => (
                <div key={ref.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm">{ref.referredEmail}</span>
                  <Badge
                    variant={ref.status === 'subscribed' ? 'default' : ref.status === 'signed_up' ? 'secondary' : 'outline'}
                  >
                    {ref.status === 'pending' && 'Ausstehend'}
                    {ref.status === 'signed_up' && 'Angemeldet'}
                    {ref.status === 'subscribed' && 'Abonniert'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Cross-Marketing: Fintutto Ecosystem */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
          <Heart className="h-5 w-5 text-red-500" />
          Fintutto Oekosystem
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Entdecke weitere Apps von Fintutto - dein Empfehlungscode gilt ueberall.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FINTUTTO_APPS.map(app => (
            <Card key={app.key} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{app.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{app.name}</p>
                      {app.category === 'premium' && (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs shrink-0">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {app.description}
                    </p>
                    <a
                      href={buildCrossMarketingLink(app.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                    >
                      Entdecken <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
