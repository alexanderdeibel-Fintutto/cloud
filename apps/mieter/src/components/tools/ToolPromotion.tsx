import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getToolsByContext, Tool } from "@/lib/toolCatalog";

interface ToolPromotionProps {
  context: string;
  maxItems?: number;
  delay?: number;
  title?: string;
}

/**
 * Contextual promotion component that shows relevant tools
 * based on the current page context.
 */
export function ToolPromotion({ context, maxItems = 2, delay = 400, title }: ToolPromotionProps) {
  const tools = getToolsByContext(context).slice(0, maxItems);

  if (tools.length === 0) return null;

  return (
    <div className="mt-4">
      {title && (
        <h3 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {title}
        </h3>
      )}
      <AnimatedCard delay={delay} accentColor="primary">
        <CardContent className="p-4">
          <div className="space-y-3">
            {tools.map((tool) => (
              <ToolPromoItem key={tool.id} tool={tool} />
            ))}
          </div>
          <Link to={tools[0]?.type === "checker" ? "/checker" : tools[0]?.type === "formular" ? "/formulare" : "/rechner"}>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-white/60 hover:text-white group">
              Alle Tools entdecken
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}

function ToolPromoItem({ tool }: { tool: Tool }) {
  return (
    <a
      href={`https://portal.fintutto.cloud${tool.portalPath}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors group"
    >
      <div className={`w-8 h-8 rounded-lg bg-${tool.color}/10 flex items-center justify-center`}>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90">{tool.name}</p>
        <p className="text-xs text-white/50 truncate">{tool.description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-1" />
    </a>
  );
}
