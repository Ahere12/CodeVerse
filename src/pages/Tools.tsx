import { useEffect, useMemo, useState } from 'react';
import { Braces, Check, Copy, Contrast, Regex, Binary } from 'lucide-react';

type ToolId = 'json' | 'regex' | 'contrast' | 'encode';
const TOOLS: { id: ToolId; label: string; icon: typeof Braces; blurb: string }[] = [
  { id: 'json', label: 'JSON formatter', icon: Braces, blurb: 'Validate, pretty-print and minify JSON.' },
  { id: 'regex', label: 'Regex tester', icon: Regex, blurb: 'Test regular expressions with live highlighting.' },
  { id: 'contrast', label: 'Contrast checker', icon: Contrast, blurb: 'Check text colours meet accessibility rules.' },
  { id: 'encode', label: 'Encode / decode', icon: Binary, blurb: 'Base64 and URL encoding.' },
];

export default function Tools() {
  const [tool, setTool] = useState<ToolId>(() => (TOOLS.some((t) => `#${t.id}` === window.location.hash) ? (window.location.hash.slice(1) as ToolId) : 'json'));
  useEffect(() => {
    window.history.replaceState(null, '', `#${tool}`);
  }, [tool]);

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <header className="page-header">
        <div>
          <h1>Developer tools</h1>
          <p>Small, private utilities — everything runs in your browser and nothing is uploaded.</p>
        </div>
      </header>
      <div className="segmented" role="tablist" aria-label="Tool" style={{ marginBottom: 'var(--sp-5)' }}>
        {TOOLS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tool === t.id} aria-pressed={tool === t.id} onClick={() => setTool(t.id)}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-4)' }}>{TOOLS.find((t) => t.id === tool)!.blurb}</p>
      {tool === 'json' && <JsonTool />}
      {tool === 'regex' && <RegexTool />}
      {tool === 'contrast' && <ContrastTool />}
      {tool === 'encode' && <EncodeTool />}
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button className="btn btn-sm" disabled={!text} onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); window.setTimeout(() => setOk(false), 1200); } catch { /* blocked */ } }}>
      {ok ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
    </button>
  );
}

const area: React.CSSProperties = { width: '100%', minHeight: 220, fontFamily: 'var(--font-mono)', fontSize: 13, padding: 'var(--sp-3)', height: 'auto', resize: 'vertical', lineHeight: 1.5 };

/* ---------------- JSON ---------------- */
function JsonTool() {
  const [input, setInput] = useState('{"name":"Ada","skills":["math","code"],"active":true}');
  const [indent, setIndent] = useState(2);
  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, error: 'Paste some JSON to begin.' };
    try {
      const value = JSON.parse(input);
      return { ok: true as const, pretty: JSON.stringify(value, null, indent), min: JSON.stringify(value) };
    } catch (e) {
      const msg = (e as Error).message;
      const pos = Number(/position (\d+)/.exec(msg)?.[1]);
      let where = '';
      if (Number.isFinite(pos)) {
        const before = input.slice(0, pos);
        const line = before.split('\n').length;
        const col = pos - before.lastIndexOf('\n');
        where = ` (line ${line}, column ${col})`;
      }
      // Beginner-friendly hints for the most common JSON mistakes.
      const hints: string[] = [];
      if (/,\s*[\]}]/.test(input)) hints.push('JSON doesn’t allow a comma after the last item.');
      if (/'[^']*'\s*:/.test(input) || /:\s*'[^']*'/.test(input)) hints.push('Use "double quotes" — single quotes aren’t valid JSON.');
      if (/[{,]\s*[A-Za-z_$][\w$]*\s*:/.test(input)) hints.push('Object keys must be in double quotes, e.g. {"name": "Ada"}.');
      if (/\/\/|\/\*/.test(input)) hints.push('JSON can’t contain comments.');
      return { ok: false as const, error: `${msg}${where}${hints.length ? `\nTip: ${hints.join(' ')}` : ''}` };
    }
  }, [input, indent]);

  return (
    <div className="tool-grid">
      <div className="stack">
        <label className="field-label" htmlFor="json-in">Input</label>
        <textarea id="json-in" className="input" style={area} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
      </div>
      <div className="stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="field-label">{result.ok ? <span style={{ color: 'var(--good)' }}>✓ Valid JSON</span> : 'Result'}</span>
          <div className="row">
            <select className="select" value={indent} onChange={(e) => setIndent(Number(e.target.value))} aria-label="Indent">
              <option value={2}>2 spaces</option><option value={4}>4 spaces</option><option value={0}>Minified</option>
            </select>
            <CopyBtn text={result.ok ? (indent ? result.pretty : result.min) : ''} />
          </div>
        </div>
        {result.ok ? (
          <pre className="solution" style={{ ...area, margin: 0, whiteSpace: 'pre-wrap', overflow: 'auto' }}>{indent ? result.pretty : result.min}</pre>
        ) : (
          <p className="warn-line" role="alert" style={{ color: 'var(--critical)', whiteSpace: 'pre-wrap' }}>{result.error}</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Regex (runs in a worker so a slow pattern can’t freeze the page) ---------------- */
const REGEX_WORKER = `self.onmessage = (e) => {
  const { pattern, flags, text } = e.data;
  try {
    const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    const matches = [];
    let m;
    while ((m = re.exec(text)) && matches.length < 500) {
      matches.push({ index: m.index, text: m[0], groups: m.slice(1), named: m.groups || null });
      if (m[0] === '') re.lastIndex++;
    }
    postMessage({ matches });
  } catch (err) { postMessage({ error: err.message }); }
};`;
let regexWorkerUrl: string | null = null;

interface RegexMatch { index: number; text: string; groups: (string | undefined)[]; named: Record<string, string> | null }

function RegexTool() {
  const [pattern, setPattern] = useState('\\b(\\w+)@(\\w+)\\.com\\b');
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState('Contact ada@example.com or grace@navy.com — not bob@site.org.');
  const [res, setRes] = useState<{ matches?: RegexMatch[]; error?: string; timedOut?: boolean }>({});

  useEffect(() => {
    regexWorkerUrl ??= URL.createObjectURL(new Blob([REGEX_WORKER], { type: 'text/javascript' }));
    const w = new Worker(regexWorkerUrl);
    const timer = window.setTimeout(() => { w.terminate(); setRes({ timedOut: true }); }, 1000);
    w.onmessage = (e) => { window.clearTimeout(timer); w.terminate(); setRes(e.data); };
    w.postMessage({ pattern, flags: flags.replace(/[^dgimsuy]/g, ''), text });
    return () => { window.clearTimeout(timer); w.terminate(); };
  }, [pattern, flags, text]);

  const highlighted = useMemo(() => {
    if (!res.matches?.length) return [text];
    const out: React.ReactNode[] = [];
    let last = 0;
    res.matches.forEach((m, i) => {
      if (m.index > last) out.push(text.slice(last, m.index));
      out.push(<mark key={i} className="re-mark">{m.text || '∅'}</mark>);
      last = m.index + m.text.length;
    });
    out.push(text.slice(last));
    return out;
  }, [res, text]);

  return (
    <div className="stack" style={{ gap: 'var(--sp-4)' }}>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <span className="mono subtle">/</span>
        <input className="input mono" style={{ flex: '1 1 260px' }} value={pattern} onChange={(e) => setPattern(e.target.value)} aria-label="Regular expression" spellCheck={false} />
        <span className="mono subtle">/</span>
        <input className="input mono" style={{ width: 70 }} value={flags} onChange={(e) => setFlags(e.target.value)} aria-label="Flags" spellCheck={false} />
      </div>
      <p className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>Flags: <code className="inline-code">g</code> all matches, <code className="inline-code">i</code> ignore case, <code className="inline-code">m</code> multi-line, <code className="inline-code">s</code> dot matches newlines.</p>
      <label className="field-label" htmlFor="re-text">Test text</label>
      <textarea id="re-text" className="input" style={{ ...area, minHeight: 120 }} value={text} onChange={(e) => setText(e.target.value)} />
      {res.error && <p role="alert" style={{ color: 'var(--critical)' }}>Invalid pattern: {res.error}</p>}
      {res.timedOut && <p role="alert" style={{ color: 'var(--warning)' }}>This pattern took too long and was stopped (it may backtrack catastrophically).</p>}
      {res.matches && (
        <>
          <div className="panel" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{highlighted}</div>
          <div className="field-label">{res.matches.length} match{res.matches.length === 1 ? '' : 'es'}</div>
          {res.matches.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="result-table" style={{ color: 'var(--text)' }}>
                <thead><tr><th>#</th><th>Match</th><th>Index</th>{res.matches[0].groups.map((_, i) => <th key={i}>Group {i + 1}</th>)}</tr></thead>
                <tbody>
                  {res.matches.slice(0, 50).map((m, i) => (
                    <tr key={i}><td>{i + 1}</td><td>{m.text}</td><td>{m.index}</td>{m.groups.map((g, j) => <td key={j}>{g ?? '—'}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Contrast ---------------- */
function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
const lum = ([r, g, b]: [number, number, number]) => {
  const f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

function ContrastTool() {
  const [fg, setFg] = useState('#1c1a16');
  const [bg, setBg] = useState('#f4f1ea');
  const a = parseHex(fg);
  const b = parseHex(bg);
  const ratio = a && b ? (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05) : null;
  const rows = ratio
    ? [
        { label: 'Normal text — AA (4.5:1)', ok: ratio >= 4.5 },
        { label: 'Normal text — AAA (7:1)', ok: ratio >= 7 },
        { label: 'Large text — AA (3:1)', ok: ratio >= 3 },
        { label: 'UI components & icons (3:1)', ok: ratio >= 3 },
      ]
    : [];
  return (
    <div className="tool-grid">
      <div className="stack">
        {[['Text colour', fg, setFg], ['Background', bg, setBg]].map(([label, val, set]) => (
          <label key={label as string} className="field">
            <span className="field-label">{label as string}</span>
            <div className="row">
              <input type="color" value={parseHex(val as string) ? (val as string).startsWith('#') ? (val as string) : `#${val}` : '#000000'} onChange={(e) => (set as (v: string) => void)(e.target.value)} aria-label={`${label} picker`} style={{ width: 44, height: 36, padding: 0, border: 0, background: 'none' }} />
              <input className="input mono" value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} aria-label={`${label} hex`} />
            </div>
          </label>
        ))}
        <button className="btn btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => { setFg(bg); setBg(fg); }}>Swap</button>
      </div>
      <div className="stack">
        <div style={{ background: b ? bg : '#fff', color: a ? fg : '#000', padding: 'var(--sp-5)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>Large heading text</div>
          <p style={{ margin: '6px 0 0' }}>Normal body text looks like this. Can you read it comfortably?</p>
        </div>
        {ratio ? (
          <>
            <div className="stat-value">{ratio.toFixed(2)} : 1</div>
            <ul className="contrast-results">
              {rows.map((r) => (
                <li key={r.label} data-ok={r.ok}>
                  <strong>{r.ok ? '✓ Pass' : '✗ Fail'}</strong> <span>{r.label}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="warn-line">Enter colours as hex, e.g. #1c1a16.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Encode / decode ---------------- */
const b64encode = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64decode = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0)));

function EncodeTool() {
  const [mode, setMode] = useState<'b64e' | 'b64d' | 'urle' | 'urld'>('b64e');
  const [input, setInput] = useState('Hello, CodeVerse! 👋');
  const out = useMemo(() => {
    try {
      if (mode === 'b64e') return { ok: true, text: b64encode(input) };
      if (mode === 'b64d') return { ok: true, text: b64decode(input) };
      if (mode === 'urle') return { ok: true, text: encodeURIComponent(input) };
      return { ok: true, text: decodeURIComponent(input) };
    } catch {
      return { ok: false, text: mode === 'b64d' ? 'That isn’t valid Base64.' : 'That isn’t valid URL-encoded text.' };
    }
  }, [mode, input]);
  return (
    <div className="stack" style={{ gap: 'var(--sp-3)' }}>
      <div className="segmented" role="group" aria-label="Mode">
        {([['b64e', 'Base64 encode'], ['b64d', 'Base64 decode'], ['urle', 'URL encode'], ['urld', 'URL decode']] as const).map(([id, l]) => (
          <button key={id} aria-pressed={mode === id} onClick={() => setMode(id)}>{l}</button>
        ))}
      </div>
      <div className="tool-grid">
        <textarea className="input" style={{ ...area, minHeight: 140 }} value={input} onChange={(e) => setInput(e.target.value)} aria-label="Input" spellCheck={false} />
        <div className="stack">
          <pre className="solution" style={{ ...area, minHeight: 140, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: out.ok ? undefined : 'var(--critical)' }}>{out.text}</pre>
          <div><CopyBtn text={out.ok ? out.text : ''} /></div>
        </div>
      </div>
      <p className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>Base64 is encoding, not encryption — anyone can decode it. Never use it to hide passwords.</p>
    </div>
  );
}
