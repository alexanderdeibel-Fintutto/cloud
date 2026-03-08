import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import {
  ArrowLeft, ArrowRight, CheckCircle2, BookOpen,
  AlertCircle, Lightbulb, ListChecks, Award,
} from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useEntitlements } from "@/hooks/useEntitlements";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

// ─── Content Block Types (match JSONB structure in learn_lessons.content) ─────

interface TextBlock {
  type: "text";
  content: string;
}

interface HeadingBlock {
  type: "heading";
  content: string;
}

interface ListBlock {
  type: "list";
  items: string[];
}

interface TipBlock {
  type: "tip";
  content: string;
}

interface WarningBlock {
  type: "warning";
  content: string;
}

interface ExampleBlock {
  type: "example";
  title?: string;
  content: string;
}

type ContentBlock = TextBlock | HeadingBlock | ListBlock | TipBlock | WarningBlock | ExampleBlock;

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

// ─── Mock content for lessons without DB content ─────────────────────────────

function generateMockContent(lessonTitle: string): ContentBlock[] {
  return [
    { type: "heading", content: lessonTitle },
    { type: "text", content: "In dieser Lektion lernst du die wichtigsten Konzepte und Strategien, die dir helfen, fundierte Finanzentscheidungen zu treffen." },
    { type: "tip", content: "Nimm dir Zeit, die Beispiele durchzuarbeiten. Praxis schlaegt Theorie!" },
    { type: "list", items: [
      "Grundlegende Konzepte verstehen",
      "Praktische Anwendung im Alltag",
      "Haeufige Fehler vermeiden",
      "Naechste Schritte planen",
    ]},
    { type: "text", content: "Die hier vorgestellten Methoden basieren auf bewaehrten Finanzprinzipien, die von Experten empfohlen werden." },
    { type: "example", title: "Praxis-Beispiel", content: "Stell dir vor, du verdienst 3.000 EUR netto. Nach der 50/30/20-Regel wuerden 1.500 EUR fuer Beduerfnisse, 900 EUR fuer Wuensche und 600 EUR zum Sparen verwendet." },
    { type: "warning", content: "Vergiss nicht: Jede finanzielle Situation ist individuell. Passe die Strategien an deine persoenlichen Umstaende an." },
  ];
}

function generateMockQuiz(lessonTitle: string): QuizQuestion[] {
  return [
    {
      question: `Was ist das Hauptziel dieser Lektion "${lessonTitle}"?`,
      options: [
        "Grundlagen verstehen und anwenden",
        "Nur theoretisches Wissen sammeln",
        "Moeglichst schnell durchklicken",
        "Nichts davon",
      ],
      correct_index: 0,
      explanation: "Das Ziel ist immer, Grundlagen zu verstehen UND praktisch anzuwenden.",
    },
  ];
}

// ─── Content Renderer ────────────────────────────────────────────────────────

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return <h2 className="text-2xl font-bold mt-6 mb-3">{block.content}</h2>;
    case "text":
      return <p className="text-muted-foreground leading-relaxed mb-4">{block.content}</p>;
    case "list":
      return (
        <ul className="space-y-2 mb-4 ml-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-muted-foreground">
              <ListChecks className="h-4 w-4 mt-1 text-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 mb-4">
          <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm">{block.content}</p>
        </div>
      );
    case "warning":
      return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm">{block.content}</p>
        </div>
      );
    case "example":
      return (
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50 mb-4">
          {block.title && <p className="font-semibold text-sm mb-2">{block.title}</p>}
          <p className="text-sm text-muted-foreground">{block.content}</p>
        </div>
      );
    default:
      return null;
  }
}

// ─── Quiz Component ──────────────────────────────────────────────────────────

function QuizSection({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];

  function handleAnswer(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct_index) {
      setCorrectCount((c) => c + 1);
    }
  }

  function handleNext() {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const score = Math.round(((correctCount + (selected === q.correct_index ? 1 : 0)) / questions.length) * 100);
      setFinished(true);
      onComplete(score);
    }
  }

  if (finished) {
    const finalScore = Math.round(correctCount / questions.length * 100);
    return (
      <Card className="border-primary/30">
        <CardContent className="p-6 text-center">
          <Award className="h-12 w-12 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Quiz abgeschlossen!</h3>
          <p className="text-muted-foreground">
            Du hast {correctCount} von {questions.length} Fragen richtig beantwortet ({finalScore}%).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Quiz</h3>
          <span className="text-sm text-muted-foreground">
            Frage {currentQ + 1} von {questions.length}
          </span>
        </div>

        <p className="font-medium mb-4">{q.question}</p>

        <div className="space-y-2 mb-4">
          {q.options.map((opt, idx) => {
            let optClass = "border-border/50 hover:border-primary/50 cursor-pointer";
            if (answered) {
              if (idx === q.correct_index) optClass = "border-green-500 bg-green-500/10";
              else if (idx === selected) optClass = "border-red-500 bg-red-500/10";
              else optClass = "border-border/30 opacity-60";
            } else if (idx === selected) {
              optClass = "border-primary bg-primary/10";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                className={`w-full text-left p-3 rounded-xl border transition-all ${optClass}`}
              >
                <span className="text-sm">{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mb-4 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
            {q.explanation}
          </div>
        )}

        {answered && (
          <Button onClick={handleNext} className="w-full">
            {currentQ + 1 < questions.length ? "Naechste Frage" : "Quiz abschliessen"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { courses } = useCourses();
  const { hasFeature } = useEntitlements();
  const { isLessonComplete, markLessonComplete, getCoursePercent } = useCourseProgress(courseId);

  const [content, setContent] = useState<ContentBlock[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  const course = courses.find((c) => c.id === courseId);
  const lessonIndex = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = course?.lessons[lessonIndex];
  const prevLesson = lessonIndex > 0 ? course?.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < (course?.lessons.length ?? 0) - 1 ? course?.lessons[lessonIndex + 1] : null;

  const hasPremium = hasFeature("learn_premium_courses");
  const canAccess = lesson?.free || hasPremium || course?.free;
  const done = lessonId ? isLessonComplete(lessonId) : false;

  useEffect(() => {
    if (!lessonId) return;

    async function loadContent() {
      setLoadingContent(true);
      const { data, error } = await supabase
        .from("learn_lessons")
        .select("content, quiz")
        .eq("id", lessonId!)
        .single();

      if (!error && data) {
        const blocks = Array.isArray(data.content) ? data.content as ContentBlock[] : [];
        setContent(blocks.length > 0 ? blocks : generateMockContent(lesson?.title || "Lektion"));
        const quizData = Array.isArray(data.quiz) ? data.quiz as QuizQuestion[] : [];
        setQuiz(quizData.length > 0 ? quizData : generateMockQuiz(lesson?.title || "Lektion"));
      } else {
        setContent(generateMockContent(lesson?.title || "Lektion"));
        setQuiz(generateMockQuiz(lesson?.title || "Lektion"));
      }
      setLoadingContent(false);
    }

    loadContent();
  }, [lessonId, lesson?.title]);

  if (!course || !lesson) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Lektion nicht gefunden.</p>
          <Button variant="link" asChild className="mt-2">
            <Link to={courseId ? `/kurse/${courseId}` : "/kurse"}>Zurueck</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!canAccess) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <BookOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Premium-Lektion</h2>
          <p className="text-muted-foreground mb-6">
            Diese Lektion ist Teil des Premium-Kurses. Upgrade, um alle Lektionen freizuschalten.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to={`/kurse/${courseId}`}>Zurueck zum Kurs</Link>
            </Button>
            <Button asChild>
              <Link to="/preise">Premium starten</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  async function handleQuizComplete(score: number) {
    if (courseId && lessonId) {
      await markLessonComplete(courseId, lessonId, score);
    }
  }

  async function handleMarkComplete() {
    if (courseId && lessonId && !done) {
      await markLessonComplete(courseId, lessonId);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/kurse/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {course.title}
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Lektion {lessonIndex + 1} von {course.lessons.length}
          </span>
        </div>

        {/* Progress */}
        <Progress value={getCoursePercent(course.id, course.lessons.length)} className="h-1.5" />

        {/* Lesson Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              done ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
            }`}>
              {done ? <CheckCircle2 className="h-4 w-4" /> : lessonIndex + 1}
            </div>
            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
            {done && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Abgeschlossen</span>}
          </div>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
        </div>

        {/* Content */}
        {loadingContent ? (
          <div className="py-12 text-center text-muted-foreground">Inhalt wird geladen...</div>
        ) : (
          <div className="py-2">
            {content.map((block, i) => (
              <ContentBlockRenderer key={i} block={block} />
            ))}
          </div>
        )}

        {/* Quiz */}
        {!loadingContent && quiz.length > 0 && (
          <QuizSection questions={quiz} onComplete={handleQuizComplete} />
        )}

        {/* Mark Complete (if no quiz or already done) */}
        {!done && quiz.length === 0 && (
          <Button onClick={handleMarkComplete} className="w-full" size="lg">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Lektion abschliessen
          </Button>
        )}

        {/* Lesson Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          {prevLesson ? (
            <Button variant="outline" asChild>
              <Link to={`/kurse/${courseId}/lektion/${prevLesson.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vorherige
              </Link>
            </Button>
          ) : <div />}

          {nextLesson ? (
            <Button asChild>
              <Link to={`/kurse/${courseId}/lektion/${nextLesson.id}`}>
                Naechste Lektion
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to={`/kurse/${courseId}`}>
                Kurs-Uebersicht
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
