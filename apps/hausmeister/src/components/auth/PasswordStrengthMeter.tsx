import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
}

type Strength = 0 | 1 | 2 | 3 | 4;

const LABELS: Record<Strength, string> = {
  0: "",
  1: "Sehr schwach",
  2: "Schwach",
  3: "Gut",
  4: "Stark",
};

const COLORS: Record<Strength, string> = {
  0: "bg-muted",
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-emerald-500",
};

function calcStrength(pw: string): Strength {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return 1;
  if (score <= 2) return 2;
  if (score <= 3) return 3;
  return 4;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => calcStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {([1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              strength >= level ? COLORS[strength] : "bg-muted/40"
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-[11px] font-medium transition-colors",
          strength <= 2 ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {LABELS[strength]}
      </p>
    </div>
  );
}
