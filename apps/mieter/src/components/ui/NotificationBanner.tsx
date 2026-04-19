import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationBannerProps {
  type: NotificationType;
  title: string;
  message?: string;
  isVisible: boolean;
  onClose?: () => void;
  autoClose?: number;
  className?: string;
}

const typeConfig = {
  success: {
    icon: Check,
    bgClass: "bg-success",
    iconBgClass: "bg-success/20",
    borderClass: "border-success/30",
  },
  error: {
    icon: AlertCircle,
    bgClass: "bg-destructive",
    iconBgClass: "bg-destructive/20",
    borderClass: "border-destructive/30",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-warning",
    iconBgClass: "bg-warning/20",
    borderClass: "border-warning/30",
  },
  info: {
    icon: Info,
    bgClass: "bg-info",
    iconBgClass: "bg-info/20",
    borderClass: "border-info/30",
  },
};

export function NotificationBanner({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose,
  className,
}: NotificationBannerProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "fixed top-4 left-4 right-4 z-50 mx-auto max-w-md",
            className
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border backdrop-blur-xl",
              "bg-card/95 shadow-2xl",
              config.borderClass
            )}
          >
            {/* Gradient accent bar */}
            <div className={cn("absolute top-0 left-0 right-0 h-1", config.bgClass)} />
            
            <div className="p-4 flex items-start gap-3">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  config.bgClass
                )}
              >
                <Icon className="h-5 w-5 text-white" />
              </motion.div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{title}</p>
                {message && (
                  <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
                )}
              </div>
              
              {/* Close button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
