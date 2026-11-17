import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { addDays, currentStreak, dayKey, formatMinutes, levelInfo, longestStreak, totals } from '../lib/progress';
import { getLanguage, type Language } from '../data/languages';
import { ACHIEVEMENTS } from '../data/achievements';
import { LanguageRow } from '../components/ui/bits';

const WEEKS = 16;

export function Profile() {
  const s = useAppStore();
  const { prefs, activity, xp } = s;
  const lvl = levelInfo(xp);
  const all = totals(activity);
  const langs = prefs.preferredLanguages.map(getLanguage).filter(Boolean) as Language[];
  const name = prefs.displayName || 'Learner';

  return (
    <div className="page">
      <header className="page-header" style={{ alignItems: 'center' }}>
        <div className="row" style={{ gap: 'var(--sp-4)' }}>
          <span aria-hidden style={{ display: 'grid', placeItems: 'center', width: 64, height: 64, borderRadius: 'var(--r-lg)', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700, fontSize: 'var(--fs-xl)' }}>
            {name[0].toUpperCase()}
          </span>
          <div>
            <h1>{name}</h1>
            <p>Level {lvl.level} · {xp.toLocaleString()} XP · {Object.keys(s.achievements).length} badges</p>
          </div>
        </div>
        <Link to="/settings#profile" className="btn">Edit profile</Link>
      </header>

      <div className="grid-12">
        <section className="panel col-12" aria-labelledby="heat-h">
          <div className="panel-header">
            <h2 id="heat-h">Activity, last {WEEKS} weeks</h2>
            <span className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>
              Current streak {currentStreak(activity)} · Best {longestStreak(activity)}
            </span>
          </div>
          <Heatmap activity={activity} />
        </section>

        <section className="panel col-6">
          <div className="panel-header"><h2>Totals</h2></div>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 'var(--sp-2)', margin: 0, fontSize: 'var(--fs-sm)' }}>
            <dt className="muted">Active learning time</dt><dd style={{ margin: 0 }} className="mono">{formatMinutes(all.minutes)}</dd>
            <dt className="muted">Days learned</dt><dd style={{ margin: 0 }} className="mono">{Object.values(activity).filter((d) => d.minutes >= 1 || d.xp > 0).length}</dd>
            <dt className="muted">Lessons completed</dt><dd style={{ margin: 0 }} className="mono">{all.lessons}</dd>
            <dt className="muted">Challenges solved</dt><dd style={{ margin: 0 }} className="mono">{all.challenges}</dd>
            <dt className="muted">Achievements</dt><dd style={{ margin: 0 }} className="mono">{Object.keys(s.achievements).length} / {ACHIEVEMENTS.length}</dd>
          </dl>
        </section>

        <section className="panel col-6">
          <div className="panel-header"><h2>Languages</h2><Link to="/languages" className="link">Browse</Link></div>
          {langs.length ? (
            <ul className="list">{langs.map((l) => <li key={l.id}><LanguageRow lang={l} /></li>)}</ul>
          ) : (
            <div className="empty"><strong>No languages yet</strong>Add some from the Languages page.</div>
          )}
        </section>
      </div>
    </div>
  );
}

/** Calendar heatmap: one sequential hue, light → dark by active minutes. */
function Heatmap({ activity }: { activity: ReturnType<typeof useAppStore.getState>['activity'] }) {
  const [hover, setHover] = useState<string | null>(null);
  const today = new Date();
  // Start on the Sunday WEEKS-1 weeks ago so columns are whole weeks.
  const start = addDays(today, -(WEEKS - 1) * 7 - today.getDay());
  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i)).filter((d) => d <= today);
  const level = (m: number) => (m <= 0 ? 0 : m < 5 ? 1 : m < 15 ? 2 : m < 30 ? 3 : 4);
  const fills = ['var(--surface-3)', 'color-mix(in srgb, var(--accent) 30%, var(--surface-3))', 'color-mix(in srgb, var(--accent) 55%, var(--surface-3))', 'color-mix(in srgb, var(--accent) 80%, var(--surface-3))', 'var(--accent)'];
  const hovered = hover ? cells.find((d) => dayKey(d) === hover) : null;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <div role="img" aria-label="Daily activity heatmap" style={{ display: 'grid', gridTemplateRows: 'repeat(7, 12px)', gridAutoFlow: 'column', gridAutoColumns: '12px', gap: 3, width: 'max-content' }}>
          {cells.map((d) => {
            const k = dayKey(d);
            const m = activity[k]?.minutes ?? 0;
            return <span key={k} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)} style={{ width: 12, height: 12, borderRadius: 2, background: fills[level(m)], outline: hover === k ? '1px solid var(--text-2)' : undefined }} />;
          })}
        </div>
      </div>
      <div className="row" style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--fs-xs)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span className="muted" style={{ minHeight: 18 }}>
          {hovered ? `${hovered.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: ${formatMinutes(activity[hover!]?.minutes ?? 0)}` : 'Hover a day for details'}
        </span>
        <span className="row subtle" style={{ gap: 4 }}>
          Less {fills.map((f, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: f }} />)} More
        </span>
      </div>
    </div>
  );
}
