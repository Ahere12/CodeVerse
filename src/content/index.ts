import type { Course, Lesson } from './types';
import { startHere } from './courses/startHere';
import { htmlFoundations } from './courses/htmlFoundations';
import { cssFoundations } from './courses/cssFoundations';
import { jsFoundations } from './courses/jsFoundations';
import { jsData } from './courses/jsData';

/** Ordered as the recommended path for a complete beginner. */
export const COURSES: Course[] = [startHere, htmlFoundations, cssFoundations, jsFoundations, jsData];

export const getCourse = (id: string) => COURSES.find((c) => c.id === id);

export interface LessonRef {
  course: Course;
  lesson: Lesson;
  index: number;
  prev?: Lesson;
  next?: Lesson;
}

export function findLesson(courseId: string, lessonId: string): LessonRef | undefined {
  const course = getCourse(courseId);
  if (!course) return;
  const index = course.lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) return;
  return { course, lesson: course.lessons[index], index, prev: course.lessons[index - 1], next: course.lessons[index + 1] };
}

export const lessonPath = (courseId: string, lessonId: string) => `/courses/${courseId}/${lessonId}`;

export const ALL_LESSONS = COURSES.flatMap((course) => course.lessons.map((lesson) => ({ course, lesson })));

export const coursesForLanguage = (languageId: string) => COURSES.filter((c) => c.languageId === languageId);

/** XP for finishing a lesson: base + a bonus per exercise. */
export const lessonXp = (lesson: Lesson) => 20 + 10 * lesson.blocks.filter((b) => b.type === 'exercise').length;

export function courseProgress(course: Course, completed: Record<string, number>) {
  const done = course.lessons.filter((l) => completed[l.id]).length;
  return { done, total: course.lessons.length, pct: done / course.lessons.length, complete: done === course.lessons.length };
}

/** First not-yet-completed lesson in the course, or the first lesson. */
export function nextLessonIn(course: Course, completed: Record<string, number>): Lesson {
  return course.lessons.find((l) => !completed[l.id]) ?? course.lessons[0];
}

export const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } as const;

export const courseMinutes = (c: Course) => c.lessons.reduce((n, l) => n + l.minutes, 0);
