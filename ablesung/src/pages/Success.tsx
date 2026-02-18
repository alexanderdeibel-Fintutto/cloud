import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription, plan, isLoading } = useSubscription();
  const [showConfetti, setShowConfetti] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription status
    checkSubscription();
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [checkSubscription]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center">
          {/* Success Icon with animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            {showConfetti && (
              <PartyPopper className="absolute -top-2 -right-2 w-8 h-8 text-amber-500 animate-bounce" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2">
            Vielen Dank für Ihr Upgrade!
          </h1>

          {/* Loading state or plan info */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <p className="text-muted-foreground mb-6">
              Ihr {plan === 'free' ? 'Konto' : `${plan.charAt(0).toUpperCase() + plan.slice(1)}-Plan`} ist jetzt aktiv.
              Sie haben nun Zugriff auf alle Funktionen Ihres Plans.
            </p>
          )}

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
            >
              Zum Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/pricing')}
            >
              Plan-Details ansehen
            </Button>
          </div>

          {/* Session info for debugging (hidden in production) */}
          {sessionId && process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-muted-foreground mt-4">
              Session: {sessionId.substring(0, 20)}...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
