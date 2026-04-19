import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Clock, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingTimerProps {
  taskTitle?: string;
  onStop?: (duration: number) => void;
}

export function FloatingTimer({ taskTitle, onStop }: FloatingTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setIsExpanded(true);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    onStop?.(seconds);
    setSeconds(0);
    setIsExpanded(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 5000);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 transition-all duration-300 ease-out",
        isExpanded ? "translate-y-0" : "translate-y-0"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300",
          isRunning && !isPaused
            ? "border-primary/50 bg-card/95 shadow-primary/20 glow-primary"
            : isPaused
            ? "border-warning/50 bg-card/95 shadow-warning/20"
            : "border-border bg-card/95"
        )}
        style={{ backdropFilter: "blur(20px)" }}
      >
        {/* Animated background gradient */}
        {isRunning && !isPaused && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-shimmer" />
        )}

        <div className="relative p-4">
          {/* Compact/Collapsed View */}
          {!isExpanded ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  onClick={handleStart}
                  className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg glow-primary"
                >
                  <Play className="h-5 w-5 ml-0.5" />
                </Button>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Zeiterfassung starten
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tippe um loszulegen
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            /* Expanded View */
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      isRunning && !isPaused
                        ? "bg-primary/20 text-primary"
                        : isPaused
                        ? "bg-warning/20 text-warning"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {isPaused ? "Pausiert" : isRunning ? "Läuft" : "Bereit"}
                    </p>
                    {taskTitle && (
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {taskTitle}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Timer Display */}
              <div className="text-center py-2">
                <span
                  className={cn(
                    "text-5xl font-bold tabular-nums tracking-tight transition-colors",
                    isRunning && !isPaused
                      ? "text-primary"
                      : isPaused
                      ? "text-warning"
                      : "text-foreground"
                  )}
                >
                  {formatTime(seconds)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRunning ? (
                  <Button
                    onClick={handleStart}
                    className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg glow-primary"
                    size="icon"
                  >
                    <Play className="h-6 w-6 ml-0.5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleStop}
                      variant="outline"
                      className="h-12 w-12 rounded-full border-destructive/50 text-destructive hover:bg-destructive/10"
                      size="icon"
                    >
                      <Square className="h-5 w-5" />
                    </Button>

                    <Button
                      onClick={handlePause}
                      className={cn(
                        "h-14 w-14 rounded-full shadow-lg transition-all",
                        isPaused
                          ? "bg-primary hover:bg-primary/90 glow-primary"
                          : "bg-warning hover:bg-warning/90 glow-warning"
                      )}
                      size="icon"
                    >
                      {isPaused ? (
                        <Play className="h-6 w-6 ml-0.5" />
                      ) : (
                        <Pause className="h-6 w-6" />
                      )}
                    </Button>

                    <div className="h-12 w-12" /> {/* Spacer for alignment */}
                  </>
                )}
              </div>

              {/* Quick tip */}
              {!isRunning && (
                <p className="text-center text-xs text-muted-foreground">
                  Zeit wird automatisch zur aktuellen Aufgabe hinzugefügt
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
