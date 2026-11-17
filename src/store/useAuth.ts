import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, PROGRESS_TABLE, type OAuthProvider } from '../lib/supabase';
import { useAppStore, pickSynced, type SyncedSlice } from './useAppStore';
import { mergeProgress, type SyncedState } from '../lib/mergeProgress';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface AuthState {
  ready: boolean;
  session: Session | null;
  user: User | null;
  sync: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;
  init: () => () => void;
  signIn: (provider: OAuthProvider) => Promise<void>;
  /** skipSync: don't upload first (used right after deleting cloud data). */
  signOut: (opts?: { skipSync?: boolean }) => Promise<void>;
  /** Pull → merge → apply locally → push. */
  syncNow: () => Promise<void>;
  /** Overwrite the cloud copy with this device's data (used after a reset). */
  pushLocal: () => Promise<void>;
  deleteCloudData: () => Promise<boolean>;
}

/** Display info from whichever provider the learner used. */
export function profileOf(user: User | null) {
  if (!user) return null;
  const m = user.user_metadata ?? {};
  return {
    name: (m.full_name || m.name || m.user_name || m.preferred_username || user.email || 'Learner') as string,
    avatar: (m.avatar_url || m.picture || '') as string,
    provider: (user.app_metadata?.provider ?? 'email') as string,
    email: user.email ?? '',
  };
}

let applying = false;
/** True while sync is writing merged data into the local store (so it isn't re-synced). */
export const isApplyingSync = () => applying;

export const useAuth = create<AuthState>()((set, get) => ({
  ready: !supabase,
  session: null,
  user: null,
  sync: 'idle',
  lastSyncedAt: null,
  error: null,

  init: () => {
    if (!supabase) return () => {};
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, ready: true });
      if (data.session) get().syncNow();
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const wasSignedIn = !!get().user;
      set({ session, user: session?.user ?? null, ready: true });
      if (event === 'SIGNED_IN' && !wasSignedIn) get().syncNow();
      if (event === 'SIGNED_OUT') {
        set({ sync: 'idle', lastSyncedAt: null });
        useAppStore.getState().clearDevice();
      }
    });
    return () => data.subscription.unsubscribe();
  },

  signIn: async (provider) => {
    if (!supabase) return;
    set({ error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (error) set({ error: error.message });
  },

  signOut: async (opts) => {
    if (!supabase) return;
    if (!opts?.skipSync) await get().syncNow();
    await supabase.auth.signOut();
    set({ session: null, user: null, sync: 'idle' });
    // Progress is only kept for signed-in learners: remove it from this device.
    useAppStore.getState().clearDevice();
  },

  syncNow: async () => {
    const user = get().user;
    if (!supabase || !user) return;
    if (!navigator.onLine) return set({ sync: 'offline' });
    set({ sync: 'syncing', error: null });
    try {
      const { data, error } = await supabase.from(PROGRESS_TABLE).select('data').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      const local = pickSynced(useAppStore.getState()) as unknown as SyncedState;
      const merged = mergeProgress(local, (data?.data as SyncedState | undefined) ?? null);
      if (JSON.stringify(merged) !== JSON.stringify(local)) {
        applying = true;
        useAppStore.getState().applySynced(merged as unknown as Partial<SyncedSlice>);
        applying = false;
      }
      if (JSON.stringify(merged) !== JSON.stringify(data?.data ?? null)) {
        const { error: upErr } = await supabase
          .from(PROGRESS_TABLE)
          .upsert({ user_id: user.id, data: merged, updated_at: new Date().toISOString() });
        if (upErr) throw upErr;
      }
      // Make sure the merged progress is written to this device's saved storage now that we're signed in.
      applying = true;
      useAppStore.setState({});
      applying = false;
      set({ sync: 'synced', lastSyncedAt: Date.now() });
    } catch (e) {
      applying = false;
      set({ sync: 'error', error: e instanceof Error ? e.message : 'Sync failed' });
    }
  },

  pushLocal: async () => {
    const user = get().user;
    if (!supabase || !user) return;
    const { error } = await supabase
      .from(PROGRESS_TABLE)
      .upsert({ user_id: user.id, data: pickSynced(useAppStore.getState()), updated_at: new Date().toISOString() });
    set(error ? { sync: 'error', error: error.message } : { sync: 'synced', lastSyncedAt: Date.now() });
  },

  deleteCloudData: async () => {
    const user = get().user;
    if (!supabase || !user) return false;
    const { error } = await supabase.from(PROGRESS_TABLE).delete().eq('user_id', user.id);
    if (error) {
      set({ error: error.message });
      return false;
    }
    set({ lastSyncedAt: null, sync: 'idle' });
    return true;
  },
}));
