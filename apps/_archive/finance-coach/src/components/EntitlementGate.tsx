import { useEntitlements } from "@/hooks/useEntitlements";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface EntitlementGateProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function EntitlementGate({ featureKey, children, fallback }: EntitlementGateProps) {
  const { hasFeature, loading } = useEntitlements();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasFeature(featureKey)) {
    return fallback || (
      <div className="rounded-2xl border border-border/50 bg-muted/30 p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Premium Feature</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Dieses Feature ist nur mit einem Premium-Abo verfuegbar.
        </p>
        <Button asChild>
          <Link to="/preise">Upgrade ansehen</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
