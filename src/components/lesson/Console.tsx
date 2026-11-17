import type { RunResult } from '../../runtime/jsRunner';
import { explainError } from '../../runtime/jsRunner';
import { inline } from '../../lib/markdown';

export function Console({ run, maxHeight = 220 }: { run: RunResult; maxHeight?: number }) {
  const help = run.error ? explainError(run.error) : undefined;
  return (
    <div className="console" style={{ maxHeight }} role="log" aria-live="polite">
      {run.logs.length === 0 && !run.error && <div className="console-empty">(nothing was printed — use console.log to show values)</div>}
      {run.logs.map((l, i) => (
        <div key={i} className="console-line" data-level={l.level}>{l.text}</div>
      ))}
      {run.error && (
        <div className="console-line" data-level="error">
          {run.error.name}: {run.error.message}
          {run.error.line ? ` (line ${run.error.line})` : ''}
          {help && <div style={{ color: 'var(--code-text)', fontFamily: 'var(--font-sans)', marginTop: 4 }}>💡 {inline(help)}</div>}
        </div>
      )}
    </div>
  );
}
