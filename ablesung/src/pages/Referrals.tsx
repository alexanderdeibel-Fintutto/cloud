import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Gift, TrendingUp, Share2, ExternalLink, Clock, UserPlus, CreditCard, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReferrals, Referral } from '@/hooks/useReferrals';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/stripe';
import { AppLayout } from '@/components/layout/AppLayout';

const APP_LABELS: Record<string, string> = {
  vermietify: 'Vermietify',
  hausmeister: 'HausmeisterPro',
  mieter: 'MieterApp',
  nebenkosten: 'Nebenkosten',
  bescheidboxer: 'BescheidBoxer',
  zaehler: 'Zählerstand',
};

const APP_URLS: Record<string, string> = {
  vermietify: 'https://vermietify.vercel.app',
  hausmeister: 'https://hausmeister-pro.vercel.app',
  mieter: 'https://mieter-kw8d.vercel.app',
  nebenkosten: 'https://ablesung.vercel.app',
  bescheidboxer: 'https://bescheidboxer.vercel.app',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Ausstehend', color: 'bg-muted text-muted-foreground', icon: Clock },
  clicked: { label: 'Geklickt', color: 'bg-blue-500/20 text-blue-400', icon: ExternalLink },
  registered: { label: 'Registriert', color: 'bg-amber-500/20 text-amber-400', icon: UserPlus },
  subscribed: { label: 'Abonniert', color: 'bg-emerald-500/20 text-emerald-400', icon: CreditCard },
};

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {sub && <p className="text-[10px] text-muted-foreground/60">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralRow({ referral }: { referral: Referral }) {
  const status = STATUS_CONFIG[referral.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const appLabel = APP_LABELS[referral.target_app_id] || referral.target_app_id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{appLabel}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.color} border-0`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground font-mono">{referral.referral_code}</span>
          {referral.referred_email && (
            <span className="text-xs text-muted-foreground">→ {referral.referred_email}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-muted-foreground">
          {new Date(referral.created_at).toLocaleDateString('de-DE')}
        </p>
        {referral.converted_at && (
          <p className="text-[10px] text-emerald-400">
            ✓ {new Date(referral.converted_at).toLocaleDateString('de-DE')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Referrals() {
  const navigate = useNavigate();
  const { referrals, rewards, stats, isLoading, getReferralUrl, createReferral } = useReferrals();
  const { toast } = useToast();
  const [copiedApp, setCopiedApp] = useState<string | null>(null);

  const handleCopyLink = async (appId: string) => {
    const baseUrl = APP_URLS[appId];
    if (!baseUrl) return;

    try {
      await createReferral.mutateAsync(appId);
      const url = getReferralUrl(appId, baseUrl);
      await navigator.clipboard.writeText(url);
      setCopiedApp(appId);
      setTimeout(() => setCopiedApp(null), 2000);
      toast({ title: 'Link kopiert!', description: `Referral-Link für ${APP_LABELS[appId] || appId} kopiert.` });
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Link konnte nicht kopiert werden.' });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Empfehlungen</h1>
            <p className="text-sm text-muted-foreground">Verfolge deine Einladungen & Ersparnisse</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Share2} label="Gesendet" value={String(stats.totalReferrals)} />
          <StatCard icon={UserPlus} label="Konvertiert" value={String(stats.convertedReferrals)} />
          <StatCard
            icon={TrendingUp}
            label="Gespart"
            value={formatPrice(stats.totalSaved)}
            sub={rewards.length > 0 ? `${rewards.length} Belohnung${rewards.length !== 1 ? 'en' : ''}` : undefined}
          />
        </div>

        {/* Quick share links */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              Jetzt einladen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(APP_URLS).map(([appId, url]) => (
              <div key={appId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">{APP_LABELS[appId] || appId}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleCopyLink(appId)}
                >
                  {copiedApp === appId ? (
                    <><Check className="w-3 h-3 mr-1 text-emerald-500" /> Kopiert</>
                  ) : (
                    <><Copy className="w-3 h-3 mr-1" /> Link kopieren</>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Referral list */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Alle Empfehlungen ({referrals.length})
          </h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Laden…</p>
          ) : referrals.length === 0 ? (
            <Card className="border-dashed border-border/50">
              <CardContent className="py-8 text-center">
                <Share2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Noch keine Empfehlungen</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Kopiere einen Link oben und teile ihn!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {referrals.map(r => <ReferralRow key={r.id} referral={r} />)}
            </div>
          )}
        </div>

        {/* Rewards list */}
        {rewards.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Belohnungen ({rewards.length})
            </h2>
            <div className="space-y-2">
              {rewards.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card">
                  <div>
                    <p className="text-sm font-medium">{r.description || 'Empfehlungsbonus'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">
                    +{formatPrice(r.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
