import { useEffect, useRef, useState } from 'react';
import type { LogLine, RunResult } from '../../runtime/jsRunner';
import { explainError } from '../../runtime/jsRunner';
import { explainPythonError } from '../../runtime/pyRunner';
import { explainSqlError, type SqlResult } from '../../runtime/sqlRunner';
import { inline } from '../../lib/markdown';

/**
 * Runs a full HTML document in a sandboxed iframe (scripts allowed, but in an opaque
 * origin: no access to CodeVerse, its storage or cookies) and collects console output.
 */
export function WebPreview({ doc, onLog, onStorage, runKey }: { doc: string; onLog: (l: LogLine) => void; onStorage?: (data: Record<string, string>) => void; runKey: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const logRef = useRef(onLog);
  logRef.current = onLog;
  const storageRef = useRef(onStorage);
  storageRef.current = onStorage;

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow || !e.data || e.data.__cv !== 1) return;
      if (e.data.storage && typeof e.data.storage === 'object') {
        const clean: Record<string, string> = {};
        let size = 0;
        for (const [k, v] of Object.entries(e.data.storage as Record<string, unknown>)) {
          size += String(k).length + String(v).length;
          if (size > 500_000) break; // cap per project
          clean[String(k)] = String(v);
        }
        storageRef.current?.(clean);
        return;
      }
      const level = ['log', 'info', 'warn', 'error'].includes(e.data.level) ? e.data.level : 'log';
      logRef.current({ level, text: String(e.data.text).slice(0, 5000) });
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <iframe
      key={runKey}
      ref={ref}
      title="Live preview"
      srcDoc={doc}
      sandbox="allow-scripts allow-modals allow-forms"
      referrerPolicy="no-referrer"
      style={{ width: '100%', height: '100%', border: 0, background: '#fff', display: 'block' }}
    />
  );
}

export function LogView({ logs, empty = 'No output yet.' }: { logs: LogLine[]; empty?: string }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [logs.length]);
  return (
    <div className="console" style={{ height: '100%' }} role="log" aria-live="polite">
      {logs.length === 0 && <div className="console-empty">{empty}</div>}
      {logs.map((l, i) => <div key={i} className="console-line" data-level={l.level}>{l.text}</div>)}
      <div ref={end} />
    </div>
  );
}

export function RunOutput({ run, lang }: { run: RunResult | null; lang: 'javascript' | 'python' }) {
  if (!run) return <LogView logs={[]} empty="Press Run (Ctrl+Enter) to see output." />;
  const help = run.error ? (lang === 'python' ? explainPythonError(run.error) : explainError(run.error)) : undefined;
  const logs: LogLine[] = [...run.logs];
  return (
    <div className="console" style={{ height: '100%' }} role="log">
      {logs.length === 0 && !run.error && <div className="console-empty">Finished in {run.ms} ms — nothing was printed. Use {lang === 'python' ? 'print()' : 'console.log()'} to show values.</div>}
      {logs.map((l, i) => <div key={i} className="console-line" data-level={l.level}>{l.text}</div>)}
      {run.error && (
        <div className="console-line" data-level="error">
          {run.error.name}: {run.error.message}
          {run.error.line ? ` (line ${run.error.line})` : ''}
          {help && <div style={{ color: 'var(--code-text)', fontFamily: 'var(--font-sans)', marginTop: 4 }}>💡 {inline(help)}</div>}
        </div>
      )}
      {!run.error && logs.length > 0 && <div className="console-empty" style={{ marginTop: 4 }}>Finished in {run.ms} ms</div>}
    </div>
  );
}

export function SqlOutput({ result }: { result: SqlResult | null }) {
  const [tab, setTab] = useState(0);
  if (!result) return <LogView logs={[]} empty="Press Run (Ctrl+Enter) to query the shop database." />;
  if (result.error) {
    const help = explainSqlError(result.error);
    return (
      <div className="console" style={{ height: '100%' }}>
        <div className="console-line" data-level="error">{result.error}</div>
        {help && <div className="console-line" style={{ fontFamily: 'var(--font-sans)' }}>💡 {inline(help)}</div>}
      </div>
    );
  }
  if (!result.results.length) {
    return <LogView logs={[{ level: 'info', text: `Done in ${result.ms} ms. ${result.changes} row(s) changed. (Each run starts from a fresh copy of the database.)` }]} />;
  }
  const t = result.results[Math.min(tab, result.results.length - 1)];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--code-bg)' }}>
      {result.results.length > 1 && (
        <div className="row" style={{ padding: 6, gap: 4, borderBottom: '1px solid var(--border)' }}>
          {result.results.map((_, i) => (
            <button key={i} className={`btn btn-sm ${i === tab ? '' : 'btn-ghost'}`} onClick={() => setTab(i)}>Result {i + 1}</button>
          ))}
        </div>
      )}
      <ResultTable table={t} />
      <div className="subtle" style={{ fontSize: 'var(--fs-xs)', padding: '4px 10px', borderTop: '1px solid var(--border)' }}>
        {t.values.length} row{t.values.length === 1 ? '' : 's'} · {result.ms} ms
      </div>
    </div>
  );
}

export function ResultTable({ table }: { table: { columns: string[]; values: unknown[][] } }) {
  return (
    <div style={{ overflow: 'auto', flex: 1 }}>
      <table className="result-table">
        <thead><tr>{table.columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
        <tbody>
          {table.values.slice(0, 500).map((r, i) => (
            <tr key={i}>{r.map((v, j) => <td key={j} data-null={v === null}>{v === null ? 'NULL' : String(v)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
