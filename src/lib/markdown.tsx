import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Term } from '../components/ui/Term';

/**
 * Minimal, safe Markdown subset for lesson text. Produces React elements only
 * (never innerHTML), so content can't inject markup.
 */
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\{term:[a-z-]+(?:\|[^}]+)?\}|\[[^\]]+\]\([^)]+\))/g;

// Returns nodes rather than a component so it can be used inline in any JSX.
// eslint-disable-next-line react-refresh/only-export-components
export function inline(text: string): ReactNode[] {
  // split() with one capture group alternates: even indexes are plain text, odd are matches.
  // Only matched parts get formatting, so plain text like "[1, 2]" is never mistaken for a link.
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`')) return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
    if (part.startsWith('{term:')) {
      const [id, label] = part.slice(6, -1).split('|');
      return <Term key={i} id={id}>{label}</Term>;
    }
    if (part.startsWith('[')) {
      const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)!;
      const href = m[2];
      return href.startsWith('/') ? (
        <Link key={i} to={href} className="link">{m[1]}</Link>
      ) : (
        <a key={i} href={href} className="link" target="_blank" rel="noreferrer noopener">{m[1]}</a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function Markdown({ md }: { md: string }) {
  const blocks = md.trim().split(/\n\s*\n/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split('\n').map((l) => l.trim());
        if (lines.every((l) => l.startsWith('- '))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        }
        if (lines.every((l) => /^\d+\. /.test(l))) {
          return <ol key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\. /, ''))}</li>)}</ol>;
        }
        return <p key={i}>{inline(lines.join(' '))}</p>;
      })}
    </>
  );
}
