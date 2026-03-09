import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Trophy } from "lucide-react";
import type { Quiz } from "@/lib/quizzes";
import { cn } from "@/lib/utils";

interface Props {
  quiz: Quiz;
}

export function CourseQuiz({ quiz }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = quiz.questions[currentQ];
  const isCorrect = selected === q?.correct;

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= quiz.questions.length) {
      setFinished(true);
    } else {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    return (
      <Card className="border-primary/30">
        <CardContent className="p-6 text-center space-y-4">
          <Trophy className={`h-12 w-12 mx-auto ${pct >= 80 ? "text-amber-400" : pct >= 60 ? "text-primary" : "text-muted-foreground"}`} />
          <div>
            <h3 className="text-xl font-bold">{pct >= 80 ? "Ausgezeichnet!" : pct >= 60 ? "Gut gemacht!" : "Weiter ueben!"}</h3>
            <p className="text-muted-foreground mt-1">
              {score} von {quiz.questions.length} richtig ({pct}%)
            </p>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-muted">
            <div className="bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Quiz wiederholen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {quiz.title}
          </span>
          <span className="text-sm text-muted-foreground font-normal">
            {currentQ + 1} / {quiz.questions.length}
          </span>
        </CardTitle>
        <div className="flex h-1.5 rounded-full overflow-hidden bg-muted mt-2">
          <div
            className="bg-primary transition-all"
            style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{q.question}</p>

        <div className="grid gap-2">
          {q.options.map((option, idx) => {
            let variant = "bg-secondary hover:bg-accent cursor-pointer";
            if (showResult && idx === q.correct) {
              variant = "bg-green-500/15 border-green-500/30 border";
            } else if (showResult && idx === selected && !isCorrect) {
              variant = "bg-red-500/15 border-red-500/30 border";
            } else if (showResult) {
              variant = "bg-secondary opacity-50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={cn(
                  "w-full text-left p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                  variant
                )}
              >
                <span className="h-6 w-6 rounded-full bg-background flex items-center justify-center text-xs shrink-0">
                  {showResult && idx === q.correct ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : showResult && idx === selected ? (
                    <XCircle className="h-4 w-4 text-red-400" />
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`p-3 rounded-xl text-sm ${isCorrect ? "bg-green-500/10" : "bg-amber-500/10"}`}>
            <p className={`font-semibold text-xs mb-0.5 ${isCorrect ? "text-green-500" : "text-amber-400"}`}>
              {isCorrect ? "Richtig!" : "Nicht ganz."}
            </p>
            <p className="text-muted-foreground">{q.explanation}</p>
          </div>
        )}

        {showResult && (
          <div className="flex justify-end">
            <Button size="sm" onClick={handleNext}>
              {currentQ + 1 >= quiz.questions.length ? "Ergebnis anzeigen" : "Naechste Frage"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
