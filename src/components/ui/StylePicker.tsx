import { Check } from 'lucide-react';
import type { DesignStyle } from '../../store/useAppStore';

interface StyleInfo {
  id: DesignStyle;
  name: string;
  blurb: string;
  /** Fixed sample colours so each preview shows its own look regardless of the active theme. */
  swatch: { bg: string; panel: string; ink: string; muted: string; accent: string; line: string };
  headingFont: string;
  bodyFont: string;
  radius: number;
}

const STYLES: StyleInfo[] = [
  {
    id: 'book',
    name: 'Technical book',
    blurb: 'Serif headings, hairline rules, warm paper and ink.',
    swatch: { bg: '#f4f1ea', panel: '#fbf9f4', ink: '#1c1a16', muted: '#7e7567', accent: '#b0502a', line: '#ddd4c4' },
    headingFont: "'Newsreader', Georgia, serif",
    bodyFont: "'IBM Plex Sans', sans-serif",
    radius: 0,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    blurb: 'Monospace, dense and sharp, with an amber accent.',
    swatch: { bg: '#0a0a0a', panel: '#101010', ink: '#e8e8e3', muted: '#6f6f68', accent: '#ffb000', line: '#2a2a2a' },
    headingFont: "'JetBrains Mono', monospace",
    bodyFont: "'JetBrains Mono', monospace",
    radius: 0,
  },
  {
    id: 'friendly',
    name: 'Bright & friendly',
    blurb: 'Clean, colourful and rounded, with a colour for each language.',
    swatch: { bg: '#f6f7fb', panel: '#ffffff', ink: '#161a2c', muted: '#7f86a0', accent: '#e8552a', line: '#e4e7f0' },
    headingFont: "'Bricolage Grotesque', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    radius: 12,
  },
];

export function StylePicker({ value, onChange }: { value: DesignStyle; onChange: (s: DesignStyle) => void }) {
  return (
    <div role="radiogroup" aria-label="Design style" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-3)' }}>
      {STYLES.map((s) => {
        const on = value === s.id;
        const w = s.swatch;
        return (
          <button
            key={s.id}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s.id)}
            style={{
              textAlign: 'left',
              padding: 0,
              cursor: 'pointer',
              background: 'var(--surface)',
              border: `2px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--r-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Miniature of the style */}
            <div aria-hidden style={{ background: w.bg, padding: 12, height: 104, display: 'flex', gap: 8 }}>
              <div style={{ width: 26, display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 2 }}>
                {[1, 0, 0, 0].map((a, i) => (
                  <span key={i} style={{ height: 5, borderRadius: s.radius ? 3 : 0, background: a ? w.accent : w.line }} />
                ))}
              </div>
              <div style={{ flex: 1, background: w.panel, border: `1px solid ${w.line}`, borderRadius: s.radius, padding: 8 }}>
                <div style={{ fontFamily: s.headingFont, color: w.ink, fontWeight: s.id === 'book' ? 500 : 700, fontSize: 15, lineHeight: 1.1 }}>
                  {s.id === 'terminal' ? <><span style={{ color: w.accent }}># </span>Functions</> : 'Functions'}
                </div>
                <div style={{ fontFamily: s.bodyFont, color: w.muted, fontSize: 9.5, marginTop: 4 }}>A function is a reusable recipe…</div>
                <div style={{ marginTop: 8, display: 'inline-block', background: w.accent, color: s.id === 'terminal' ? '#140e00' : '#fff', fontFamily: s.bodyFont, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: s.id === 'friendly' ? 999 : 0 }}>
                  {s.id === 'terminal' ? '[CONTINUE]' : 'Continue'}
                </div>
              </div>
            </div>
            <div style={{ padding: 'var(--sp-3)', borderTop: '1px solid var(--border)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{s.name}</span>
                {on && <Check size={16} color="var(--accent)" aria-hidden />}
              </div>
              <div className="subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 2 }}>{s.blurb}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
