import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useToasts } from '../store/useToasts';
import { ACHIEVEMENTS } from '../data/achievements';
import { isApplyingSync, useAuth } from '../store/useAuth';

/** Resolves the theme preference to what is actually shown (system → OS setting). */
export function useResolvedTheme(): 'dark' | 'light' {
  const pref = useAppStore((s) => s.prefs.theme);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return pref === 'system' ? (systemDark ? 'dark' : 'light') : pref;
}

/** Mirrors preferences onto <html> so CSS tokens can react to them. */
export function useApplyPreferences() {
  const theme = useResolvedTheme();
  const { fontScale, reducedMotion, designStyle } = useAppStore((s) => s.prefs);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.style = designStyle;
    root.dataset.fontScale = fontScale;
    root.dataset.reducedMotion = String(reducedMotion);
  }, [theme, fontScale, reducedMotion, designStyle]);
}

const TICK_MS = 15_000;
const IDLE_AFTER_MS = 90_000;

/**
 * Counts *active* learning time: the tab must be visible and the learner must have
 * interacted (key, pointer, scroll) within the last 90 seconds. Leaving the tab open
 * overnight does not inflate the numbers.
 */
export function useStudyTimer() {
  const logMinutes = useAppStore((s) => s.logMinutes);
  const lastInteraction = useRef(Date.now());

  useEffect(() => {
    const mark = () => (lastInteraction.current = Date.now());
    const events = ['keydown', 'pointerdown', 'pointermove', 'wheel', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const id = window.setInterval(() => {
      const active = document.visibilityState === 'visible' && Date.now() - lastInteraction.current < IDLE_AFTER_MS;
      if (active) logMinutes(TICK_MS / 60_000);
    }, TICK_MS);
    return () => {
      events.forEach((e) => window.removeEventListener(e, mark));
      window.clearInterval(id);
    };
  }, [logMinutes]);
}

/** Unlocks achievements whose conditions are met and announces new ones. */
export function useAchievementWatcher() {
  const xp = useAppStore((s) => s.xp);
  const activity = useAppStore((s) => s.activity);
  const onboarded = useAppStore((s) => s.onboarded);
  const preferredLanguages = useAppStore((s) => s.prefs.preferredLanguages);
  const notify = useAppStore((s) => s.prefs.notifyAchievements);
  const completedLessons = useAppStore((s) => s.completedLessons);
  const challenges = useAppStore((s) => s.challenges);
  const guided = useAppStore((s) => s.guided);
  const unlocked = useAppStore((s) => s.achievements);
  const unlock = useAppStore((s) => s.unlockAchievements);
  const push = useToasts((s) => s.push);

  useEffect(() => {
    const ctx = { xp, activity, onboarded, preferredLanguages, completedLessons, challenges, guided };
    const fresh = ACHIEVEMENTS.filter((a) => !unlocked[a.id] && a.check(ctx));
    if (!fresh.length) return;
    unlock(fresh.map((a) => a.id));
    if (notify) fresh.forEach((a) => push({ title: `Achievement unlocked: ${a.title}`, body: a.description, tone: 'good' }));
  }, [xp, activity, onboarded, preferredLanguages, completedLessons, challenges, guided, notify, unlocked, unlock, push]);
}

/** Editor colour scheme override: undefined means "match the app theme". */
export function useCodeTheme(): 'dark' | 'light' | undefined {
  const t = useAppStore((s) => s.prefs.editorTheme);
  return t === 'match' ? undefined : t;
}

const SYNC_EVERY_MS = 30_000;

/**
 * Keeps the cloud copy up to date while signed in: syncs at most every 30 s after a
 * change, and immediately when the tab is hidden (closing, switching apps).
 */
export function useCloudSync() {
  useEffect(() => {
    let timer: number | undefined;
    const run = () => {
      timer = undefined;
      void useAuth.getState().syncNow();
    };
    const unsub = useAppStore.subscribe(() => {
      if (isApplyingSync() || !useAuth.getState().user || timer) return;
      timer = window.setTimeout(run, SYNC_EVERY_MS);
    });
    const onHide = () => {
      if (document.visibilityState === 'hidden' && timer) {
        window.clearTimeout(timer);
        run();
      }
    };
    const onOnline = () => useAuth.getState().user && run();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('online', onOnline);
    const stopAuth = useAuth.getState().init();
    return () => {
      unsub();
      stopAuth();
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('online', onOnline);
    };
  }, []);
}
