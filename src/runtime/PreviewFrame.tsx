import { useEffect, useState } from 'react';

const BASE_CSS = `
  :root { color-scheme: light; }
  body { margin: 0; padding: 16px; font: 15px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1a1d21; background: #fff; }
  img { max-width: 100%; }
`;

/**
 * Renders learner HTML/CSS in a sandboxed iframe.
 * - Without `allowScripts` the sandbox is empty: no scripts, forms, popups or navigation.
 * - With it, scripts run in an opaque origin: no access to this app, its storage or cookies.
 * Updates are debounced so typing stays smooth.
 */
export function PreviewFrame({
  html,
  css = '',
  js = '',
  allowScripts = false,
  title = 'Preview',
  height = 220,
  debounceMs = 250,
}: {
  html: string;
  css?: string;
  js?: string;
  allowScripts?: boolean;
  title?: string;
  height?: number | string;
  debounceMs?: number;
}) {
  const build = () =>
    `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>${BASE_CSS}</style><style>${css}</style></head><body>${html}${
      allowScripts && js ? `<script>${js.replace(/<\/script/gi, '<\\/script')}</` + `script>` : ''
    }</body></html>`;
  const [doc, setDoc] = useState(build);

  useEffect(() => {
    const id = window.setTimeout(() => setDoc(build()), debounceMs);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, css, js, allowScripts]);

  return (
    <iframe
      title={title}
      srcDoc={doc}
      sandbox={allowScripts ? 'allow-scripts' : ''}
      referrerPolicy="no-referrer"
      style={{ width: '100%', height, border: 0, background: '#fff', display: 'block' }}
    />
  );
}
