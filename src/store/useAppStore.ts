import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { dayKey, emptyDay, type ActivityLog } from '../lib/progress';
import { progressStorage } from '../lib/progressStorage';

export type ThemePref = 'dark' | 'light' | 'system';
export type DesignStyle = 'book' | 'terminal' | 'friendly';
export type FontScale = 'sm' | 'md' | 'lg' | 'xl';
export type ExperienceLevel = 'new' | 'some' | 'experienced';

export interface Preferences {
  displayName: string;
  theme: ThemePref;
  designStyle: DesignStyle;
  editorTheme: 'match' | 'dark' | 'light';
  editorFontSize: number;
  fontScale: FontScale;
  reducedMotion: boolean;
  dailyGoalMinutes: number;
  weeklyGoalDays: number;
  preferredLanguages: string[];
  experience: ExperienceLevel;
  showTermHints: boolean;
  showLeaderboards: boolean;
  notifyAchievements: boolean;
  sidebarCollapsed: boolean;
}

export interface PlacementResult {
  score: number;
  total: number;
  courseId: string;
  takenAt: number;
}

export type ProjectKind = 'web' | 'python' | 'sql' | 'javascript';

export interface ProjectFile {
  name: string;
  content: string;
}

export interface Project {
  id: string;
  name: string;
  kind: ProjectKind;
  files: ProjectFile[];
  createdAt: number;
  updatedAt: number;
}

export interface GuidedProgress {
  steps: number[];
  playgroundId?: string;
  startedAt: number;
  completedAt?: number;
}

export interface ChallengeResult {
  solvedAt?: number;
  attempts: number;
  /** Fastest solve time for timed attempts, in ms. */
  bestMs?: number;
}

export interface LastVisited {
  title: string;
  path: string;
  subtitle?: string;
  at: number;
}

interface AppState {
  prefs: Preferences;
  xp: number;
  activity: ActivityLog;
  lastVisited: LastVisited | null;
  onboarded: boolean;
  /** achievement id → unlock timestamp */
  achievements: Record<string, number>;
  /** lesson id → completion timestamp */
  completedLessons: Record<string, number>;
  /** exercise id → passed timestamp (or revealed solution) */
  exercises: Record<string, { passedAt?: number; revealed?: boolean; attempts: number }>;
  /** exercise id → learner's latest code */
  drafts: Record<string, string>;
  bookmarks: string[];
  /** lesson id → learner notes */
  notes: Record<string, string>;
  placement: PlacementResult | null;
  challenges: Record<string, ChallengeResult>;
  projects: Record<string, Project>;
  /** `${roadmapId}/${milestoneId}` → when the learner ticked it off. */
  roadmapChecks: Record<string, number>;
  /** Guided project id → completed step indexes and the playground copy. */
  guided: Record<string, GuidedProgress>;

  updatePrefs: (patch: Partial<Preferences>) => void;
  togglePreferredLanguage: (id: string) => void;
  /** Adds active learning minutes to today. */
  logMinutes: (minutes: number) => void;
  awardXp: (amount: number, kind?: 'lesson' | 'challenge' | 'other') => void;
  setLastVisited: (v: Omit<LastVisited, 'at'>) => void;
  completeOnboarding: (p: Pick<Preferences, 'displayName' | 'experience' | 'preferredLanguages' | 'dailyGoalMinutes' | 'designStyle' | 'theme'>) => void;
  unlockAchievements: (ids: string[]) => void;
  completeLesson: (lessonId: string, xp: number) => boolean;
  recordExercise: (exerciseId: string, result: 'pass' | 'fail' | 'reveal') => void;
  saveDraft: (exerciseId: string, code: string) => void;
  toggleBookmark: (lessonId: string) => void;
  setNote: (lessonId: string, text: string) => void;
  setPlacement: (p: Omit<PlacementResult, 'takenAt'>) => void;
  /** Records an attempt; returns true the first time a challenge is solved. */
  recordChallenge: (id: string, solved: boolean, xp: number, ms?: number) => boolean;
  saveProject: (p: Project) => void;
  toggleRoadmapCheck: (key: string) => void;
  setGuided: (id: string, patch: Partial<GuidedProgress>) => void;
  deleteProject: (id: string) => void;
  /** Replaces all synced data (used by cloud sync after merging). */
  applySynced: (data: Partial<AppState>) => void;
  resetProgress: () => void;
  /** Wipes everything saved on this device (used on sign-out). Keeps the look the learner chose. */
  clearDevice: () => void;
  importState: (json: string) => { ok: true } | { ok: false; error: string };
}

export const DEFAULT_PREFS: Preferences = {
  displayName: '',
  theme: 'dark',
  designStyle: 'book',
  editorTheme: 'match',
  editorFontSize: 14,
  fontScale: 'md',
  reducedMotion: false,
  dailyGoalMinutes: 15,
  weeklyGoalDays: 4,
  preferredLanguages: [],
  experience: 'new',
  showTermHints: true,
  showLeaderboards: false,
  notifyAchievements: true,
  sidebarCollapsed: false,
};

const touchToday = (activity: ActivityLog) => {
  const key = dayKey();
  return { key, day: { ...(activity[key] ?? emptyDay()) } };
};

export const STORAGE_KEY = 'codeverse:state';

/** Everything that is saved locally, exported, and synced to the cloud. */
export const SYNC_KEYS = [
  'prefs', 'xp', 'activity', 'lastVisited', 'onboarded', 'achievements', 'completedLessons',
  'exercises', 'drafts', 'bookmarks', 'notes', 'placement', 'challenges', 'projects', 'roadmapChecks', 'guided',
] as const;

export type SyncedSlice = Pick<AppState, (typeof SYNC_KEYS)[number]>;

export function pickSynced(s: AppState): SyncedSlice {
  return Object.fromEntries(SYNC_KEYS.map((k) => [k, s[k]])) as SyncedSlice;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      prefs: DEFAULT_PREFS,
      xp: 0,
      activity: {},
      lastVisited: null,
      onboarded: false,
      achievements: {},
      completedLessons: {},
      exercises: {},
      drafts: {},
      bookmarks: [],
      notes: {},
      placement: null,
      challenges: {},
      projects: {},
      roadmapChecks: {},
      guided: {},

      updatePrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),

      togglePreferredLanguage: (id) =>
        set((s) => {
          const list = s.prefs.preferredLanguages;
          const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
          return { prefs: { ...s.prefs, preferredLanguages: next } };
        }),

      logMinutes: (minutes) =>
        set((s) => {
          const { key, day } = touchToday(s.activity);
          day.minutes = Math.round((day.minutes + minutes) * 100) / 100;
          return { activity: { ...s.activity, [key]: day } };
        }),

      awardXp: (amount, kind = 'other') =>
        set((s) => {
          const { key, day } = touchToday(s.activity);
          day.xp += amount;
          if (kind === 'lesson') day.lessons += 1;
          if (kind === 'challenge') day.challenges += 1;
          return { xp: s.xp + amount, activity: { ...s.activity, [key]: day } };
        }),

      setLastVisited: (v) => set({ lastVisited: { ...v, at: Date.now() } }),

      completeOnboarding: (p) =>
        set((s) => ({ onboarded: true, prefs: { ...s.prefs, ...p } })),

      unlockAchievements: (ids) =>
        set((s) => {
          const now = Date.now();
          const next = { ...s.achievements };
          ids.forEach((id) => (next[id] ??= now));
          return { achievements: next };
        }),

      /** Returns false if the lesson was already complete (no XP awarded twice). */
      completeLesson: (lessonId, xp) => {
        if (get().completedLessons[lessonId]) return false;
        set((s) => ({ completedLessons: { ...s.completedLessons, [lessonId]: Date.now() } }));
        get().awardXp(xp, 'lesson');
        return true;
      },

      recordExercise: (id, result) =>
        set((s) => {
          const prev = s.exercises[id] ?? { attempts: 0 };
          const next = { ...prev, attempts: prev.attempts + (result === 'reveal' ? 0 : 1) };
          if (result === 'pass') next.passedAt ??= Date.now();
          if (result === 'reveal') next.revealed = true;
          return { exercises: { ...s.exercises, [id]: next } };
        }),

      saveDraft: (id, code) => set((s) => ({ drafts: { ...s.drafts, [id]: code.slice(0, 50_000) } })),

      toggleBookmark: (lessonId) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(lessonId) ? s.bookmarks.filter((b) => b !== lessonId) : [...s.bookmarks, lessonId],
        })),

      setNote: (lessonId, text) =>
        set((s) => {
          const notes = { ...s.notes };
          if (text.trim()) notes[lessonId] = text.slice(0, 20_000);
          else delete notes[lessonId];
          return { notes };
        }),

      setPlacement: (p) => set({ placement: { ...p, takenAt: Date.now() } }),

      recordChallenge: (id, solved, xp, ms) => {
        const prev = get().challenges[id] ?? { attempts: 0 };
        const first = solved && !prev.solvedAt;
        const next: ChallengeResult = { ...prev, attempts: prev.attempts + 1 };
        if (solved) {
          next.solvedAt ??= Date.now();
          if (ms !== undefined) next.bestMs = prev.bestMs === undefined ? ms : Math.min(prev.bestMs, ms);
        }
        set((s) => ({ challenges: { ...s.challenges, [id]: next } }));
        if (first) get().awardXp(xp, 'challenge');
        return first;
      },

      saveProject: (p) => set((s) => ({ projects: { ...s.projects, [p.id]: { ...p, updatedAt: Date.now() } } })),

      toggleRoadmapCheck: (key) =>
        set((s) => {
          const next = { ...s.roadmapChecks };
          if (next[key]) delete next[key];
          else next[key] = Date.now();
          return { roadmapChecks: next };
        }),

      setGuided: (id, patch) =>
        set((s) => {
          const prev = s.guided[id] ?? { steps: [], startedAt: Date.now() };
          return { guided: { ...s.guided, [id]: { ...prev, ...patch } } };
        }),

      deleteProject: (id) =>
        set((s) => {
          const projects = { ...s.projects };
          delete projects[id];
          return { projects };
        }),

      applySynced: (data) => set((s) => ({ ...data, prefs: { ...DEFAULT_PREFS, ...s.prefs, ...(data.prefs ?? {}) } })),

      clearDevice: () => {
        const { designStyle, theme, fontScale, reducedMotion } = get().prefs;
        set({
          prefs: { ...DEFAULT_PREFS, designStyle, theme, fontScale, reducedMotion },
          xp: 0, activity: {}, lastVisited: null, onboarded: false, achievements: {}, completedLessons: {},
          exercises: {}, drafts: {}, bookmarks: [], notes: {}, placement: null, challenges: {}, projects: {}, roadmapChecks: {}, guided: {},
        });
        progressStorage.clearAll(STORAGE_KEY);
      },

      resetProgress: () =>
        set({ xp: 0, activity: {}, lastVisited: null, achievements: {}, completedLessons: {}, exercises: {}, placement: null, challenges: {} }),

      importState: (json) => {
        try {
          const parsed = JSON.parse(json);
          const data = parsed?.state ?? parsed;
          if (typeof data !== 'object' || data === null || typeof data.xp !== 'number' || typeof data.activity !== 'object') {
            return { ok: false, error: 'This file does not look like a CodeVerse export.' };
          }
          set({
            xp: Math.max(0, data.xp),
            activity: data.activity ?? {},
            prefs: { ...DEFAULT_PREFS, ...get().prefs, ...(data.prefs ?? {}) },
            lastVisited: data.lastVisited ?? null,
            onboarded: data.onboarded ?? true,
            achievements: data.achievements ?? {},
            completedLessons: data.completedLessons ?? {},
            exercises: data.exercises ?? {},
            drafts: data.drafts ?? {},
            bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : [],
            notes: data.notes ?? {},
            placement: data.placement ?? null,
            challenges: data.challenges ?? {},
            projects: data.projects ?? {},
            roadmapChecks: data.roadmapChecks ?? {},
            guided: data.guided ?? {},
          });
          return { ok: true };
        } catch {
          return { ok: false, error: 'Could not read that file — is it valid JSON?' };
        }
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => progressStorage),
      partialize: (s) => pickSynced(s),
      // Fill in any preference keys added after a learner's data was saved.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return { ...current, ...p, prefs: { ...DEFAULT_PREFS, ...(p.prefs ?? {}) } };
      },
    },
  ),
);

export function exportState(): string {
  return JSON.stringify({ app: 'codeverse', version: 1, exportedAt: new Date().toISOString(), state: pickSynced(useAppStore.getState()) }, null, 2);
}
