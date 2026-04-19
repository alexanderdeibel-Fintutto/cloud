import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  ExternalLink, Lock, Sparkles, Coins,
  Shield, TrendingUp, FileSearch, Calculator, Clock, Wallet,
  ArrowDownCircle, Home, Hammer, PaintBucket, BarChart3,
  AlertTriangle, FileX, FileOutput, AlertCircle
} from "lucide-react";
import { Tool, getPortalUrl } from "@/lib/toolCatalog";
import { useCredits } from "@/hooks/useCredits";

const ICON_MAP: Record<string, any> = {
  Shield, TrendingUp, FileSearch, Calculator, Clock, Wallet,
  ArrowDownCircle, Home, Hammer, PaintBucket, BarChart3,
  AlertTriangle, FileX, FileOutput, AlertCircle,
};

interface ToolCardProps {
  tool: Tool;
  delay?: number;
  compact?: boolean;
}

export function ToolCard({ tool, delay = 0, compact = false }: ToolCardProps) {
  const { canUseTool, useTool, isUsingTool, isPro } = useCredits();
  const hasAccess = canUseTool(tool.creditsCost);
  const Icon = ICON_MAP[tool.icon] || Shield;

  const handleOpen = async () => {
    try {
      await useTool({
        toolType: tool.type,
        toolId: tool.id,
        creditsCost: tool.creditsCost,
      });
      // Open portal in new tab
      window.open(getPortalUrl(tool), "_blank", "noopener,noreferrer");
    } catch {
      // Error handled in mutation
    }
  };

  if (compact) {
    return (
      <button
        onClick={hasAccess || isPro ? handleOpen : undefined}
        disabled={isUsingTool || (!hasAccess && !isPro)}
        className="w-full text-left"
      >
        <AnimatedCard delay={delay} accentColor={tool.color as any}>
          <CardContent className="p-4 flex items-center gap-3">
            <IconBadge icon={Icon} variant={tool.color as any} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white/90 truncate">{tool.name}</p>
              <p className="text-xs text-white/50 truncate">{tool.description}</p>
            </div>
            {isPro ? (
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            ) : hasAccess ? (
              <div className="flex items-center gap-1 text-xs text-white/50 flex-shrink-0">
                <Coins className="h-3 w-3" />
                {tool.creditsCost}
              </div>
            ) : (
              <Lock className="h-4 w-4 text-white/30 flex-shrink-0" />
            )}
          </CardContent>
        </AnimatedCard>
      </button>
    );
  }

  return (
    <AnimatedCard delay={delay} accentColor={tool.color as any}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <IconBadge icon={Icon} variant={tool.color as any} size="lg" />
          <div className="flex-1">
            <h3 className="font-bold text-white/90">{tool.name}</h3>
            <p className="text-sm text-white/60 mt-0.5">{tool.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {isPro ? (
              <StatusBadge status="success" label="Im Pro-Abo enthalten" />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Coins className="h-3.5 w-3.5" />
                <span>{tool.creditsCost} Credit{tool.creditsCost > 1 ? "s" : ""}</span>
              </div>
            )}
            {tool.freePreview && !isPro && (
              <StatusBadge status="info" label="Vorschau kostenlos" />
            )}
          </div>

          <Button
            size="sm"
            variant={hasAccess || isPro ? "default" : "outline"}
            onClick={handleOpen}
            disabled={isUsingTool || (!hasAccess && !isPro)}
            className="group"
          >
            {!hasAccess && !isPro ? (
              <>
                <Lock className="h-3.5 w-3.5 mr-1" />
                Credits nötig
              </>
            ) : (
              <>
                Starten
                <ExternalLink className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </AnimatedCard>
  );
}
