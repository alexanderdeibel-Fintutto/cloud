import { useState } from "react";
import { HelpCircle, FileText, Send, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type DocumentQuestion, useAnswerQuestion } from "@/hooks/useDocuments";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface QuestionsListProps {
  questions: DocumentQuestion[];
  isLoading: boolean;
}

export function QuestionsList({ questions, isLoading }: QuestionsListProps) {
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const answerMutation = useAnswerQuestion();

  const handleAnswer = (questionId: string) => {
    const answer = answerInputs[questionId];
    if (!answer?.trim()) return;
    answerMutation.mutate(
      { questionId, answer },
      {
        onSuccess: () => {
          setAnswerInputs((prev) => {
            const updated = { ...prev };
            delete updated[questionId];
            return updated;
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 mx-auto text-success/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          Keine offenen Fragen
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Alle Belege wurden erfolgreich zugeordnet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <Card key={q.id}>
          <CardContent className="p-4 space-y-3">
            {/* Document reference */}
            {q.document && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span className="truncate">
                  {q.document.vendor_name || q.document.file_name}
                </span>
                {q.document.amount && (
                  <Badge variant="outline" className="text-[10px] h-5">
                    {new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(q.document.amount)}
                  </Badge>
                )}
                <span className="ml-auto">
                  {format(new Date(q.created_at), "dd.MM.", { locale: de })}
                </span>
              </div>
            )}

            {/* Question */}
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm">{q.question}</p>
            </div>

            {/* Suggested answer */}
            {q.suggested_answer && (
              <p className="text-xs text-muted-foreground bg-accent/30 rounded-lg px-3 py-2">
                💡 Vorschlag: {q.suggested_answer}
              </p>
            )}

            {/* Answer input */}
            <div className="flex gap-2">
              <Input
                placeholder="Antwort eingeben..."
                value={answerInputs[q.id] || ""}
                onChange={(e) =>
                  setAnswerInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                className="text-sm h-9"
                onKeyDown={(e) => e.key === "Enter" && handleAnswer(q.id)}
              />
              <Button
                size="sm"
                onClick={() => handleAnswer(q.id)}
                disabled={answerMutation.isPending || !answerInputs[q.id]?.trim()}
                className="h-9"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
