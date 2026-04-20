"use client";

import { Difficulty } from "./DifficultySelector";

interface ExplanationDisplayProps {
  explanation: string;
  difficulty: Difficulty;
  isLoading: boolean;
}

const difficultyConfig: Record<
  Difficulty,
  { gradient: string; icon: string; label: string }
> = {
  leicht: {
    gradient: "from-blue-50 to-blue-100",
    icon: "💡",
    label: "Leicht erklärt",
  },
  superleicht: {
    gradient: "from-purple-50 to-purple-100",
    icon: "✨",
    label: "Superleicht erklärt",
  },
  kinderleicht: {
    gradient: "from-orange-50 to-orange-100",
    icon: "🧒",
    label: "Kinderleicht erklärt",
  },
};

export default function ExplanationDisplay({
  explanation,
  difficulty,
  isLoading,
}: ExplanationDisplayProps) {
  const config = difficultyConfig[difficulty];

  if (isLoading) {
    return (
      <div className="animate-float-up">
        <div className={`rounded-2xl p-5 bg-gradient-to-br ${config.gradient}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{config.icon}</span>
            <span className="text-sm font-bold text-slate-700">
              {config.label}
            </span>
          </div>
          <div className="space-y-3">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-4/6" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/6" />
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            Ich denke nach...
          </p>
        </div>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="animate-float-up">
      <div className={`rounded-2xl p-5 bg-gradient-to-br ${config.gradient}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{config.icon}</span>
          <span className="text-sm font-bold text-slate-700">
            {config.label}
          </span>
        </div>
        <div className="prose prose-sm prose-slate max-w-none">
          {explanation.split("\n").map((paragraph, i) => {
            if (!paragraph.trim()) return null;
            return (
              <p key={i} className="text-sm text-slate-700 leading-relaxed mb-2">
                {paragraph}
              </p>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-200/50">
          <p className="text-[10px] text-slate-400 text-center">
            Nur Erklärung — keine Lösung. Du schaffst das! 💪
          </p>
        </div>
      </div>
    </div>
  );
}
