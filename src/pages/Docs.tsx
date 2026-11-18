import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Play, Search, Wrench } from 'lucide-react';
import { DOCS, DOC_LANG_LABEL, docCodeLang, type DocEntry } from '../content/docs';
import { CodeBlock } from '../components/code/CodeBlock';
import { RunOutput, SqlOutput } from '../components/code/Outputs';
import { PreviewFrame } from '../runtime/PreviewFrame';
import { runJs, type RunResult } from '../runtime/jsRunner';
import { runPython } from '../runtime/pyRunner';
import { runSql, type SqlResult } from '../runtime/sqlRunner';
import { inline } from '../lib/markdown';
import { useCodeTheme } from '../lib/hooks';

type LangFilter = 'all' | DocEntry['lang'];

export default function Docs() {
  const [q, setQ] = useState('');
  const [lang, setLang] = useState<LangFilter>('all');
  const { hash } = useLocation();
  const codeTheme = useCodeTheme();

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return DOCS.filter(
      (e) =>
        (lang === 'all' || e.lang === lang) &&
        (!query || [e.title, e.summary, e.syntax, e.category].some((t) => t.toLowerCase().includes(query))),
    );
  }, [q, lang]);

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const entry = DOCS.find((e) => e.id === id);
    if (entry) setLang(entry.lang);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 50);
  }, [hash]);

  const groups = list.reduce<Record<string, DocEntry[]>>((acc, e) => {
    const k = `${DOC_LANG_LABEL[e.lang]} · ${e.category}`;
    (acc[k] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="page" style={{ maxWidth: 980 }} data-code-theme={codeTheme}>
      <header className="page-header">
        <div>
          <h1>Documentation</h1>
          <p>Quick references in plain English, with examples you can run. {DOCS.length} entries.</p>
        </div>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <Link to="/glossary" className="btn"><BookOpen size={15} /> Glossary</Link>
          <Link to="/tools" className="btn"><Wrench size={15} /> Developer tools</Link>
        </div>
      </header>

      <div className="row" style={{ flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
        <label className="row" style={{ position: 'relative', flex: '1 1 220px', maxWidth: 360 }}>
          <Search size={15} className="subtle" style={{ position: 'absolute', left: 10 }} aria-hidden />
          <input className="input" style={{ paddingLeft: 32, width: '100%' }} placeholder="Search, e.g. “loop”, “join”, “flex”" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search documentation" />
        </label>
        <div className="segmented" role="group" aria-label="Language">
          {(['all', 'html', 'css', 'javascript', 'python', 'sql'] as LangFilter[]).map((l) => (
            <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{l === 'all' ? 'All' : DOC_LANG_LABEL[l]}</button>
          ))}
        </div>
      </div>

      {list.length === 0 && (
        <div className="empty">
          <strong>Nothing matches “{q}”</strong>
          Try a simpler word, or ask the AI tutor.
        </div>
      )}

      <div className="stack" style={{ gap: 'var(--sp-8)' }}>
        {Object.entries(groups).map(([group, entries]) => (
          <section key={group}>
            <h2 className="eyebrow" style={{ fontSize: 'var(--fs-xs)', marginBottom: 'var(--sp-3)' }}>{group}</h2>
            <div className="stack" style={{ gap: 'var(--sp-4)' }}>
              {entries.map((e) => <DocCard key={e.id} entry={e} highlighted={hash === `#${e.id}`} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function DocCard({ entry, highlighted }: { entry: DocEntry; highlighted: boolean }) {
  const [run, setRun] = useState<RunResult | null>(null);
  const [sql, setSql] = useState<SqlResult | null>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const runnable = entry.lang !== 'css';

  const go = async () => {
    setBusy(true);
    if (entry.lang === 'javascript' && entry.html) setPreview(true);
    else if (entry.lang === 'javascript') setRun(await runJs(entry.example));
    if (entry.lang === 'python') setRun(await runPython(entry.example));
    if (entry.lang === 'sql') setSql(await runSql(entry.example));
    if (entry.lang === 'html') setPreview(true);
    setBusy(false);
  };

  return (
    <article id={entry.id} className="panel" style={{ scrollMarginTop: 80, borderColor: highlighted ? 'var(--accent)' : undefined }}>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: 'var(--fs-md)' }}>{entry.title}</h3>
        <span className="badge">{DOC_LANG_LABEL[entry.lang]}</span>
      </div>
      <p className="muted" style={{ fontSize: 'var(--fs-sm)', margin: 'var(--sp-2) 0 var(--sp-3)' }}>{entry.summary}</p>
      <div className="stack" style={{ gap: 'var(--sp-3)' }}>
        <CodeBlock code={entry.syntax} lang={docCodeLang(entry.lang)} caption="Syntax" />
        <div>
          <CodeBlock
            code={entry.example}
            lang={docCodeLang(entry.lang)}
            caption="Example"
            actions={runnable && (
              <button className="btn btn-sm" onClick={go} disabled={busy}>
                <Play size={13} /> {entry.lang === 'html' || entry.html ? 'Preview' : 'Run'}
              </button>
            )}
          />
          {preview && (
            <div className="preview-shell">
              <div className="preview-label">Result{entry.html ? ' — try clicking it' : ''}</div>
              {entry.html ? <PreviewFrame html={entry.html} js={entry.example} allowScripts height={120} /> : <PreviewFrame html={entry.example} height={160} />}
            </div>
          )}
          {run && <div className="preview-shell" style={{ maxHeight: 220 }}><div className="preview-label">Output</div><RunOutput run={run} lang={entry.lang === 'python' ? 'python' : 'javascript'} /></div>}
          {sql && <div className="preview-shell" style={{ height: 200 }}><SqlOutput result={sql} /></div>}
        </div>
      </div>
      {entry.notes && <p className="callout" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-3)' }}>💡 {inline(entry.notes)}</p>}
      {entry.lesson && <Link to={entry.lesson} className="link" style={{ display: 'inline-block', marginTop: 'var(--sp-3)', fontSize: 'var(--fs-sm)' }}>Learn this in a lesson →</Link>}
    </article>
  );
}
