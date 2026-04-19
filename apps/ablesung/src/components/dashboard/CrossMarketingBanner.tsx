import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Calculator, Wrench, Users, ExternalLink, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCrossMarketing, CrossSellTrigger } from '@/hooks/useCrossMarketing';
import { useReferrals } from '@/hooks/useReferrals';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Calculator,
  Wrench,
  Users,
  Sparkles,
};

interface CrossMarketingBannerProps {
  className?: string;
}

const TARGET_URLS: Record<string, string> = {
  vermietify: 'https://vermietify.vercel.app',
  hausmeister: 'https://hausmeister-pro.vercel.app',
  mieter: 'https://mieter-kw8d.vercel.app',
  nebenkosten: 'https://ablesung.vercel.app',
};

export function CrossMarketingBanner({ className }: CrossMarketingBannerProps) {
  const { activeBanner, isLoading } = useCrossMarketing();
  const { stats, getReferralUrl, createReferral } = useReferrals();
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (isLoading || !activeBanner || dismissed.includes(activeBanner.id)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(prev => [...prev, activeBanner.id]);
    // Optional: Persist dismissal in localStorage
    const dismissedBanners = JSON.parse(localStorage.getItem('dismissed_banners') || '[]');
    localStorage.setItem('dismissed_banners', JSON.stringify([...dismissedBanners, activeBanner.id]));
  };

  const IconComponent = activeBanner.icon_name 
    ? iconMap[activeBanner.icon_name] || Sparkles 
    : Sparkles;

  const gradientClass = activeBanner.background_gradient || 'from-primary to-primary/80';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeBanner.id}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={className}
      >
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradientClass} p-4 shadow-lg`}>
          {/* Background decoration */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-white/5 blur-xl" />
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            aria-label="Banner schließen"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative flex items-start gap-4">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex-shrink-0 rounded-xl bg-white/20 p-3 backdrop-blur-sm"
            >
              <IconComponent className="h-6 w-6 text-white" />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-semibold text-white text-base leading-tight mb-1"
              >
                {activeBanner.headline}
              </motion.h3>
              
              {activeBanner.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/80 text-sm mb-3 line-clamp-2"
                >
                  {activeBanner.description}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm font-medium"
                  onClick={async () => {
                    const url = activeBanner.cta_url || TARGET_URLS[activeBanner.target_app_id];
                    if (url) {
                      const referralUrl = getReferralUrl(activeBanner.target_app_id, url);
                      try {
                        await createReferral.mutateAsync(activeBanner.target_app_id);
                      } catch { /* ignore */ }
                      window.open(referralUrl, '_blank');
                    }
                  }}
                >
                  {activeBanner.cta_text}
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Button>

                {stats.totalReferrals > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Gift className="w-3 h-3 text-white/60" />
                    <span className="text-white/60 text-[11px]">
                      {stats.totalReferrals} Empfehlung{stats.totalReferrals !== 1 ? 'en' : ''}
                      {stats.totalSaved > 0 && ` · ${stats.totalSaved.toFixed(2).replace('.', ',')} € gespart`}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Fintutto branding */}
          <div className="absolute bottom-2 right-3">
            <span className="text-[10px] text-white/50 font-medium tracking-wide">
              FINTUTTO SUITE
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
