import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { COURSES, type Course, type Lesson } from "@/lib/courses";

interface UseCourseResult {
  courses: Course[];
  loading: boolean;
  usingLocal: boolean;
}

export function useCourses(): UseCourseResult {
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [loading, setLoading] = useState(true);
  const [usingLocal, setUsingLocal] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data: dbCourses, error } = await supabase
          .from("learn_courses")
          .select("id, title, description, category, difficulty, is_premium, lesson_count, estimated_minutes, sort_order")
          .order("sort_order");

        if (error || !dbCourses || dbCourses.length === 0) {
          setCourses(COURSES);
          setUsingLocal(true);
          setLoading(false);
          return;
        }

        // Load lessons for all courses
        const { data: dbLessons } = await supabase
          .from("learn_lessons")
          .select("id, course_id, title, sort_order")
          .order("sort_order");

        const lessonMap = new Map<string, Lesson[]>();
        if (dbLessons) {
          for (const l of dbLessons) {
            const arr = lessonMap.get(l.course_id) || [];
            arr.push({
              id: l.id,
              title: l.title,
              duration: "10 Min",
              free: arr.length < 2, // first 2 lessons free
            });
            lessonMap.set(l.course_id, arr);
          }
        }

        const DIFFICULTY_MAP: Record<string, Course["level"]> = {
          beginner: "anfaenger",
          intermediate: "fortgeschritten",
          advanced: "experte",
        };

        const ICON_MAP: Record<string, string> = {
          budgeting: "from-green-500 to-emerald-600",
          investing: "from-purple-500 to-indigo-600",
          taxes: "from-amber-500 to-orange-600",
          credit: "from-red-500 to-rose-600",
          emergency_fund: "from-blue-500 to-cyan-600",
          insurance: "from-teal-500 to-cyan-600",
        };

        const COLOR_MAP: Record<string, string> = {
          budgeting: "text-green-400",
          investing: "text-purple-400",
          taxes: "text-amber-400",
          credit: "text-red-400",
          emergency_fund: "text-blue-400",
          insurance: "text-teal-400",
        };

        const CATEGORY_MAP: Record<string, string> = {
          budgeting: "Grundlagen",
          investing: "Investieren",
          taxes: "Steuern",
          credit: "Kredite",
          emergency_fund: "Sparen",
          insurance: "Versicherungen",
        };

        const mapped: Course[] = dbCourses.map((c) => {
          const lessons = lessonMap.get(c.id) || [];
          // If no lessons from DB, use local course lessons as fallback
          const localCourse = COURSES.find((lc) => lc.category === (CATEGORY_MAP[c.category] || c.category));
          const finalLessons = lessons.length > 0 ? lessons : localCourse?.lessons || [];

          return {
            id: c.id,
            title: c.title,
            description: c.description || "",
            category: CATEGORY_MAP[c.category] || c.category,
            level: DIFFICULTY_MAP[c.difficulty] || "anfaenger",
            duration: `${c.estimated_minutes} Min`,
            icon: ICON_MAP[c.category] || "from-gray-500 to-slate-600",
            color: COLOR_MAP[c.category] || "text-gray-400",
            free: !c.is_premium,
            certificate: c.is_premium,
            lessons: finalLessons,
          };
        });

        setCourses(mapped);
        setUsingLocal(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses(COURSES);
        setUsingLocal(true);
      }
      setLoading(false);
    }

    fetchCourses();
  }, []);

  return { courses, loading, usingLocal };
}
