import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/hooks/useOnboarding";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  const location = useLocation();
  const { hasCompletedOnboarding, isLoading, completeOnboarding } = useOnboarding();

  if (!isLoading && hasCompletedOnboarding === false) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Global radial gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-radial" />
      <div className="fixed inset-0 bg-black/15 -z-10" />

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
    </div>
  );
}
