/**
 * Merges two copies of a learner's progress (this device + the cloud) without losing work.
 * Pure and unit-tested — no I/O here.
 *
 * Rules:
 *  - Completed lessons, achievements, bookmarks: union (earliest timestamp wins).
 *  - Activity per day: field-wise max (the same day studied on two devices isn't double-counted).
 *  - XP: the highest of either copy or the total XP recorded in the merged activity log.
 *  - Exercises: passed if passed anywhere; attempts = max.
 *  - Notes and drafts: this device's version wins when it has one.
 *  - Placement and "last visited": the most recent wins.
 *  - Preferences: this device's, unless this device hasn't been set up yet.
 */
import type { ActivityLog } from './progress';

export interface SyncedState {
  prefs: Record<string, unknown>;
  xp: number;
  activity: ActivityLog;
  lastVisited: { at: number } & Record<string, unknown> | null;
  onboarded: boolean;
  achievements: Record<string, number>;
  completedLessons: Record<string, number>;
  exercises: Record<string, { passedAt?: number; revealed?: boolean; attempts: number }>;
  drafts: Record<string, string>;
  bookmarks: string[];
  notes: Record<string, string>;
  placement: ({ takenAt: number } & Record<string, unknown>) | null;
  /** Challenge results keyed by challenge id (added in Phase 4). */
  challenges?: Record<string, { solvedAt?: number; attempts: number; bestMs?: number }>;
  /** Saved playground projects keyed by id. */
  projects?: Record<string, { updatedAt: number } & Record<string, unknown>>;
  roadmapChecks?: Record<string, number>;
  guided?: Record<string, { steps: number[]; playgroundId?: string; startedAt: number; completedAt?: number }>;
}

const minTs = (a?: number, b?: number) => (a === undefined ? b : b === undefined ? a : Math.min(a, b));

function unionTimestamps(a: Record<string, number> = {}, b: Record<string, number> = {}) {
  const out: Record<string, number> = { ...b };
  for (const [k, v] of Object.entries(a)) out[k] = minTs(v, out[k])!;
  return out;
}

function newest<T extends { at?: number; takenAt?: number; updatedAt?: number } | null>(a: T, b: T): T {
  if (!a) return b;
  if (!b) return a;
  const ta = a.at ?? a.takenAt ?? a.updatedAt ?? 0;
  const tb = b.at ?? b.takenAt ?? b.updatedAt ?? 0;
  return ta >= tb ? a : b;
}

export function mergeProgress(local: SyncedState, remote: SyncedState | null | undefined): SyncedState {
  if (!remote) return local;

  const activity: ActivityLog = { ...remote.activity };
  for (const [day, d] of Object.entries(local.activity ?? {})) {
    const r = activity[day];
    activity[day] = r
      ? { minutes: Math.max(d.minutes, r.minutes), xp: Math.max(d.xp, r.xp), lessons: Math.max(d.lessons, r.lessons), challenges: Math.max(d.challenges, r.challenges) }
      : d;
  }
  const activityXp = Object.values(activity).reduce((n, d) => n + d.xp, 0);

  const exercises: SyncedState['exercises'] = { ...remote.exercises };
  for (const [id, e] of Object.entries(local.exercises ?? {})) {
    const r = exercises[id];
    exercises[id] = r
      ? { passedAt: minTs(e.passedAt, r.passedAt), revealed: !!(e.revealed || r.revealed), attempts: Math.max(e.attempts, r.attempts) }
      : e;
  }

  const challenges: NonNullable<SyncedState['challenges']> = { ...(remote.challenges ?? {}) };
  for (const [id, c] of Object.entries(local.challenges ?? {})) {
    const r = challenges[id];
    challenges[id] = r
      ? {
          solvedAt: minTs(c.solvedAt, r.solvedAt),
          attempts: Math.max(c.attempts, r.attempts),
          bestMs: c.bestMs === undefined ? r.bestMs : r.bestMs === undefined ? c.bestMs : Math.min(c.bestMs, r.bestMs),
        }
      : c;
  }

  const projects: NonNullable<SyncedState['projects']> = { ...(remote.projects ?? {}) };
  for (const [id, p] of Object.entries(local.projects ?? {})) projects[id] = newest(p, projects[id] ?? null)!;

  const guided: NonNullable<SyncedState['guided']> = { ...(remote.guided ?? {}) };
  for (const [id, g] of Object.entries(local.guided ?? {})) {
    const r = guided[id];
    guided[id] = r
      ? {
          steps: [...new Set([...g.steps, ...r.steps])].sort((a, b) => a - b),
          playgroundId: g.playgroundId ?? r.playgroundId,
          startedAt: Math.min(g.startedAt, r.startedAt),
          completedAt: minTs(g.completedAt, r.completedAt),
        }
      : g;
  }

  return {
    prefs: local.onboarded ? local.prefs : { ...local.prefs, ...remote.prefs },
    xp: Math.max(local.xp ?? 0, remote.xp ?? 0, activityXp),
    activity,
    lastVisited: newest(local.lastVisited, remote.lastVisited),
    onboarded: !!(local.onboarded || remote.onboarded),
    achievements: unionTimestamps(local.achievements, remote.achievements),
    completedLessons: unionTimestamps(local.completedLessons, remote.completedLessons),
    exercises,
    drafts: { ...(remote.drafts ?? {}), ...(local.drafts ?? {}) },
    bookmarks: [...new Set([...(local.bookmarks ?? []), ...(remote.bookmarks ?? [])])],
    notes: { ...(remote.notes ?? {}), ...Object.fromEntries(Object.entries(local.notes ?? {}).filter(([, v]) => v.trim())) },
    placement: newest(local.placement, remote.placement),
    challenges,
    projects,
    roadmapChecks: unionTimestamps(local.roadmapChecks, remote.roadmapChecks),
    guided,
  };
}
