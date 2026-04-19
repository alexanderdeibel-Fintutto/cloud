"use client";

export type Difficulty = "leicht" | "superleicht" | "kinderleicht";

interface DifficultySelectorProps {
  selected: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

const difficulties: {
  key: Difficulty;
  label: string;
  emoji: string;
  description: string;
  color: string;
}[] = [
  {
    key: "leicht",
    label: "Leicht",
    emoji: "💡",
    description: "Normale einfache Erklärung",
    color: "from-blue-400 to-blue-500",
  },
  {
    key: "superleicht",
    label: "Superleicht",
    emoji: "✨",
    description: "Extra vereinfacht mit Beispielen",
    color: "from-purple-400 to-purple-500",
  },
  {
    key: "kinderleicht",
    label: "Kinderleicht",
    emoji: "🧒",
    description: "So dass es jeder 12-Jährige versteht",
    color: "from-orange-400 to-orange-500",
  },
];

export default function DifficultySelector({
  selected,
  onChange,
}: DifficultySelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-600 px-1">
        Wie soll ich es erklären?
      </p>
      <div className="grid grid-cols-3 gap-2">
        {difficulties.map((diff) => (
          <button
            key={diff.key}
            onClick={() => onChange(diff.key)}
            className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
              selected === diff.key
                ? "bg-gradient-to-br " +
                  diff.color +
                  " text-white shadow-lg scale-105"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <span className="text-2xl">{diff.emoji}</span>
            <span className="text-xs font-bold">{diff.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center mt-1">
        {difficulties.find((d) => d.key === selected)?.description}
      </p>
    </div>
  );
}
