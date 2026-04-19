import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
}

export function PageHeader({ title, subtitle, action, className, showBackButton }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 border-b border-border",
        "bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 shrink-0 rounded-xl hover:bg-secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
