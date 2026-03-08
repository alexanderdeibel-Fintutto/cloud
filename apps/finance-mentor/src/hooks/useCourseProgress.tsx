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
    refresh: fetchProgress,
  };
}
