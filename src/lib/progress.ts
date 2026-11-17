/** Pure helpers for XP, levels, streaks and activity. No React, easy to unit test. */

export interface DayActivity {
  /** Active learning minutes (tab visible + recent interaction). */
  minutes: number;
  xp: number;
  lessons: number;
  challenges: number;
}

export type ActivityLog = Record<string, DayActivity>;

export const emptyDay = (): DayActivity => ({ minutes: 0, xp: 0, lessons: 0, challenges: 0 });

/** Local-time YYYY-MM-DD key (not UTC, so "today" matches the learner's clock). */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Last `n` days ending today, oldest first. */
export function lastNDays(n: number, today: Date = new Date()): Date[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

/* ---------- Levels ----------
 * XP needed to *reach* level L is 50 * (L-1) * L. Level 2 = 100xp, 3 = 300xp, 4 = 600xp...
 * Gentle early, slower later.
 */
export const xpForLevel = (level: number) => 50 * (level - 1) * level;

export function levelInfo(xp: number) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return {
    level,
    intoLevel: xp - floor,
    levelSize: ceil - floor,
    toNext: ceil - xp,
    pct: (xp - floor) / (ceil - floor),
  };
}

/* ---------- Streaks ----------
 * A day "counts" when the learner finished something (lesson/challenge) or earned XP.
 * Today not yet counting does NOT break the streak — the learner still has the day.
 */
const counts = (a?: DayActivity) => !!a && (a.lessons > 0 || a.challenges > 0 || a.xp > 0);

export function currentStreak(log: ActivityLog, today: Date = new Date()): number {
  let cursor = counts(log[dayKey(today)]) ? today : addDays(today, -1);
  let streak = 0;
  while (counts(log[dayKey(cursor)])) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(log: ActivityLog): number {
  const days = Object.keys(log).filter((k) => counts(log[k])).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of days) {
    const [y, m, d] = k.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    run = prev && dayKey(addDays(prev, 1)) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = date;
  }
  return best;
}

export function totals(log: ActivityLog) {
  return Object.values(log).reduce(
    (acc, d) => ({
      minutes: acc.minutes + d.minutes,
      lessons: acc.lessons + d.lessons,
      challenges: acc.challenges + d.challenges,
      xp: acc.xp + d.xp,
    }),
    emptyDay(),
  );
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}
