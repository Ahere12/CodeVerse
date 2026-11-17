import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import type { NavItem } from '../lib/nav';

/**
 * Honest placeholder for sections that are not built yet.
 * It says what is coming and points to things that work today — no fake content.
 */
export function InDevelopment({ item }: { item: NavItem }) {
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <header className="page-header">
        <div className="row" style={{ gap: 'var(--sp-3)' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <item.icon size={20} aria-hidden />
          </span>
          <div>
            <h1>{item.label}</h1>
            <p>{item.description}</p>
          </div>
        </div>
      </header>
      <section className="panel">
        <div className="row" style={{ marginBottom: 'var(--sp-3)' }}>
          <span className="badge badge-warning"><Hammer size={12} aria-hidden /> In development</span>
        </div>
        <p className="muted">This section isn’t built yet. When it ships it will include:</p>
        <ul style={{ margin: 'var(--sp-3) 0 0', paddingLeft: 'var(--sp-5)', color: 'var(--text-2)' }}>
          {item.planned?.map((p) => <li key={p} style={{ marginBottom: 4 }}>{p}</li>)}
        </ul>
        <div className="row" style={{ marginTop: 'var(--sp-6)', flexWrap: 'wrap' }}>
          <Link to="/languages" className="btn">Explore languages</Link>
          <Link to="/glossary" className="btn btn-ghost">Read the glossary</Link>
        </div>
      </section>
    </div>
  );
}
