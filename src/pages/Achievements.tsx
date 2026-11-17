import { ACHIEVEMENTS } from '../data/achievements';
import { useAppStore } from '../store/useAppStore';
import { AchievementBadge } from '../components/ui/bits';

export function Achievements() {
  const s = useAppStore();
  const ctx = { xp: s.xp, activity: s.activity, onboarded: s.onboarded, preferredLanguages: s.prefs.preferredLanguages, completedLessons: s.completedLessons, challenges: s.challenges, guided: s.guided };
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]);
  const locked = ACHIEVEMENTS.filter((a) => !s.achievements[a.id]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Achievements</h1>
          <p>{unlocked.length} of {ACHIEVEMENTS.length} unlocked. More badges arrive with lessons, challenges and projects.</p>
        </div>
      </header>
      <div className="progress" style={{ marginBottom: 'var(--sp-8)', height: 8 }} role="progressbar" aria-valuenow={unlocked.length} aria-valuemin={0} aria-valuemax={ACHIEVEMENTS.length} aria-label="Achievements unlocked">
        <span style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }} />
      </div>

      {unlocked.length > 0 && (
        <section style={{ marginBottom: 'var(--sp-8)' }}>
          <h2 className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>Unlocked</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--sp-3)' }}>
            {unlocked.map((a) => <AchievementBadge key={a.id} a={a} unlockedAt={s.achievements[a.id]} />)}
          </div>
        </section>
      )}
      <section>
        <h2 className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>Still to earn</h2>
        {locked.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--sp-3)' }}>
            {locked.map((a) => <AchievementBadge key={a.id} a={a} progress={a.progress?.(ctx)} />)}
          </div>
        ) : (
          <div className="empty"><strong>You’ve earned every badge available so far.</strong>New ones are added as CodeVerse grows.</div>
        )}
      </section>
    </div>
  );
}
