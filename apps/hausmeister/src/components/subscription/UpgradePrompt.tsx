import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UpgradePromptProps {
  feature?: string;
  requiredPlan?: 'basic' | 'pro' | 'business';
}

export function UpgradePrompt({ 
  feature = 'Diese Funktion', 
  requiredPlan = 'pro' 
}: UpgradePromptProps) {
  const navigate = useNavigate();

  const planNames: Record<string, string> = {
    basic: 'Basic',
    pro: 'Pro',
    business: 'Business',
  };

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">{planNames[requiredPlan]}-Feature</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {feature} ist im {planNames[requiredPlan]}-Plan verfügbar.
        </p>
        <Button onClick={() => navigate('/pricing')}>
          Jetzt upgraden
        </Button>
      </CardContent>
    </Card>
  );
}
