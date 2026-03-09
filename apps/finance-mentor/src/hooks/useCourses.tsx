import { useState } from "react";
import { COURSES, type Course } from "@/lib/courses";

interface UseCourseResult {
  courses: Course[];
  loading: boolean;
  usingLocal: boolean;
}

/**
 * Always use local static courses.
 *
 * The previous DB-backed fetch caused a critical bug: Supabase learn_courses
 * uses UUIDs as IDs, but all lesson content (LESSON_CONTENT), quizzes (QUIZZES),
 * route params (/kurse/:courseId), and learning paths reference slug-based IDs
 * like "budgetierung-101". When DB courses loaded, their UUID IDs didn't match
 * any content, making every course appear empty / "not found".
 */
export function useCourses(): UseCourseResult {
  const [courses] = useState<Course[]>(COURSES);

  return { courses, loading: false, usingLocal: true };
}
