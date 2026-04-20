import { ExternalLink, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppRegistryItem } from "@/types/apps";

interface AppCardProps {
  app: AppRegistryItem;
  isCurrent?: boolean;
}

export function AppCard({ app, isCurrent = false }: AppCardProps) {
  const categoryLabels: Record<string, string> = {
    immobilien: "Immobilien",
    finanzen: "Finanzen",
    dokumente: "Dokumente",
  };

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${isCurrent ? "ring-2 ring-primary" : ""}`}>
      {isCurrent && (
        <div className="absolute top-2 right-2">
          <Badge variant="default" className="gap-1">
            <Check className="h-3 w-3" />
            Aktiv
          </Badge>
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: app.color }}
          >
            {app.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{app.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {app.description}
            </p>
            {app.category && (
              <Badge variant="outline" className="mt-2">
                {categoryLabels[app.category] || app.category}
              </Badge>
            )}
          </div>
        </div>
        {!isCurrent && app.url && (
          <Button 
            variant="outline" 
            className="w-full mt-4 gap-2"
            onClick={() => window.open(app.url!, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            App öffnen
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
