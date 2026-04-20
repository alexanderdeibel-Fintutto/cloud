import { motion } from "framer-motion";
import { LucideIcon, FileQuestion, MessageSquare, Bell, Inbox, Search, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateVariant = 
  | "no-data" 
  | "no-messages" 
  | "no-notifications" 
  | "no-search-results" 
  | "no-documents"
  | "search"
  | "custom";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const variants: Record<Exclude<EmptyStateVariant, "custom">, {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}> = {
  "no-data": {
    icon: Inbox,
    title: "Noch keine Daten",
    description: "Hier werden deine Daten angezeigt, sobald welche vorhanden sind.",
    color: "text-muted-foreground",
  },
  "no-messages": {
    icon: MessageSquare,
    title: "Keine Nachrichten",
    description: "Du hast noch keine Nachrichten. Starte eine Konversation!",
    color: "text-sky",
  },
  "no-notifications": {
    icon: Bell,
    title: "Alles erledigt!",
    description: "Du hast keine neuen Benachrichtigungen.",
    color: "text-mint",
  },
  "no-search-results": {
    icon: Search,
    title: "Keine Ergebnisse",
    description: "Wir konnten nichts zu deiner Suche finden. Versuche es mit anderen Begriffen.",
    color: "text-amber",
  },
  "no-documents": {
    icon: FileX,
    title: "Keine Dokumente",
    description: "Hier werden deine Dokumente angezeigt, sobald welche hochgeladen wurden.",
    color: "text-coral",
  },
  "search": {
    icon: Search,
    title: "Keine Ergebnisse",
    description: "Wir konnten nichts zu deiner Suche finden. Versuche es mit anderen Begriffen.",
    color: "text-amber",
  },
};

export function EmptyState({
  variant = "no-data",
  icon: CustomIcon,
  title: customTitle,
  description: customDescription,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const config = variant !== "custom" ? variants[variant] : null;
  const Icon = CustomIcon || config?.icon || FileQuestion;
  const title = customTitle || config?.title || "Keine Daten";
  const description = customDescription || config?.description || "";
  const color = config?.color || "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      {/* Animated Icon with Background */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      >
        {/* Decorative circles */}
        <motion.div
          className="absolute inset-0 rounded-full bg-muted/50 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={cn(
            "relative w-24 h-24 rounded-full bg-muted/80 flex items-center justify-center",
            color
          )}
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon className="w-10 h-10" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-lg font-semibold text-foreground mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-sm text-muted-foreground max-w-xs mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={onAction} variant="outline">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
