import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout title="Zahlung erfolgreich">
      <div className="flex items-center justify-center min-h-[80vh] relative">
        {/* Confetti */}
        {confetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: [
                    "hsl(var(--primary))",
                    "#4ade80",
                    "#facc15",
                    "#60a5fa",
                  ][Math.floor(Math.random() * 4)],
                  width: "8px",
                  height: "8px",
                  borderRadius: Math.random() > 0.5 ? "50%" : "0",
                  animation: "confetti 3s ease-in-out forwards",
                }}
              />
            ))}
          </div>
        )}

        <div className="max-w-md w-full text-center rounded-xl border border-white/10 bg-white/5 p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            Upgrade erfolgreich!
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </h1>
          <p className="text-muted-foreground mt-2">
            Ihre Zahlung war erfolgreich. Sie haben jetzt Zugriff auf alle Premium-Features.
          </p>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-left">
            <h4 className="font-semibold text-white mb-2">Was Sie jetzt tun koennen:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>&#10003; Unbegrenzte Rechnungen erstellen</li>
              <li>&#10003; Steuer-Reports generieren</li>
              <li>&#10003; Erweiterte Ausgaben-Kategorien</li>
              <li>&#10003; PDF-Export nutzen</li>
            </ul>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Zum Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </MainLayout>
  );
}
