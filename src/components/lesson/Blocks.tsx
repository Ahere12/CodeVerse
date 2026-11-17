import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Globe, Info, Lightbulb, Play, RotateCcw, XCircle } from 'lucide-react';
import type { Block } from '../../content/types';
import { Markdown, inline } from '../../lib/markdown';
import { CodeBlock } from '../code/CodeBlock';
import { CodeEditor } from '../code/CodeEditor';
import { PreviewFrame } from '../../runtime/PreviewFrame';
import { runJs, type RunResult } from '../../runtime/jsRunner';
import { useCodeTheme } from '../../lib/hooks';
import { Exercise } from './Exercise';
import { Console } from './Console';

export function BlockView({ block, onQuizCorrect }: { block: Block; onQuizCorrect?: (id: string) => void }) {
  switch (block.type) {
    case 'text':
      return <div className="prose"><Markdown md={block.md} /></div>;
    case 'heading':
      return <h2 className="lesson-h2">{block.text}</h2>;
    case 'callout':
      return <Callout tone={block.tone} title={block.title} md={block.md} />;
    case 'code':
      return <CodeExample block={block} />;
    case 'quiz':
      return <Quiz block={block} onCorrect={() => onQuizCorrect?.(block.id)} />;
    case 'exercise':
      return <Exercise block={block} />;
    case 'playground':
      return <Playground block={block} />;
  }
}

const CALLOUT = {
  tip: { icon: Lightbulb, label: 'Tip', color: 'var(--accent)' },
  warning: { icon: AlertTriangle, label: 'Watch out', color: 'var(--warning)' },
  info: { icon: Info, label: 'Good to know', color: 'var(--info)' },
  'real-world': { icon: Globe, label: 'In the real world', color: 'var(--advanced)' },
};

function Callout({ tone, title, md }: { tone: keyof typeof CALLOUT; title?: string; md: string }) {
  const c = CALLOUT[tone];
  return (
    <aside className="callout" style={{ borderLeftColor: c.color }}>
      <div className="row" style={{ gap: 6, color: c.color, fontWeight: 600, fontSize: 'var(--fs-sm)', marginBottom: 4 }}>
        <c.icon size={15} aria-hidden /> {title ?? c.label}
      </div>
      <div className="prose prose-sm"><Markdown md={md} /></div>
    </aside>
  );
}

function CodeExample({ block }: { block: Extract<Block, { type: 'code' }> }) {
  const [run, setRun] = useState<RunResult | null>(null);
  const codeTheme = useCodeTheme();
  const canRun = block.preview && block.lang === 'javascript';
  const showPreview = block.preview && (block.lang === 'html' || block.lang === 'css');

  return (
    <div className="stack" style={{ gap: 0 }} data-code-theme={codeTheme}>
      <CodeBlock
        code={block.code}
        lang={block.lang}
        caption={block.caption}
        actions={canRun && (
          <button className="btn btn-sm" onClick={async () => setRun(await runJs(block.code))}>
            <Play size={13} /> Run
          </button>
        )}
      />
      {showPreview && (
        <div className="preview-shell">
          <div className="preview-label">Result</div>
          <PreviewFrame html={block.lang === 'html' ? block.code : block.html ?? ''} css={block.lang === 'css' ? block.code : ''} height={180} />
        </div>
      )}
      {run && (
        <div className="preview-shell">
          <div className="preview-label">Console</div>
          <Console run={run} />
        </div>
      )}
    </div>
  );
}

function Quiz({ block, onCorrect }: { block: Extract<Block, { type: 'quiz' }>; onCorrect: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const correct = picked === block.answer;
  const answered = picked !== null;

  const choose = (i: number) => {
    if (correct) return;
    setPicked(i);
    setTries((t) => t + 1);
    if (i === block.answer) onCorrect();
  };

  return (
    <section className="quiz" aria-label="Knowledge check">
      <div className="eyebrow" style={{ marginBottom: 'var(--sp-2)' }}>Quick check</div>
      <div style={{ fontWeight: 600, marginBottom: 'var(--sp-3)' }}>{inline(block.question)}</div>
      {block.code && <div style={{ marginBottom: 'var(--sp-3)' }}><CodeBlock code={block.code.code} lang={block.code.lang} /></div>}
      <div className="stack" style={{ gap: 'var(--sp-2)' }} role="radiogroup" aria-label={block.question}>
        {block.options.map((o, i) => {
          const state = picked === i ? (correct ? 'correct' : 'wrong') : correct && i === block.answer ? 'correct' : undefined;
          return (
            <button key={i} role="radio" aria-checked={picked === i} className="quiz-option" data-state={state} onClick={() => choose(i)} disabled={correct && picked !== i}>
              <span className="quiz-letter">{String.fromCharCode(65 + i)}</span>
              <span style={{ flex: 1 }}>{inline(o)}</span>
              {state === 'correct' && <CheckCircle2 size={17} aria-label="Correct" />}
              {state === 'wrong' && <XCircle size={17} aria-label="Not quite" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="quiz-feedback" data-correct={correct} role="status">
          {correct ? (
            <><strong>{tries === 1 ? 'Correct!' : 'Got it.'}</strong> {inline(block.explain)}</>
          ) : (
            <><strong>Not quite — try another option.</strong> Re-read the example above if you’re unsure.</>
          )}
        </div>
      )}
    </section>
  );
}

function Playground({ block }: { block: Extract<Block, { type: 'playground' }> }) {
  const [code, setCode] = useState(block.starter);
  const [run, setRun] = useState<RunResult | null>(null);
  const codeTheme = useCodeTheme();
  const isJs = block.lang === 'javascript';
  const doRun = async () => setRun(await runJs(code));

  return (
    <section className="exercise" aria-label={block.title ?? 'Try it'} data-code-theme={codeTheme}>
      <div className="exercise-head">
        <span className="badge badge-info">Try it</span>
        <span style={{ fontWeight: 600 }}>{block.title ?? 'Experiment freely'}</span>
        <span className="spacer" />
        <button className="btn btn-ghost btn-sm" onClick={() => { setCode(block.starter); setRun(null); }}><RotateCcw size={13} /> Reset</button>
        {isJs && <button className="btn btn-sm btn-primary" onClick={doRun}><Play size={13} /> Run</button>}
      </div>
      <div className="exercise-split">
        <CodeEditor value={code} onChange={setCode} lang={block.lang} onRun={isJs ? doRun : undefined} minHeight={140} maxHeight={320} />
        {isJs ? (
          <div className="exercise-output">
            <div className="preview-label">Console <span className="subtle">· Ctrl+Enter to run</span></div>
            {run ? <Console run={run} /> : <div className="console console-empty">Press Run to see output.</div>}
          </div>
        ) : (
          <div className="exercise-output">
            <div className="preview-label">Live result</div>
            <PreviewFrame html={block.lang === 'html' ? code : block.html ?? ''} css={block.lang === 'css' ? code : ''} height={220} />
          </div>
        )}
      </div>
    </section>
  );
}
