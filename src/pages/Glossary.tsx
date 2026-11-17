import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { GLOSSARY } from '../data/glossary';

export function Glossary() {
  const [q, setQ] = useState('');
  const { hash } = useLocation();
  const entries = useMemo(
    () =>
      Object.entries(GLOSSARY)
        .sort((a, b) => a[1].term.localeCompare(b[1].term))
        .filter(([, g]) => !q || g.term.toLowerCase().includes(q.toLowerCase()) || g.definition.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' });
  }, [hash]);

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <header className="page-header">
        <div>
          <h1>Glossary</h1>
          <p>Programming words, explained without jargon. Dotted-underlined words across CodeVerse link here.</p>
        </div>
      </header>
      <label className="row" style={{ position: 'relative', marginBottom: 'var(--sp-5)' }}>
        <Search size={15} className="subtle" style={{ position: 'absolute', left: 10 }} aria-hidden />
        <input className="input" style={{ paddingLeft: 32, width: '100%' }} placeholder="Search terms" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search glossary" />
      </label>
      <dl className="panel panel-flush" style={{ margin: 0 }}>
        {entries.map(([k, g], i) => (
          <div
            key={k}
            id={k}
            style={{
              padding: 'var(--sp-4) var(--sp-5)',
              borderTop: i ? '1px solid var(--border)' : 0,
              background: hash === `#${k}` ? 'var(--accent-soft)' : undefined,
              scrollMarginTop: 80,
            }}
          >
            <dt style={{ fontWeight: 600 }}>{g.term}</dt>
            <dd style={{ margin: '4px 0 0', color: 'var(--text-2)' }}>{g.definition}</dd>
          </div>
        ))}
        {entries.length === 0 && <div className="palette-empty">No terms match “{q}”.</div>}
      </dl>
    </div>
  );
}
