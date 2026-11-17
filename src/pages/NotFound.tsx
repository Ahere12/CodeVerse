import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div className="eyebrow mono">404</div>
      <h1 style={{ marginTop: 'var(--sp-2)' }}>We couldn’t find that page</h1>
      <p className="muted" style={{ marginTop: 'var(--sp-2)' }}>
        The link may be out of date. Try searching with <kbd>Ctrl</kbd> <kbd>K</kbd>, or head back home.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--sp-5)' }}>Back to dashboard</Link>
    </div>
  );
}
