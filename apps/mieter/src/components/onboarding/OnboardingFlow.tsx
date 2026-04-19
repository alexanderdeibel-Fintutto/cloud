import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, FileText, Wrench, MessageCircle, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  gradient: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Home className="w-16 h-16" />,
    title: "Willkommen bei Wohn-Held",
    description: "Dein digitaler Begleiter für alles rund um deine Wohnung. Einfach, schnell und immer dabei.",
    color: "text-primary",
    gradient: "from-primary/20 to-secondary/20",
  },
  {
    icon: <FileText className="w-16 h-16" />,
    title: "Finanzen im Blick",
    description: "Behalte deine Miete und Nebenkosten immer im Überblick. Alle Zahlungen auf einen Blick.",
    color: "text-mint",
    gradient: "from-mint/20 to-sky/20",
  },
  {
    icon: <Wrench className="w-16 h-16" />,
    title: "Mängel schnell melden",
    description: "Wasserhahn tropft? Heizung kalt? Melde Probleme mit wenigen Klicks direkt an die Verwaltung.",
    color: "text-coral",
    gradient: "from-coral/20 to-amber/20",
  },
  {
    icon: <MessageCircle className="w-16 h-16" />,
    title: "Direkte Kommunikation",
    description: "Chatte direkt mit deiner Hausverwaltung. Schnelle Antworten, keine Umwege.",
    color: "text-sky",
    gradient: "from-sky/20 to-primary/20",
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={cn("absolute inset-0 bg-gradient-to-br", step.gradient)}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 -right-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Skip Button */}
      <div className="relative z-10 flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="text-muted-foreground"
        >
          Überspringen
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {/* Animated Icon */}
            <motion.div
              className={cn(
                "mb-8 p-8 rounded-3xl bg-background/80 backdrop-blur-sm shadow-xl",
                step.color
              )}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {step.icon}
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-2xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {step.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-muted-foreground text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {step.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots & Navigation */}
      <div className="relative z-10 p-8 pb-12">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentStep ? 1 : -1);
                setCurrentStep(index);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentStep
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={goToPrev}
            disabled={currentStep === 0}
            className={cn(
              "transition-opacity",
              currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Zurück
          </Button>

          <Button
            size="lg"
            onClick={goToNext}
            className="flex-1 max-w-xs gradient-primary text-white shadow-lg"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Los geht's!
              </>
            ) : (
              <>
                Weiter
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>

          {/* Invisible spacer for alignment */}
          <div className={cn(
            "w-24",
            currentStep === 0 ? "visible" : "invisible"
          )} />
        </div>
      </div>
    </div>
  );
}
