import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  feature?: string;
  requiredPlan?: "basic" | "pro" | "business";
  className?: string;
}

export function UpgradePrompt({ 
  feature = "Diese Funktion", 
  requiredPlan = "pro",
  className 
}: UpgradePromptProps) {
  const navigate = useNavigate();

  const planNames = {
    basic: "Basic",
    pro: "Pro",
    business: "Business",
  };

  return (
    <Card className={`border-dashed border-2 border-primary/20 bg-primary/5 ${className}`}>
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            {planNames[requiredPlan]}-Feature
          </h3>
          <p className="text-muted-foreground">
            {feature} ist im {planNames[requiredPlan]}-Plan verfügbar.
          </p>
        </div>
        
        <Button 
          onClick={() => navigate("/pricing")} 
          className="w-full sm:w-auto"
        >
          Jetzt upgraden
        </Button>
      </CardContent>
    </Card>
  );
}
