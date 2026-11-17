import { useId, useState, type ReactNode } from 'react';
import { GLOSSARY } from '../../data/glossary';
import { useAppStore } from '../../store/useAppStore';

/**
 * Wraps a technical word with a plain-language definition shown on hover or focus.
 * Learners can turn these hints off in Settings.
 */
export function Term({ id, children }: { id: keyof typeof GLOSSARY | string; children?: ReactNode }) {
  const entry = GLOSSARY[id];
  const enabled = useAppStore((s) => s.prefs.showTermHints);
  const [open, setOpen] = useState(false);
  const popId = useId();
  const label = children ?? entry?.term ?? id;
  if (!entry || !enabled) return <>{label}</>;

  return (
    <span
      className="term"
      tabIndex={0}
      aria-describedby={open ? popId : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      {label}
      {open && (
        <span role="tooltip" id={popId} className="term-pop">
          <strong>{entry.term}</strong>
          {entry.definition}
        </span>
      )}
    </span>
  );
}
