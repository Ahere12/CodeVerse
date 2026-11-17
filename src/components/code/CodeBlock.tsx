import { useMemo, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { classHighlighter, highlightCode } from '@lezer/highlight';
import type { CodeLang } from '../../content/types';
import { LANG_LABEL, parserFor } from './languages';

/** Read-only syntax-highlighted code with a copy button. Uses the same tokens as the editor. */
export function CodeBlock({ code, lang, caption, actions }: { code: string; lang: CodeLang; caption?: string; actions?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const nodes = useMemo(() => {
    const parser = parserFor(lang);
    if (!parser) return [code];
    const out: ReactNode[] = [];
    let k = 0;
    highlightCode(
      code,
      parser.parse(code),
      classHighlighter,
      (text, classes) => out.push(classes ? <span key={k++} className={classes}>{text}</span> : text),
      () => out.push('\n'),
    );
    return out;
  }, [code, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the text is still selectable */
    }
  };

  return (
    <figure className="code-block" style={{ margin: 0 }}>
      <div className="code-block-bar">
        <span style={{ fontWeight: 600 }}>{LANG_LABEL[lang]}</span>
        {caption && <span>· {caption}</span>}
        <span className="spacer" />
        {actions}
        <button className="btn btn-ghost btn-sm" onClick={copy} aria-label="Copy code">
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
      <pre><code>{nodes}</code></pre>
    </figure>
  );
}
