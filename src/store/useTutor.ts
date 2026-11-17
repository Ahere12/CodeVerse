import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type TutorMode = 'beginner' | 'explain' | 'bug' | 'hint' | 'example' | 'quiz' | 'review';

export const TUTOR_MODES: { id: TutorMode; label: string; blurb: string }[] = [
  { id: 'beginner', label: 'Explain like I’m a beginner', blurb: 'No jargon, everyday analogies' },
  { id: 'explain', label: 'Explain this code', blurb: 'Line by line, in plain language' },
  { id: 'bug', label: 'Find my bug', blurb: 'Points to the problem without rewriting everything' },
  { id: 'hint', label: 'Give me a hint', blurb: 'One step forward, no spoilers' },
  { id: 'example', label: 'Show me an example', blurb: 'A different example of the same idea' },
  { id: 'quiz', label: 'Quiz me', blurb: 'One question at a time' },
  { id: 'review', label: 'Review my code', blurb: 'What’s good and what to improve' },
];

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** What the learner is looking at, sent along so the tutor can be specific. */
export interface TutorContext {
  title: string;
  /** Plain-text description: task, code, error output. */
  details: string;
}

type Status = 'idle' | 'streaming' | 'error';

interface TutorState {
  open: boolean;
  mode: TutorMode;
  context: TutorContext | null;
  messages: TutorMessage[];
  status: Status;
  error: string | null;
  remaining: number | null;
  openWith: (opts?: { mode?: TutorMode; context?: TutorContext | null; ask?: string }) => void;
  close: () => void;
  setMode: (m: TutorMode) => void;
  clearContext: () => void;
  reset: () => void;
  send: (text: string) => Promise<void>;
}

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL ?? ''}/functions/v1/ai-tutor`;
let abort: AbortController | null = null;

export const useTutor = create<TutorState>()((set, get) => ({
  open: false,
  mode: 'explain',
  context: null,
  messages: [],
  status: 'idle',
  error: null,
  remaining: null,

  openWith: (opts = {}) => {
    const ctxChanged = opts.context !== undefined && opts.context?.title !== get().context?.title;
    set({
      open: true,
      ...(opts.mode ? { mode: opts.mode } : {}),
      ...(opts.context !== undefined ? { context: opts.context } : {}),
      // A new topic starts a fresh conversation.
      ...(ctxChanged ? { messages: [], error: null } : {}),
    });
    if (opts.ask) void get().send(opts.ask);
  },
  close: () => set({ open: false }),
  setMode: (mode) => set({ mode }),
  clearContext: () => set({ context: null }),
  reset: () => {
    abort?.abort();
    set({ messages: [], status: 'idle', error: null });
  },

  send: async (text) => {
    const content = text.trim();
    if (!content || get().status === 'streaming') return;
    if (!supabase) return set({ error: 'Accounts aren’t set up on this site, so the tutor is unavailable.', status: 'error' });
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return set({ error: 'sign_in', status: 'error' });

    const history: TutorMessage[] = [...get().messages, { role: 'user', content }];
    set({ messages: [...history, { role: 'assistant', content: '' }], status: 'streaming', error: null });
    abort = new AbortController();
    const ctx = get().context;

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        signal: abort.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        },
        body: JSON.stringify({ mode: get().mode, messages: history, context: ctx ? `${ctx.title}\n\n${ctx.details}` : '' }),
      });
      if (!res.ok || !res.body) {
        let msg = `The tutor isn’t available right now (error ${res.status}).`;
        if (res.status === 404) msg = 'not_deployed';
        try {
          const j = await res.json();
          if (j?.error === 'not_configured') msg = 'not_deployed';
          else if (j?.message) msg = j.message;
        } catch { /* not JSON */ }
        // Drop the empty assistant bubble.
        set({ messages: history, status: 'error', error: msg });
        return;
      }
      const left = res.headers.get('X-Tutor-Remaining');
      if (left !== null) set({ remaining: Number(left) });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let answer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += dec.decode(value, { stream: true });
        set({ messages: [...history, { role: 'assistant', content: answer }] });
      }
      set({ status: 'idle' });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return set({ status: 'idle' });
      set({ messages: history, status: 'error', error: 'Couldn’t reach the tutor. Check your connection and try again.' });
    }
  },
}));
