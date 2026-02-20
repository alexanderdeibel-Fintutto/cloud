import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (yearly: boolean) => void;
}

export function PricingToggle({ isYearly, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Label 
        htmlFor="billing-toggle" 
        className={`text-sm cursor-pointer ${!isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
      >
        Monatlich
      </Label>
      <Switch
        id="billing-toggle"
        checked={isYearly}
        onCheckedChange={onToggle}
      />
      <div className="flex items-center gap-2">
        <Label 
          htmlFor="billing-toggle" 
          className={`text-sm cursor-pointer ${isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
        >
          Jährlich
        </Label>
        <Badge variant="secondary" className="text-xs">
          -17%
        </Badge>
      </div>
    </div>
  );
}
