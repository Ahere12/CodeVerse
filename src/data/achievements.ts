import { currentStreak, longestStreak, totals, type ActivityLog } from '../lib/progress';
import { COURSES, courseProgress } from '../content';

export interface AchievementContext {
  xp: number;
  activity: ActivityLog;
  onboarded: boolean;
  preferredLanguages: string[];
  completedLessons: Record<string, number>;
  challenges?: Record<string, { solvedAt?: number }>;
}

const solvedCount = (c: AchievementContext) => Object.values(c.challenges ?? {}).filter((r) => r.solvedAt).length;
const lessonCount = (c: AchievementContext) => Object.keys(c.completedLessons).length;
const coursesDone = (c: AchievementContext) => COURSES.filter((co) => courseProgress(co, c.completedLessons).complete).length;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** Lucide icon name, resolved in the UI. */
  icon: 'Sparkles' | 'Flame' | 'Clock' | 'Zap' | 'Compass' | 'Target' | 'Trophy' | 'BookOpen';
  check: (c: AchievementContext) => boolean;
  /** Optional 0–1 progress for locked achievements. */
  progress?: (c: AchievementContext) => number;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Only achievements whose conditions can be met by features that exist today.
 * Challenge and project achievements are added alongside those systems.
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'hello-world',
    title: 'Hello, World',
    description: 'Set up your learning profile.',
    icon: 'Sparkles',
    check: (c) => c.onboarded,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Pick three languages you want to learn.',
    icon: 'Compass',
    check: (c) => c.preferredLanguages.length >= 3,
    progress: (c) => clamp(c.preferredLanguages.length / 3),
  },
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson.',
    icon: 'BookOpen',
    check: (c) => lessonCount(c) >= 1,
  },
  {
    id: 'ten-lessons',
    title: 'Bookworm',
    description: 'Complete 10 lessons.',
    icon: 'BookOpen',
    check: (c) => lessonCount(c) >= 10,
    progress: (c) => clamp(lessonCount(c) / 10),
  },
  {
    id: 'first-course',
    title: 'Graduate',
    description: 'Complete a whole course and earn a certificate.',
    icon: 'Trophy',
    check: (c) => coursesDone(c) >= 1,
    progress: (c) => clamp(Math.max(...COURSES.map((co) => courseProgress(co, c.completedLessons).pct))),
  },
  {
    id: 'web-trio',
    title: 'Web Builder',
    description: 'Complete HTML, CSS and JavaScript Foundations.',
    icon: 'Target',
    check: (c) => ['html-foundations', 'css-foundations', 'js-foundations'].every((id) => courseProgress(COURSES.find((co) => co.id === id)!, c.completedLessons).complete),
    progress: (c) => clamp(['html-foundations', 'css-foundations', 'js-foundations'].reduce((n, id) => n + courseProgress(COURSES.find((co) => co.id === id)!, c.completedLessons).pct, 0) / 3),
  },
  {
    id: 'first-challenge',
    title: 'Problem Solver',
    description: 'Solve your first coding challenge.',
    icon: 'Zap',
    check: (c) => solvedCount(c) >= 1,
  },
  {
    id: 'ten-challenges',
    title: 'Puzzle Master',
    description: 'Solve 10 coding challenges.',
    icon: 'Trophy',
    check: (c) => solvedCount(c) >= 10,
    progress: (c) => clamp(solvedCount(c) / 10),
  },
  {
    id: 'first-hour',
    title: 'First Hour',
    description: 'Spend 60 minutes actively learning.',
    icon: 'Clock',
    check: (c) => totals(c.activity).minutes >= 60,
    progress: (c) => clamp(totals(c.activity).minutes / 60),
  },
  {
    id: 'streak-3',
    title: 'Getting Into It',
    description: 'Learn on 3 days in a row.',
    icon: 'Flame',
    check: (c) => longestStreak(c.activity) >= 3,
    progress: (c) => clamp(Math.max(currentStreak(c.activity), longestStreak(c.activity)) / 3),
  },
  {
    id: 'streak-7',
    title: 'Week of Code',
    description: 'Learn on 7 days in a row.',
    icon: 'Flame',
    check: (c) => longestStreak(c.activity) >= 7,
    progress: (c) => clamp(Math.max(currentStreak(c.activity), longestStreak(c.activity)) / 7),
  },
  {
    id: 'xp-100',
    title: 'Level Up',
    description: 'Earn 100 XP.',
    icon: 'Zap',
    check: (c) => c.xp >= 100,
    progress: (c) => clamp(c.xp / 100),
  },
  {
    id: 'xp-1000',
    title: 'Committed',
    description: 'Earn 1,000 XP.',
    icon: 'Trophy',
    check: (c) => c.xp >= 1000,
    progress: (c) => clamp(c.xp / 1000),
  },
  {
    id: 'ten-hours',
    title: 'Deep Work',
    description: 'Spend 10 hours actively learning.',
    icon: 'Target',
    check: (c) => totals(c.activity).minutes >= 600,
    progress: (c) => clamp(totals(c.activity).minutes / 600),
  },
];
