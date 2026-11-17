import { useState } from 'react';
import { dayKey, formatMinutes, lastNDays, type ActivityLog } from '../../lib/progress';

/**
 * Single-series bar chart: active minutes for the last 7 days, with the daily goal
 * as a dashed reference line. One series → no legend; the panel title names it.
 */
export function WeeklyChart({ activity, goal }: { activity: ActivityLog; goal: number }) {
  const days = lastNDays(7);
  const data = days.map((d) => ({
    key: dayKey(d),
    label: d.toLocaleDateString(undefined, { weekday: 'short' }),
    full: d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
    minutes: Math.round(activity[dayKey(d)]?.minutes ?? 0),
  }));
  const [hover, setHover] = useState<number | null>(null);

  const W = 560;
  const H = 180;
  const pad = { top: 16, right: 8, bottom: 26, left: 34 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(goal * 1.25, ...data.map((d) => d.minutes), 10);
  const niceMax = Math.ceil(max / 10) * 10;
  const y = (v: number) => pad.top + innerH - (v / niceMax) * innerH;
  const slot = innerW / data.length;
  const barW = Math.min(36, slot * 0.56);
  const ticks = [0, niceMax / 2, niceMax];

  return (
    <figure style={{ margin: 0, position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Active minutes for the last 7 days. Daily goal ${goal} minutes.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--text-3)" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const h = Math.max(0, innerH - (y(d.minutes) - pad.top));
          const x = pad.left + slot * i + (slot - barW) / 2;
          const isToday = i === data.length - 1;
          const r = Math.min(4, h);
          return (
            <g key={d.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* Full-height hit target, larger than the mark */}
              <rect x={pad.left + slot * i} y={pad.top} width={slot} height={innerH} fill={hover === i ? 'var(--surface-2)' : 'transparent'} />
              {h > 0 && (
                <path
                  d={`M${x},${y(0)} V${y(d.minutes) + r} Q${x},${y(d.minutes)} ${x + r},${y(d.minutes)} H${x + barW - r} Q${x + barW},${y(d.minutes)} ${x + barW},${y(d.minutes) + r} V${y(0)} Z`}
                  fill="var(--accent)"
                  opacity={hover === null || hover === i ? 1 : 0.55}
                />
              )}
              <text x={pad.left + slot * i + slot / 2} y={H - 8} textAnchor="middle" fontSize={11} fill={isToday ? 'var(--text)' : 'var(--text-3)'} fontWeight={isToday ? 600 : 400}>
                {isToday ? 'Today' : d.label}
              </text>
            </g>
          );
        })}
        <line x1={pad.left} x2={W - pad.right} y1={y(goal)} y2={y(goal)} stroke="var(--text-3)" strokeDasharray="4 4" strokeWidth={1} pointerEvents="none" />
        <text x={W - pad.right} y={y(goal) - 5} textAnchor="end" fontSize={11} fill="var(--text-2)" pointerEvents="none">
          Goal {goal}m
        </text>
      </svg>
      {hover !== null && (
        <div
          role="presentation"
          style={{
            position: 'absolute',
            top: 0,
            left: `${((pad.left + slot * hover + slot / 2) / W) * 100}%`,
            transform: 'translate(-50%, -100%)',
            background: 'var(--surface-3)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-md)',
            padding: '6px 10px',
            fontSize: 'var(--fs-xs)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-2)',
            pointerEvents: 'none',
          }}
        >
          <div className="subtle">{data[hover].full}</div>
          <div style={{ fontWeight: 600 }}>{formatMinutes(data[hover].minutes)} active</div>
        </div>
      )}
      {/* Table view for screen readers */}
      <table className="sr-only">
        <caption>Active learning minutes per day</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}><th scope="row">{d.full}</th><td>{d.minutes} minutes</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
