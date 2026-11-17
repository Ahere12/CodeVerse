import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, Lightbulb, Loader2, Play, RotateCcw, Send, Timer, XCircle } from 'lucide-react';
import { CATEGORY_LABEL, CHALLENGE_XP, getChallenge, type Challenge } from '../content/challenges';
import { gradeChallenge, type ChallengeResult } from '../runtime/gradeChallenge';
import { preloadPython } from '../runtime/pyRunner';
import { CodeEditor } from '../components/code/CodeEditor';
import { RunOutput, SqlOutput } from '../components/code/Outputs';
import { LevelBadge } from '../components/lesson/CourseBits';
import { Markdown, inline } from '../lib/markdown';
import { useCodeTheme } from '../lib/hooks';
import { useAppStore } from '../store/useAppStore';
import { useToasts } from '../store/useToasts';
import { NotFound } from './NotFound';

const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

export default function ChallengePage() {
  const { id = '' } = useParams();
  const ch = getChallenge(id);
  return ch ? <ChallengeView key={ch.id} ch={ch} /> : <NotFound />;
}

function ChallengeView({ ch }: { ch: Challenge }) {
  const draftKey = `challenge:${ch.id}`;
  const savedDraft = useAppStore((s) => s.drafts[draftKey]);
  const saveDraft = useAppStore((s) => s.saveDraft);
  const result = useAppStore((s) => s.challenges[ch.id]);
  const record = useAppStore((s) => s.recordChallenge);
  const setLastVisited = useAppStore((s) => s.setLastVisited);
  const push = useToasts((s) => s.push);
  const codeTheme = useCodeTheme();

  const [code, setCode] = useState(savedDraft ?? ch.starter);
  const [grade, setGrade] = useState<ChallengeResult | null>(null);
  const [busy, setBusy] = useState<'run' | 'submit' | null>(null);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [fails, setFails] = useState(0);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const solved = !!result?.solvedAt;

  useEffect(() => {
    setLastVisited({ title: ch.title, path: `/challenges/${ch.id}`, subtitle: 'Challenge' });
    if (ch.lang === 'python') preloadPython();
  }, [ch, setLastVisited]);

  useEffect(() => {
    const t = window.setTimeout(() => saveDraft(draftKey, code), 500);
    return () => window.clearTimeout(t);
  }, [code, draftKey, saveDraft]);

  useEffect(() => {
    if (timerStart === null) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [timerStart]);

  const go = async (submit: boolean) => {
    setBusy(submit ? 'submit' : 'run');
    const r = await gradeChallenge(ch, code, submit);
    setGrade(r);
    setBusy(null);
    if (!submit) return;
    const elapsed = timerStart !== null ? Date.now() - timerStart : undefined;
    const first = record(ch.id, r.passed, CHALLENGE_XP[ch.difficulty], r.passed ? elapsed : undefined);
    if (r.passed) {
      setTimerStart(null);
      push({ title: first ? `Solved! +${CHALLENGE_XP[ch.difficulty]} XP` : 'Solved again', body: elapsed !== undefined ? `Time: ${fmt(elapsed)}` : ch.title, tone: 'good' });
    } else setFails((f) => f + 1);
  };

  const elapsed = timerStart !== null ? now - timerStart : 0;
  const overTime = timerStart !== null && elapsed > ch.minutes * 60_000;
  const canReveal = solved || fails >= 3;

  return (
    <div className="challenge-layout" data-code-theme={codeTheme}>
      <section className="challenge-brief" aria-labelledby="ch-title">
        <Link to="/challenges" className="btn btn-ghost btn-sm" style={{ marginLeft: -12, marginBottom: 'var(--sp-3)' }}><ArrowLeft size={14} /> Challenges</Link>
        <h1 id="ch-title" style={{ fontSize: 'var(--fs-xl)' }}>{ch.title}</h1>
        <div className="row" style={{ flexWrap: 'wrap', margin: 'var(--sp-2) 0 var(--sp-4)' }}>
          <LevelBadge level={ch.difficulty} />
          <span className="badge">{CATEGORY_LABEL[ch.category]}</span>
          <span className="badge">+{CHALLENGE_XP[ch.difficulty]} XP</span>
          {solved && <span className="badge badge-good"><CheckCircle2 size={12} /> Solved</span>}
          {result && <span className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>{result.attempts} attempt{result.attempts === 1 ? '' : 's'}{result.bestMs !== undefined ? ` · best ${fmt(result.bestMs)}` : ''}</span>}
        </div>
        <div className="prose prose-sm"><Markdown md={ch.description} /></div>

        <h2 className="eyebrow" style={{ margin: 'var(--sp-5) 0 var(--sp-2)', fontSize: 'var(--fs-xs)' }}>Examples</h2>
        <div className="stack" style={{ gap: 'var(--sp-2)' }}>
          {ch.examples.map((e, i) => (
            <div key={i} className="example">
              <div><span className="subtle">Input</span> <code>{e.input}</code></div>
              <div><span className="subtle">Output</span> <code style={{ whiteSpace: 'pre-wrap' }}>{e.output}</code></div>
              {e.note && <div className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>{e.note}</div>}
            </div>
          ))}
        </div>

        <div className="stack" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-5)' }}>
          {ch.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="callout" style={{ fontSize: 'var(--fs-sm)' }}><strong>Hint {i + 1}.</strong> {inline(h)}</div>
          ))}
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {hints < ch.hints.length && <button className="btn btn-ghost btn-sm" onClick={() => setHints((h) => h + 1)}><Lightbulb size={14} /> {hints ? 'Another hint' : 'Get a hint'}</button>}
            {canReveal && !showSolution && <button className="btn btn-ghost btn-sm" onClick={() => setShowSolution(true)}><Eye size={14} /> {solved ? 'Explanation & model answer' : 'Show the answer'}</button>}
          </div>
          {!canReveal && <p className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>The answer unlocks after you solve it, or after 3 submitted attempts.</p>}
        </div>

        {showSolution && (
          <div className="panel" style={{ marginTop: 'var(--sp-4)' }}>
            <h2 style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-2)' }}>How it works</h2>
            <div className="prose prose-sm"><Markdown md={ch.explanation} /></div>
            <pre className="solution"><code>{ch.solution}</code></pre>
            {!solved && <button className="btn btn-sm" onClick={() => setCode(ch.solution)}>Load into editor</button>}
          </div>
        )}
      </section>

      <section className="challenge-work" aria-label="Your solution">
        <div className="pg-toolbar">
          <button className={`btn btn-sm ${timerStart !== null ? '' : 'btn-ghost'}`} onClick={() => { setTimerStart(timerStart === null ? Date.now() : null); setNow(Date.now()); }} aria-pressed={timerStart !== null} title={`Timed mode — target ${ch.minutes} min`}>
            <Timer size={14} /> {timerStart !== null ? <span className="mono" style={{ color: overTime ? 'var(--warning)' : undefined }}>{fmt(elapsed)} / {ch.minutes}:00</span> : 'Timed mode'}
          </button>
          <span className="spacer" />
          <button className="btn btn-ghost btn-sm" onClick={() => { if (window.confirm('Reset to the starting code?')) { setCode(ch.starter); setGrade(null); } }}><RotateCcw size={14} /> Reset</button>
          {ch.lang !== 'sql' && (
            <button className="btn btn-sm" onClick={() => go(false)} disabled={!!busy} title="Run the visible tests (Ctrl+Enter)">
              {busy === 'run' ? <Loader2 size={14} className="spin" /> : <Play size={14} />} Run tests
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => go(true)} disabled={!!busy} title="Run all tests, including hidden ones">
            {busy === 'submit' ? <Loader2 size={14} className="spin" /> : <Send size={14} />} Submit
          </button>
        </div>
        <div className="challenge-editor">
          <CodeEditor value={code} onChange={setCode} lang={ch.lang} onRun={() => go(ch.lang === 'sql')} height="100%" ariaLabel={`${ch.title} solution`} />
        </div>
        <div className="challenge-results" aria-live="polite">
          {!grade ? (
            <div className="subtle" style={{ padding: 'var(--sp-4)', fontSize: 'var(--fs-sm)' }}>
              {ch.lang === 'sql' ? 'Submit to compare your query’s result with the expected rows.' : 'Run tests to check the examples. Submit runs hidden tests too.'}
            </div>
          ) : (
            <>
              <div className="row" style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: grade.passed ? 'var(--good)' : 'var(--text)' }}>
                {grade.passed ? <CheckCircle2 size={17} /> : <XCircle size={17} color="var(--critical)" />}
                {grade.passed ? 'All tests passed' : `${grade.cases.filter((c) => c.ok).length} of ${grade.cases.length} tests passed`}
                <span className="subtle" style={{ fontWeight: 400, fontSize: 'var(--fs-xs)', marginLeft: 'auto' }}>{grade.ms} ms</span>
              </div>
              <ul className="test-cases">
                {grade.cases.map((c, i) => (
                  <li key={i} data-ok={c.ok}>
                    {c.ok ? <CheckCircle2 size={15} aria-label="passed" /> : <XCircle size={15} aria-label="failed" />}
                    <div style={{ minWidth: 0 }}>
                      <code>{c.hidden ? 'Hidden test' : c.label}</code>
                      {!c.ok && !c.hidden && (
                        <div className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>
                          expected <code>{c.expected}</code>{c.error ? <> · error: {c.error}</> : <> · got <code>{c.actual}</code></>}
                        </div>
                      )}
                      {!c.ok && c.hidden && <div className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>Think about edge cases: empty input, negatives, a single item.</div>}
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: '1px solid var(--border)', maxHeight: 240, overflow: 'auto' }}>
                {grade.sql ? <div style={{ height: 220 }}><SqlOutput result={grade.sql} /></div> : grade.run && (grade.run.logs.length > 0 || grade.run.error) ? <RunOutput run={grade.run} lang={ch.lang === 'python' ? 'python' : 'javascript'} /> : null}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
