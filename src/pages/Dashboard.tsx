import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Clock, BookCheck, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { currentStreak, dayKey, formatMinutes, levelInfo, longestStreak, totals } from '../lib/progress';
import { getLanguage, LANGUAGES } from '../data/languages';
import { ACHIEVEMENTS } from '../data/achievements';
import { WeeklyChart } from '../components/ui/WeeklyChart';
import { GoalRing } from '../components/ui/GoalRing';
import { AchievementBadge, LanguageRow } from '../components/ui/bits';
import { Term } from '../components/ui/Term';
import { Onboarding } from './Onboarding';
import { COURSES, courseProgress, getCourse, lessonPath, nextLessonIn } from '../content';
import { CourseMark, LevelBadge } from '../components/lesson/CourseBits';
import { CHALLENGES, CHALLENGE_XP } from '../content/challenges';
import { dailyChallengeIndex } from '../runtime/gradeChallenge';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Default first course per self-reported experience (the placement quiz overrides this). */
const START_COURSE = { new: 'start-here', some: 'html-foundations', experienced: 'js-foundations' } as const;

export function Dashboard() {
  const s = useAppStore();
  if (!s.onboarded) return <Onboarding />;

  const { prefs, activity, xp, lastVisited } = s;
  const today = activity[dayKey()];
  const todayMin = today?.minutes ?? 0;
  const streak = currentStreak(activity);
  const best = longestStreak(activity);
  const all = totals(activity);
  const lvl = levelInfo(xp);
  const goalMet = todayMin >= prefs.dailyGoalMinutes;

  const myLangs = prefs.preferredLanguages.map(getLanguage).filter(Boolean) as typeof LANGUAGES;
  const startCourse = getCourse(s.placement?.courseId ?? START_COURSE[prefs.experience])!;
  const firstLesson = nextLessonIn(startCourse, s.completedLessons);
  const continueTo = lastVisited ?? { title: firstLesson.title, path: lessonPath(startCourse.id, firstLesson.id) };
  const pathCourses = COURSES.slice(Math.max(0, COURSES.indexOf(startCourse)), COURSES.indexOf(startCourse) + 3);

  const ctx = { xp, activity, onboarded: s.onboarded, preferredLanguages: prefs.preferredLanguages, completedLessons: s.completedLessons, challenges: s.challenges };
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).sort((a, b) => s.achievements[b.id] - s.achievements[a.id]);
  const next = ACHIEVEMENTS.filter((a) => !s.achievements[a.id])
    .map((a) => ({ a, p: a.progress?.(ctx) ?? 0 }))
    .sort((x, y) => y.p - x.p);
  const shownAchievements = [...unlocked.slice(0, 2).map((a) => ({ a, p: 1 })), ...next].slice(0, 4);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <h1 style={{ marginTop: 4 }}>
            {greeting()}{prefs.displayName ? `, ${prefs.displayName}` : ''}
          </h1>
          <p>{goalMet ? 'Daily goal reached. Anything more today is a bonus.' : streak > 0 ? `You’re on a ${streak}-day streak. Keep it going?` : 'Pick up where you left off, or try something new.'}</p>
        </div>
        {continueTo && (
          <Link to={continueTo.path} className="btn btn-primary btn-lg">
            Continue: {continueTo.title} <ArrowRight size={16} />
          </Link>
        )}
      </header>

      <div className="grid-12">
        {/* Today */}
        <section className="panel col-4" aria-labelledby="today-h">
          <div className="panel-header">
            <h2 id="today-h">Today’s goal</h2>
            <Link to="/settings#goals" className="link">Adjust</Link>
          </div>
          <div className="row" style={{ gap: 'var(--sp-5)' }}>
            <GoalRing value={todayMin} goal={prefs.dailyGoalMinutes} />
            <div className="stack" style={{ gap: 4 }}>
              <div style={{ fontWeight: 600 }}>{goalMet ? 'Goal complete' : `${Math.max(0, Math.ceil(prefs.dailyGoalMinutes - todayMin))} min to go`}</div>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
                Counts time you’re actively using CodeVerse — idle tabs don’t count.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="panel col-8" aria-labelledby="stats-h">
          <div className="panel-header">
            <h2 id="stats-h">Your progress</h2>
            <Link to="/profile" className="link">Details</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--sp-4)' }}>
            <Stat icon={<Flame size={15} />} label={<Term id="streak">Streak</Term>} value={streak} unit={streak === 1 ? 'day' : 'days'} foot={`Best: ${best}`} />
            <Stat icon={<Clock size={15} />} label="Time learning" value={formatMinutes(all.minutes)} foot={`${formatMinutes(todayMin)} today`} />
            <Stat icon={<BookCheck size={15} />} label="Lessons done" value={all.lessons} foot={`${Object.keys(s.completedLessons).length} of ${COURSES.reduce((n, c) => n + c.lessons.length, 0)} available`} />
            <div>
              <div className="stat-label row" style={{ gap: 6 }}><Zap size={15} aria-hidden /> Level {lvl.level}</div>
              <div className="stat-value">{xp.toLocaleString()}<small><Term id="xp">XP</Term></small></div>
              <div className="progress" style={{ marginTop: 6 }} role="progressbar" aria-valuenow={Math.round(lvl.pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
                <span style={{ width: `${lvl.pct * 100}%` }} />
              </div>
              <div className="subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 4 }}>{lvl.toNext} XP to level {lvl.level + 1}</div>
            </div>
          </div>
        </section>

        {/* Weekly chart */}
        <section className="panel col-8" aria-labelledby="week-h">
          <div className="panel-header">
            <div>
              <h2 id="week-h">Active minutes, last 7 days</h2>
            </div>
            <span className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>
              {formatMinutes(Object.entries(activity).filter(([k]) => k >= dayKey(new Date(Date.now() - 6 * 864e5))).reduce((n, [, d]) => n + d.minutes, 0))} this week
            </span>
          </div>
          <WeeklyChart activity={activity} goal={prefs.dailyGoalMinutes} />
        </section>

        {/* Learning path */}
        <section className="panel col-4" aria-labelledby="path-h">
          <div className="panel-header">
            <h2 id="path-h">Your path</h2>
            <Link to="/learn" className="link">{s.placement ? 'View' : 'Placement quiz'}</Link>
          </div>
          <ol className="list">
            {pathCourses.map((c) => {
              const p = courseProgress(c, s.completedLessons);
              return (
                <li key={c.id}>
                  <Link to={`/courses/${c.id}`} className="list-item">
                    <CourseMark course={c} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="list-title" style={{ fontSize: 'var(--fs-sm)' }}>{c.title}</div>
                      <div className="progress" style={{ marginTop: 6, height: 4 }} aria-label={`${p.done} of ${p.total} lessons`}><span style={{ width: `${p.pct * 100}%` }} /></div>
                    </div>
                    <span className="subtle mono" style={{ fontSize: 'var(--fs-xs)' }}>{p.done}/{p.total}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Daily challenge */}
        <DailyChallenge solved={!!s.challenges[CHALLENGES[dailyChallengeIndex(CHALLENGES.length)].id]?.solvedAt} />

        {/* My languages */}
        <section className="panel col-6" aria-labelledby="langs-h">
          <div className="panel-header">
            <h2 id="langs-h">Your languages</h2>
            <Link to="/languages" className="link">Browse all</Link>
          </div>
          {myLangs.length ? (
            <ul className="list">
              {myLangs.slice(0, 5).map((l) => (
                <li key={l.id}><LanguageRow lang={l} /></li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <strong>No languages picked yet</strong>
              Choose a few you’re curious about and we’ll tailor suggestions.
              <Link to="/languages" className="btn btn-sm">Browse languages</Link>
            </div>
          )}
        </section>

        {/* Achievements */}
        <section className="panel col-6" aria-labelledby="ach-h">
          <div className="panel-header">
            <h2 id="ach-h">Achievements</h2>
            <Link to="/achievements" className="link">{unlocked.length} / {ACHIEVEMENTS.length} unlocked</Link>
          </div>
          <div className="stack" style={{ gap: 'var(--sp-2)' }}>
            {shownAchievements.map(({ a, p }) => (
              <AchievementBadge key={a.id} a={a} unlockedAt={s.achievements[a.id]} progress={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, unit, foot }: { icon: React.ReactNode; label: React.ReactNode; value: React.ReactNode; unit?: string; foot?: string }) {
  return (
    <div>
      <div className="stat-label row" style={{ gap: 6 }}>
        <span aria-hidden style={{ display: 'inline-flex' }}>{icon}</span> {label}
      </div>
      <div className="stat-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {foot && <div className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>{foot}</div>}
    </div>
  );
}

function DailyChallenge({ solved }: { solved: boolean }) {
  const ch = CHALLENGES[dailyChallengeIndex(CHALLENGES.length)];
  return (
    <section className="panel col-12 row" aria-labelledby="daily-h" style={{ gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div className="eyebrow" id="daily-h">Daily challenge</div>
        <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)', marginTop: 2 }}>{ch.title}</div>
        <div className="row subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 4 }}>
          <LevelBadge level={ch.difficulty} /> {ch.lang === 'javascript' ? 'JavaScript' : ch.lang === 'python' ? 'Python' : 'SQL'} · ~{ch.minutes} min · +{CHALLENGE_XP[ch.difficulty]} XP
        </div>
      </div>
      <Link to={`/challenges/${ch.id}`} className={solved ? 'btn' : 'btn btn-primary'}>{solved ? 'Solved today ✓ — try again' : 'Solve today’s challenge'} <ArrowRight size={15} /></Link>
    </section>
  );
}
