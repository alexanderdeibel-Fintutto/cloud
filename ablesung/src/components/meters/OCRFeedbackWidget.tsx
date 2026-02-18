import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Edit2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface OCRFeedbackWidgetProps {
  ocrValue: number | null;
  confirmedValue: number;
  confidence?: number;
  onFeedback: (feedback: { correct: boolean; correctedValue?: number }) => void;
}

// Store OCR feedback locally for quality tracking
const FEEDBACK_KEY = 'fintutto_ocr_feedback';

interface OCRFeedbackEntry {
  timestamp: string;
  ocrValue: number | null;
  confirmedValue: number;
  wasCorrect: boolean;
  correctedValue?: number;
  confidence?: number;
}

function loadFeedback(): OCRFeedbackEntry[] {
  try {
    const data = localStorage.getItem(FEEDBACK_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveFeedbackEntry(entry: OCRFeedbackEntry) {
  const existing = loadFeedback();
  existing.push(entry);
  // Keep last 100 entries
  const trimmed = existing.slice(-100);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(trimmed));
}

export function getOCRAccuracy(): { total: number; correct: number; rate: number } {
  const feedback = loadFeedback();
  const total = feedback.length;
  const correct = feedback.filter(f => f.wasCorrect).length;
  return { total, correct, rate: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

export function OCRFeedbackWidget({ ocrValue, confirmedValue, confidence, onFeedback }: OCRFeedbackWidgetProps) {
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctedValue, setCorrectedValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (ocrValue === null || submitted) return null;

  const isMatch = ocrValue === confirmedValue;

  const handleCorrect = () => {
    saveFeedbackEntry({
      timestamp: new Date().toISOString(),
      ocrValue,
      confirmedValue,
      wasCorrect: true,
      confidence,
    });
    onFeedback({ correct: true });
    setSubmitted(true);
  };

  const handleIncorrect = () => {
    setShowCorrection(true);
  };

  const submitCorrection = () => {
    const val = parseFloat(correctedValue);
    if (isNaN(val)) return;

    saveFeedbackEntry({
      timestamp: new Date().toISOString(),
      ocrValue,
      confirmedValue: val,
      wasCorrect: false,
      correctedValue: val,
      confidence,
    });
    onFeedback({ correct: false, correctedValue: val });
    setSubmitted(true);
  };

  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardContent className="p-3">
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
          OCR-Ergebnis bewerten
          {confidence && <span className="ml-1 text-muted-foreground">({confidence}% Konfidenz)</span>}
        </p>

        {!showCorrection ? (
          <div className="flex items-center gap-2">
            <span className="text-sm flex-1">
              Erkannt: <strong>{ocrValue?.toLocaleString('de-DE')}</strong>
              {isMatch && <span className="text-green-500 ml-1">(stimmt)</span>}
            </span>
            <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-500/30" onClick={handleCorrect}>
              <ThumbsUp className="w-3.5 h-3.5 mr-1" />Richtig
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-red-500 border-red-500/30" onClick={handleIncorrect}>
              <ThumbsDown className="w-3.5 h-3.5 mr-1" />Falsch
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Korrektur:</span>
            <Input
              type="number"
              value={correctedValue}
              onChange={(e) => setCorrectedValue(e.target.value)}
              placeholder="Richtiger Wert"
              className="h-8 text-sm flex-1"
              autoFocus
            />
            <Button size="sm" className="h-8" onClick={submitCorrection} disabled={!correctedValue}>
              <Check className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
