import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Eye, Lightbulb, Loader2, Play, RotateCcw, XCircle } from 'lucide-react';
import type { Block } from '../../content/types';
import { inline, Markdown } from '../../lib/markdown';
import { CodeEditor } from '../code/CodeEditor';
import { PreviewFrame } from '../../runtime/PreviewFrame';
import { grade, type GradeResult } from '../../runtime/checks';
import { useAppStore } from '../../store/useAppStore';
import { Console } from './Console';
import { useCodeTheme } from '../../lib/hooks';

type ExerciseBlock = Extract<Block, { type: 'exercise' }>;

/** Number of failed checks before "Show solution" is offered. */
const REVEAL_AFTER = 2;

export function Exercise({ block }: { block: ExerciseBlock }) {
  const draft = useAppStore((s) => s.drafts[block.id]);
  const status = useAppStore((s) => s.exercises[block.id]);
  const saveDraft = useAppStore((s) => s.saveDraft);
  const record = useAppStore((s) => s.recordExercise);
  const codeTheme = useCodeTheme();

  const [code, setCode] = useState(draft ?? block.starter);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [fails, setFails] = useState(0);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveDraft(block.id, code), 400);
    return () => window.clearTimeout(saveTimer.current);
  }, [code, block.id, saveDraft]);

  const check = async () => {
    setBusy(true);
    const r = await grade(block.lang, code, block.checks);
    setResult(r);
    setBusy(false);
    record(block.id, r.passed ? 'pass' : 'fail');
    if (!r.passed) setFails((f) => f + 1);
  };

  const reveal = () => {
    setCode(block.solution);
    record(block.id, 'reveal');
    setResult(null);
  };

  const done = !!status?.passedAt;
  const isJs = block.lang === 'javascript';

  return (
    <section className="exercise" aria-label={`Exercise: ${block.title}`} data-code-theme={codeTheme} data-done={done}>
      <div className="exercise-head">
        <span className={done ? 'badge badge-good' : 'badge badge-warning'}>
          {done ? <><CheckCircle2 size={12} aria-hidden /> Completed</> : 'Exercise'}
        </span>
        <span style={{ fontWeight: 600 }}>{block.title}</span>
      </div>
      <div className="exercise-prompt prose prose-sm"><Markdown md={block.prompt} /></div>

      <div className="exercise-split">
        <CodeEditor value={code} onChange={setCode} lang={block.lang} onRun={check} minHeight={160} maxHeight={360} ariaLabel={`${block.title} — code editor`} />
        <div className="exercise-output">
          {isJs ? (
            <>
              <div className="preview-label">Console</div>
              {result?.run ? <Console run={result.run} /> : <div className="console console-empty">Press “Check my code” to run it.</div>}
            </>
          ) : (
            <>
              <div className="preview-label">Live result</div>
              <PreviewFrame html={block.lang === 'html' ? code : block.html ?? ''} css={block.lang === 'css' ? code : ''} height={200} />
            </>
          )}
        </div>
      </div>

      <div className="exercise-actions">
        <button className="btn btn-primary" onClick={check} disabled={busy}>
          {busy ? <Loader2 size={15} className="spin" /> : <Play size={15} />} Check my code
        </button>
        <span className="subtle" style={{ fontSize: 'var(--fs-xs)' }}><kbd>Ctrl</kbd> <kbd>Enter</kbd></span>
        <span className="spacer" />
        {hintsShown < block.hints.length && (
          <button className="btn btn-ghost btn-sm" onClick={() => setHintsShown((h) => h + 1)}>
            <Lightbulb size={14} /> {hintsShown ? 'Another hint' : 'Hint'}
          </button>
        )}
        {(fails >= REVEAL_AFTER || status?.revealed) && code !== block.solution && (
          <button className="btn btn-ghost btn-sm" onClick={reveal}><Eye size={14} /> Show solution</button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={() => { setCode(block.starter); setResult(null); }} title="Restore the starting code">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {hintsShown > 0 && (
        <ol className="hints">
          {block.hints.slice(0, hintsShown).map((h, i) => <li key={i}>{inline(h)}</li>)}
        </ol>
      )}

      {result && (
        <div className="checklist" role="status" aria-live="polite">
          <div style={{ fontWeight: 600, marginBottom: 'var(--sp-2)', color: result.passed ? 'var(--good)' : 'var(--text)' }}>
            {result.passed ? '🎉 All checks passed — nice work!' : `${result.outcomes.filter((o) => o.ok).length} of ${result.outcomes.length} checks passing`}
          </div>
          {result.problem && !result.passed && <p className="warn-line">{result.problem}</p>}
          <ul>
            {result.outcomes.map((o, i) => (
              <li key={i} data-ok={o.ok}>
                {o.ok ? <CheckCircle2 size={15} aria-label="passed" /> : result.problem && !result.passed && isJs ? <Circle size={15} aria-label="not checked" /> : <XCircle size={15} aria-label="failed" />}
                <span>
                  {inline(o.desc)}
                  {!o.ok && o.detail && <span className="subtle" style={{ display: 'block', fontSize: 'var(--fs-xs)' }}>{o.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
          {!result.passed && fails >= REVEAL_AFTER && <p className="subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-2)' }}>Stuck? It’s fine to look at the solution — read it line by line, then try writing it yourself.</p>}
        </div>
      )}
    </section>
  );
}
