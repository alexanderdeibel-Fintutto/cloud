import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Sun, Moon, Sunrise, Sunset, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GreetingHeaderProps {
  userName: string;
}

export function GreetingHeader({ userName }: GreetingHeaderProps) {
  const hour = new Date().getHours();

  let greeting = "Guten Morgen";
  let Icon = Sunrise;
  let gradientClass = "from-amber-500 via-orange-500 to-rose-500";
  let emoji = "☀️";
  let message = "Zeit, den Tag zu rocken!";

  if (hour >= 12 && hour < 17) {
    greeting = "Guten Tag";
    Icon = Sun;
    gradientClass = "from-sky-400 via-blue-500 to-indigo-500";
    emoji = "🌤️";
    message = "Weiter so, du schaffst das!";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Guten Abend";
    Icon = Sunset;
    gradientClass = "from-orange-400 via-pink-500 to-purple-600";
    emoji = "🌅";
    message = "Fast geschafft für heute!";
  } else if (hour >= 21 || hour < 5) {
    greeting = "Gute Nacht";
    Icon = Moon;
    gradientClass = "from-indigo-500 via-purple-600 to-violet-700";
    emoji = "🌙";
    message = "Ruh dich aus, morgen ist ein neuer Tag.";
  }

  const today = format(new Date(), "EEEE, d. MMMM", { locale: de });
  const firstName = userName.split(" ")[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/[0.06] backdrop-blur-3xl p-6 border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_24px_-4px_rgba(0,0,0,0.3)]">
      {/* Animated background elements */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl animate-pulse-subtle" />
      <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-gradient-to-tr from-accent/15 to-primary/10 blur-2xl" />
      <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-primary/5 blur-xl" />

      <div className="relative">
        {/* Date pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1.5 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {today}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {greeting}, {firstName}! {emoji}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {message}
            </p>
          </div>

          {/* Time-based icon */}
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform hover:scale-105",
              gradientClass
            )}
          >
            <Icon className="h-8 w-8 text-white drop-shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
