import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Loader2, RotateCcw, Send, Square, X } from 'lucide-react';
import { TUTOR_MODES, useTutor, type TutorMode } from '../../store/useTutor';
import { useAuth } from '../../store/useAuth';
import { CodeBlock } from '../code/CodeBlock';
import { Markdown } from '../../lib/markdown';
import type { CodeLang } from '../../content/types';

const FOLLOW_UPS: Record<TutorMode, string[]> = {
  beginner: ['Can you explain that even more simply?', 'Give me a real-life example', 'What should I learn next?'],
  explain: ['Explain the trickiest line again', 'Why is it written this way?', 'Quiz me on this'],
  bug: ['Give me a smaller hint', 'Why does that cause the bug?', 'How can I avoid this next time?'],
  hint: ['Another hint please', 'I’m still stuck — what should I look at?', 'Explain the concept behind this'],
  example: ['Show a slightly harder example', 'Explain that example line by line', 'Let me try one — give me a mini task'],
  quiz: ['Next question', 'Make it harder', 'Explain the answer'],
  review: ['How would I fix the first point?', 'What’s the most important change?', 'Show me good naming examples'],
};

const LANGS: Record<string, CodeLang> = { js: 'javascript', javascript: 'javascript', ts: 'javascript', typescript: 'javascript', jsx: 'javascript', html: 'html', css: 'css', py: 'python', python: 'python', sql: 'sql' };

/** Markdown with fenced code blocks (handles an unfinished fence while streaming). */
function RichText({ text }: { text: string }) {
  const parts = text.split(/```/);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          const md = part.replace(/^#{1,6}\s+(.+)$/gm, '**$1**');
          return md.trim() ? <div key={i} className="prose prose-sm"><Markdown md={md} /></div> : null;
        }
        const nl = part.indexOf('\n');
        const tag = nl >= 0 ? part.slice(0, nl).trim().toLowerCase() : '';
        const code = (nl >= 0 ? part.slice(nl + 1) : part).replace(/\n$/, '');
        return <div key={i} style={{ margin: 'var(--sp-2) 0' }}><CodeBlock code={code} lang={LANGS[tag] ?? 'text'} /></div>;
      })}
    </>
  );
}

export default function TutorPanel() {
  const { open, mode, context, messages, status, error, remaining, close, setMode, clearContext, reset, send } = useTutor();
  const user = useAuth((s) => s.user);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;
  const submit = () => {
    if (!draft.trim()) return;
    void send(draft);
    setDraft('');
  };
  const last = messages[messages.length - 1];
  const showFollowUps = status === 'idle' && last?.role === 'assistant' && last.content;

  return (
    <aside className="tutor" role="dialog" aria-label="AI tutor" aria-modal="false">
      <header className="tutor-head">
        <Bot size={18} color="var(--accent)" aria-hidden />
        <strong>AI tutor</strong>
        {remaining !== null && <span className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>{remaining} left today</span>}
        <span className="spacer" />
        {messages.length > 0 && <button className="icon-btn" onClick={reset} aria-label="New conversation" title="New conversation"><RotateCcw size={15} /></button>}
        <button className="icon-btn" onClick={close} aria-label="Close tutor"><X size={17} /></button>
      </header>

      <div className="tutor-modes" role="radiogroup" aria-label="How should the tutor help?">
        {TUTOR_MODES.map((m) => (
          <button key={m.id} role="radio" aria-checked={mode === m.id} className="tutor-mode" onClick={() => setMode(m.id)} title={m.blurb}>
            {m.label}
          </button>
        ))}
      </div>

      {context && (
        <div className="tutor-context">
          <span className="subtle">Looking at:</span> <strong>{context.title}</strong>
          <button className="icon-btn" style={{ width: 22, height: 22, marginLeft: 'auto' }} onClick={clearContext} aria-label="Stop sharing this with the tutor"><X size={12} /></button>
        </div>
      )}

      <div className="tutor-body" aria-live="polite">
        {!user ? (
          <div className="empty" style={{ margin: 'var(--sp-4)' }}>
            <strong>Sign in to use the AI tutor</strong>
            The tutor is free for signed-in learners, with a daily message limit.
            <Link to="/account" className="btn btn-primary btn-sm" onClick={close}>Sign in</Link>
          </div>
        ) : messages.length === 0 ? (
          <div className="tutor-welcome">
            <p>Hi! I’m here to help you <strong>understand</strong>, not to do your work for you. I’ll explain things, give hints and ask questions.</p>
            <p className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>Pick a mode above, then ask anything — for example:</p>
            {['What is a variable?', 'Why doesn’t my code work?', 'Explain the difference between let and const'].map((q) => (
              <button key={q} className="tutor-chip" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="tutor-msg" data-role={m.role}>
              {m.role === 'user' ? <p>{m.content}</p> : m.content ? <RichText text={m.content} /> : <span className="subtle row"><Loader2 size={14} className="spin" /> Thinking…</span>}
            </div>
          ))
        )}
        {error && (
          <div className="tutor-error" role="alert">
            {error === 'not_deployed' ? (
              <>The AI tutor isn’t switched on for this site yet. (Site owner: see <code className="inline-code">SETUP-AI-TUTOR.md</code>.)</>
            ) : error === 'sign_in' ? (
              <>Your session expired. <Link to="/account" className="link" onClick={close}>Sign in again</Link>.</>
            ) : (
              error
            )}
          </div>
        )}
        {showFollowUps && (
          <div className="row" style={{ flexWrap: 'wrap', gap: 6, padding: '0 var(--sp-4) var(--sp-3)' }}>
            {FOLLOW_UPS[mode].map((q) => <button key={q} className="tutor-chip" onClick={() => send(q)}>{q}</button>)}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {user && (
        <form className="tutor-input" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Ask a question… (Enter to send, Shift+Enter for a new line)"
            rows={2}
            maxLength={4000}
            aria-label="Message the tutor"
          />
          {status === 'streaming' ? (
            <button type="button" className="btn btn-sm" onClick={reset} aria-label="Stop"><Square size={13} /></button>
          ) : (
            <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()} aria-label="Send"><Send size={14} /></button>
          )}
        </form>
      )}
      <p className="tutor-foot subtle">AI can make mistakes — check important answers by running the code.</p>
    </aside>
  );
}
