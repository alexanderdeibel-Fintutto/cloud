import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/hooks/useOnboarding";
import GlobalAIChatButton from "@/components/ai/GlobalAIChatButton";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  const location = useLocation();
  const { hasCompletedOnboarding, isLoading, completeOnboarding } = useOnboarding();

  // Show onboarding for first-time users
  if (!isLoading && hasCompletedOnboarding === false) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={showNav ? "pb-24" : ""}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {showNav && <BottomNavigation />}
      <GlobalAIChatButton />
    </div>
  );
}
