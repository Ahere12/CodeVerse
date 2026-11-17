import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client, created only when the site owner has configured it.
 *
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are designed to be public: the anon key
 * only grants what the database's Row Level Security policies allow (each user can
 * read and write their own row — see supabase/migrations). No secret keys live here.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
      })
    : null;

export const cloudConfigured = !!supabase;

export type OAuthProvider = 'github' | 'discord' | 'google';

export const PROGRESS_TABLE = 'user_progress';

/** Which sign-in buttons to show, e.g. VITE_AUTH_PROVIDERS=github,discord. Defaults to all three. */
const ALL_PROVIDERS: OAuthProvider[] = ['github', 'discord', 'google'];
const configured = (import.meta.env.VITE_AUTH_PROVIDERS as string | undefined)?.split(',').map((s) => s.trim().toLowerCase());
export const enabledProviders: OAuthProvider[] = configured ? ALL_PROVIDERS.filter((p) => configured.includes(p)) : ALL_PROVIDERS;
