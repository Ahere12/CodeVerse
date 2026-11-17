import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

/** Shown instead of a blank screen if a page crashes. Your saved progress is unaffected. */
export function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : String(error);
  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="eyebrow">Something went wrong</div>
      <h1 style={{ marginTop: 'var(--sp-2)' }}>This page hit an error</h1>
      <p className="muted" style={{ marginTop: 'var(--sp-2)' }}>
        It’s a bug on our side, not something you did. Your progress is saved. Try reloading, or go back to the dashboard.
      </p>
      <pre className="inline-code" style={{ display: 'block', whiteSpace: 'pre-wrap', marginTop: 'var(--sp-4)', padding: 'var(--sp-3)' }}>{message}</pre>
      <div className="row" style={{ marginTop: 'var(--sp-5)' }}>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
        <Link to="/" className="btn" reloadDocument>Dashboard</Link>
      </div>
    </div>
  );
}
