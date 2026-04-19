import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UpgradePromptProps {
  feature: string;
  requiredPlan?: 'basic' | 'pro' | 'business';
}

export function UpgradePrompt({ feature, requiredPlan = 'pro' }: UpgradePromptProps) {
  const navigate = useNavigate();

  const planLabels = {
    basic: 'Basic',
    pro: 'Pro',
    business: 'Business',
  };

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">
          {feature} ist ein {planLabels[requiredPlan]}-Feature
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upgraden Sie auf {planLabels[requiredPlan]}, um diese Funktion freizuschalten.
        </p>
        <Button onClick={() => navigate('/pricing')}>
          Jetzt upgraden
        </Button>
      </CardContent>
    </Card>
  );
}
