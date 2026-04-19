import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, PartyPopper, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription, plan, loading } = useSubscription();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Refresh subscription status
    checkSubscription();

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [checkSubscription]);

  const planNames: Record<string, string> = {
    basic: "Basic",
    pro: "Pro",
    business: "Business",
  };

  return (
    <MobileLayout showNav={false}>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <PartyPopper className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Willkommen bei {planNames[plan] || "Ihrem neuen Plan"}!
              </h1>
              <p className="text-muted-foreground">
                Ihre Zahlung war erfolgreich. Vielen Dank für Ihr Vertrauen!
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Abo wird aktiviert...</span>
              </div>
            ) : (
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Ihr aktueller Plan:</p>
                <p className="text-lg font-semibold text-primary">
                  {planNames[plan] || "Free"}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={() => navigate("/")} 
                className="w-full"
                size="lg"
              >
                Zur App
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/mehr")}
                className="w-full"
              >
                Abo verwalten
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
