import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product, AppRegistryItem } from "@/types/apps";

interface ProductCardProps {
  product: Product;
  app?: AppRegistryItem;
}

export function ProductCard({ product, app }: ProductCardProps) {
  const formattedPrice = product.price_monthly 
    ? `€${product.price_monthly.toFixed(2)}`
    : "Kostenlos";

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{product.name}</CardTitle>
          {app && (
            <div 
              className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: app.color }}
            >
              {app.name.charAt(0)}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="text-2xl font-bold mb-3">
          {formattedPrice}
          {product.price_monthly && (
            <span className="text-sm font-normal text-muted-foreground">/Monat</span>
          )}
        </div>
        <ul className="space-y-2 flex-1">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className="w-full mt-4"
          variant="outline"
          onClick={() => app?.url && window.open(app.url, "_blank")}
        >
          Mehr erfahren
        </Button>
      </CardContent>
    </Card>
  );
}
