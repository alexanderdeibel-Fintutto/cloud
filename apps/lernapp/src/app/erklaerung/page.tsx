"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import PhotoCapture from "@/components/PhotoCapture";
import DifficultySelector, {
  Difficulty,
} from "@/components/DifficultySelector";
import ExplanationDisplay from "@/components/ExplanationDisplay";

export default function ErklaerungPage() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("leicht");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!imageData) return;

    setIsLoading(true);
    setExplanation("");
    setError(null);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, difficulty }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Etwas ist schiefgelaufen.");
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Etwas ist schiefgelaufen."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageData(null);
    setExplanation("");
    setError(null);
  };

  return (
    <main className="min-h-dvh pb-24">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-10 pb-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-white">Aufgabe erklären</h1>
          <p className="text-xs text-white/70 mt-1">
            Fotografiere und verstehe — ganz ohne Lösung
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-3 space-y-4">
        {/* Photo Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <PhotoCapture onPhotoTaken={setImageData} />
        </div>

        {/* Difficulty Selector */}
        {imageData && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-float-up">
            <DifficultySelector
              selected={difficulty}
              onChange={setDifficulty}
            />
          </div>
        )}

        {/* Explain Button */}
        {imageData && !explanation && !isLoading && (
          <button
            onClick={handleExplain}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl py-4 px-6 font-bold text-sm hover:from-primary-600 hover:to-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/25 animate-float-up"
          >
            Erklär mir das! 🚀
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-float-up">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button
              onClick={handleExplain}
              className="mt-2 text-xs text-red-500 underline"
            >
              Nochmal versuchen
            </button>
          </div>
        )}

        {/* Explanation */}
        <ExplanationDisplay
          explanation={explanation}
          difficulty={difficulty}
          isLoading={isLoading}
        />

        {/* Change Difficulty after explanation */}
        {explanation && (
          <div className="space-y-3 animate-float-up">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <DifficultySelector
                selected={difficulty}
                onChange={(newDiff) => {
                  setDifficulty(newDiff);
                  setExplanation("");
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExplain}
                className="flex-1 bg-primary-500 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-primary-600 active:scale-95 transition-all"
              >
                Nochmal erklären
              </button>
              <button
                onClick={handleReset}
                className="bg-slate-100 text-slate-600 rounded-xl py-3 px-4 font-semibold text-sm hover:bg-slate-200 active:scale-95 transition-all"
              >
                Neue Aufgabe
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
