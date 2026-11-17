/**
 * Where learner progress is kept on this device.
 *
 * Rule: progress is only *saved* for signed-in learners.
 *  - Signed in  → localStorage (a fast local cache of the cloud copy, survives restarts).
 *  - Signed out → sessionStorage (works while the tab is open, gone when it closes).
 *    Whatever a guest does in that tab is merged into their account when they sign in.
 *  - If accounts aren't configured at all (local development), localStorage is used.
 *
 * The Supabase client stores its session under `sb-<project-ref>-auth-token`, which we
 * read synchronously so the right storage is chosen before the app first renders.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const accountsEnabled = !!(SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const projectRef = SUPABASE_URL ? new URL(SUPABASE_URL).hostname.split('.')[0] : '';

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback; // storage blocked (private mode, disabled cookies)
  }
}

export function hasSavedSession(): boolean {
  return safe(() => !!localStorage.getItem(`sb-${projectRef}-auth-token`), false);
}

export const savesProgress = () => !accountsEnabled || hasSavedSession();

const pick = () => (savesProgress() ? localStorage : sessionStorage);

export const progressStorage = {
  getItem: (key: string) =>
    safe(() => {
      const v = pick().getItem(key);
      // A guest who used CodeVerse before sign-in was required keeps their data for this tab.
      if (v === null && !savesProgress()) return localStorage.getItem(key);
      return v;
    }, null),
  setItem: (key: string, value: string) => safe(() => pick().setItem(key, value), undefined),
  removeItem: (key: string) => safe(() => pick().removeItem(key), undefined),
  clearAll: (key: string) =>
    safe(() => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      localStorage.removeItem('codeverse:lastProject');
    }, undefined),
};
