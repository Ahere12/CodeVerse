import { Link } from 'react-router-dom';
import { BookOpen, Clock, Compass, Flame, Lock, Sparkles, Target, Trophy, Zap, type LucideIcon } from 'lucide-react';
import { RUNTIME_LABEL, type Language } from '../../data/languages';
import type { Achievement } from '../../data/achievements';
import { LANGUAGE_ICONS, luminance } from '../../data/languageIcons';
import { useResolvedTheme } from '../../lib/hooks';

const ACHIEVEMENT_ICONS: Record<Achievement['icon'], LucideIcon> = { Sparkles, Flame, Clock, Zap, Compass, Target, Trophy, BookOpen };

/**
 * Language logo tile. Uses the official logo in its brand colour; falls back to the
 * theme's text colour when the brand colour would be unreadable on the current
 * background (e.g. black logos in dark mode), and to a text mark when no logo exists.
 */
export function LanguageMark({ lang, size = 36 }: { lang: Language; size?: number }) {
  const mode = useResolvedTheme();
  const icon = LANGUAGE_ICONS[lang.id];
  const hex = icon?.hex ?? '';
  const lum = hex ? luminance(hex) : 0.5;
  const unreadable = mode === 'dark' ? lum < 0.06 : lum > 0.6;
  const color = !icon || unreadable ? 'var(--text)' : `#${hex}`;
  return (
    <span
      aria-hidden
      className="lang-tile"
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 'var(--r-md)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: lang.mark.length > 2 ? size * 0.28 : size * 0.36,
        color,
        ['--brand' as string]: hex ? `#${hex}` : undefined,
      }}
    >
      {icon ? (
        <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill="currentColor">
          <path d={icon.path} />
        </svg>
      ) : (
        lang.mark
      )}
    </span>
  );
}

export function RuntimeBadge({ lang }: { lang: Language }) {
  const s = lang.runtime.status;
  const cls = s === 'available' ? 'badge badge-good badge-dot' : s === 'planned' ? 'badge badge-info badge-dot' : 'badge';
  return (
    <span className={cls} title={lang.runtime.note}>
      {RUNTIME_LABEL[s]}
    </span>
  );
}

const CURVE = ['', 'Gentle start', 'Moderate', 'Steep'];
export function CurveBadge({ lang }: { lang: Language }) {
  const cls = ['', 'badge-beginner', 'badge-intermediate', 'badge-advanced'][lang.learningCurve];
  return <span className={`badge ${cls}`}>{CURVE[lang.learningCurve]}</span>;
}

export function LanguageRow({ lang }: { lang: Language }) {
  return (
    <Link to={`/languages/${lang.id}`} className="list-item">
      <LanguageMark lang={lang} size={32} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="list-title">{lang.name}</div>
        <div className="subtle" style={{ fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {lang.tagline}
        </div>
      </div>
      <CurveBadge lang={lang} />
    </Link>
  );
}

export function AchievementBadge({ a, unlockedAt, progress }: { a: Achievement; unlockedAt?: number; progress?: number }) {
  const Icon = ACHIEVEMENT_ICONS[a.icon];
  const unlocked = !!unlockedAt;
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--sp-3)',
        alignItems: 'flex-start',
        padding: 'var(--sp-3)',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--border)',
        background: unlocked ? 'var(--surface-2)' : 'transparent',
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 'var(--r-md)',
          background: unlocked ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: unlocked ? 'var(--accent)' : 'var(--text-3)',
        }}
        aria-hidden
      >
        {unlocked ? <Icon size={18} /> : <Lock size={16} />}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', color: unlocked ? 'var(--text)' : 'var(--text-2)' }}>
          {a.title}
          <span className="sr-only">{unlocked ? ' (unlocked)' : ' (locked)'}</span>
        </div>
        <div className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>{a.description}</div>
        {unlocked ? (
          <div className="subtle" style={{ fontSize: 11, marginTop: 4 }}>Unlocked {new Date(unlockedAt!).toLocaleDateString()}</div>
        ) : progress !== undefined && progress > 0 ? (
          <div className="progress" style={{ marginTop: 6 }} aria-label={`${Math.round(progress * 100)}% complete`}>
            <span style={{ width: `${progress * 100}%` }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
