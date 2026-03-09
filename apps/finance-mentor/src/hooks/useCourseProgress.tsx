import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface LessonProgress {
  course_id: string;
  lesson_id: string;
  progress: number;
  quiz_score: number | null;
  completed_at: string | null;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percent: number;
  quizAvg: number | null;
  isComplete: boolean;
}

export function useCourseProgress(courseId?: string) {
  const { user } = useAuth();
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLessonProgress([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("learn_progress")
        .select("course_id, lesson_id, progress, quiz_score, completed_at")
        .eq("user_id", user.id);

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching progress:", error);
        setLessonProgress([]);
      } else {
        setLessonProgress(data || []);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
      setLessonProgress([]);
    }
    setLoading(false);
  }, [user, courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markLessonComplete = async (cId: string, lessonId: string, quizScore?: number) => {
    if (!user) return;

    const row = {
      user_id: user.id,
      course_id: cId,
      lesson_id: lessonId,
      progress: 100,
      quiz_score: quizScore ?? null,
      completed_at: new Date().toISOString(),
    };

    await supabase
      .from("learn_progress")
      .upsert(row, { onConflict: "user_id,course_id,lesson_id" });

    await fetchProgress();
  };

  const checkAndGrantCertificate = async (cId: string, totalLessons: number): Promise<boolean> => {
    if (!user || totalLessons === 0) return false;

    const completed = lessonProgress.filter(
      (p) => p.course_id === cId && p.progress >= 100
    ).length;

    if (completed < totalLessons) return false;

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from("learn_certificates")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", cId)
      .limit(1);

    if (existing && existing.length > 0) return false;

    // Calculate average quiz score
    const quizScores = lessonProgress
      .filter((p) => p.course_id === cId && p.quiz_score != null)
      .map((p) => p.quiz_score as number);
    const avgScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((s, q) => s + q, 0) / quizScores.length)
      : 100;

    // Generate certificate number: FMC-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const certNumber = `FMC-${dateStr}-${rand}`;

    await supabase.from("learn_certificates").insert({
      user_id: user.id,
      course_id: cId,
      certificate_number: certNumber,
      final_score: avgScore,
    });

    return true;
  };

  const isLessonComplete = (lessonId: string): boolean => {
    return lessonProgress.some(
      (p) => p.lesson_id === lessonId && p.progress >= 100
    );
  };

  const getCoursePercent = (cId: string, totalLessons: number): number => {
    if (totalLessons === 0) return 0;
    const completed = lessonProgress.filter(
      (p) => p.course_id === cId && p.progress >= 100
    ).length;
    return Math.round((completed / totalLessons) * 100);
  };

  return {
    lessonProgress,
    loading,
    markLessonComplete,
    isLessonComplete,
    getCoursePercent,
    checkAndGrantCertificate,
    refresh: fetchProgress,
  };
}
