import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FloatingActionProps {
  children: ReactNode;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

interface ActionItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionMenuProps {
  items: ActionItem[];
  isOpen: boolean;
  onToggle: () => void;
  mainIcon?: ReactNode;
  closeIcon?: ReactNode;
  position?: "bottom-right" | "bottom-center" | "bottom-left";
  className?: string;
}

export function FloatingActionMenu({
  items,
  isOpen,
  onToggle,
  mainIcon,
  closeIcon,
  position = "bottom-right",
  className,
}: FloatingActionMenuProps) {
  const positionClasses = {
    "bottom-right": "bottom-24 right-4",
    "bottom-center": "bottom-24 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-24 left-4",
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Menu Items */}
      <div className={cn("fixed z-50", positionClasses[position], className)}>
        {isOpen && (
          <div className="flex flex-col-reverse gap-3 mb-4">
            {items.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 20, 
                  scale: 0.8,
                  transition: { delay: (items.length - index) * 0.03 }
                }}
                onClick={() => {
                  item.onClick();
                  onToggle();
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl bg-card border border-border/50",
                  "hover:scale-105 transition-transform active:scale-95"
                )}
              >
                <div 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                    item.color || "gradient-primary"
                  )}
                >
                  {item.icon}
                </div>
                <span className="font-medium text-foreground whitespace-nowrap pr-2">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
