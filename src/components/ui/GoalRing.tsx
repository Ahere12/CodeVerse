/** Circular meter for today's goal. Text carries the value; the ring is supporting. */
export function GoalRing({ value, goal, size = 96 }: { value: number; goal: number; size?: number }) {
  const pct = Math.min(1, goal > 0 ? value / goal : 0);
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 500ms var(--ease)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', lineHeight: 1.1 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', fontVariantNumeric: 'tabular-nums' }}>{Math.floor(value)}</div>
          <div className="subtle" style={{ fontSize: 11 }}>of {goal} min</div>
        </div>
      </div>
    </div>
  );
}
