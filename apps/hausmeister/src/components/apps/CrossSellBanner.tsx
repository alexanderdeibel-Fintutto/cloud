import { Sparkles, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CrossSellTrigger, AppRegistryItem } from "@/types/apps";

interface CrossSellBannerProps {
  trigger: CrossSellTrigger;
  targetApp?: AppRegistryItem;
  onDismiss?: () => void;
}

export function CrossSellBanner({ trigger, targetApp, onDismiss }: CrossSellBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !targetApp) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card 
      className="relative overflow-hidden border-0"
      style={{ 
        background: `linear-gradient(135deg, ${targetApp.color}20 0%, ${targetApp.color}10 100%)`,
        borderLeft: `4px solid ${targetApp.color}`
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: targetApp.color }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h4 className="font-medium text-sm">KI-Empfehlung</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {trigger.message_template}
            </p>
            <Button 
              variant="link" 
              className="px-0 h-auto mt-2 gap-1"
              style={{ color: targetApp.color }}
              onClick={() => targetApp.url && window.open(targetApp.url, "_blank")}
            >
              {targetApp.name} entdecken
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
