import { useState, useEffect } from "react";

const ONBOARDING_KEY = "wohnheld_onboarding_completed";

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(completed === "true");
    setIsLoading(false);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHasCompletedOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(false);
  };

  return {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
