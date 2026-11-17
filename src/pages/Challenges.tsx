import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, Circle, Clock, Timer } from 'lucide-react';
import { CATEGORY_LABEL, CHALLENGE_XP, CHALLENGES, type ChallengeCategory, type ChallengeLang } from '../content/challenges';
import type { Level } from '../content/types';
import { dailyChallengeIndex } from '../runtime/gradeChallenge';
import { useAppStore } from '../store/useAppStore';
import { LevelBadge } from '../components/lesson/CourseBits';
import { LanguageMark } from '../components/ui/bits';
import { getLanguage } from '../data/languages';
import { inline } from '../lib/markdown';

const LANG_NAME: Record<ChallengeLang, string> = { javascript: 'JavaScript', python: 'Python', sql: 'SQL' };
const fmtMs = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

export function Challenges() {
  const results = useAppStore((s) => s.challenges);
  const [level, setLevel] = useState<'all' | Level>('all');
  const [lang, setLang] = useState<'all' | ChallengeLang>('all');
  const [cat, setCat] = useState<'all' | ChallengeCategory>('all');
  const [status, setStatus] = useState<'all' | 'todo' | 'solved'>('all');

  const daily = CHALLENGES[dailyChallengeIndex(CHALLENGES.length)];
  const solvedCount = CHALLENGES.filter((c) => results[c.id]?.solvedAt).length;

  const list = useMemo(
    () =>
      CHALLENGES.filter(
        (c) =>
          (level === 'all' || c.difficulty === level) &&
          (lang === 'all' || c.lang === lang) &&
          (cat === 'all' || c.category === cat) &&
          (status === 'all' || (status === 'solved' ? !!results[c.id]?.solvedAt : !results[c.id]?.solvedAt)),
      ),
    [level, lang, cat, status, results],
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Challenges</h1>
          <p>{CHALLENGES.length} problems with real test cases, run in your browser. {solvedCount} solved.</p>
        </div>
      </header>

      <Link to={`/challenges/${daily.id}`} className="panel daily-card" style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center', marginBottom: 'var(--sp-6)', flexWrap: 'wrap' }}>
        <CalendarDays size={26} color="var(--accent)" aria-hidden />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="eyebrow">Today’s challenge</div>
          <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)', marginTop: 2 }}>{daily.title}</div>
          <div className="row subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 4, flexWrap: 'wrap' }}>
            <LevelBadge level={daily.difficulty} /> <span>{LANG_NAME[daily.lang]}</span> · <span>+{CHALLENGE_XP[daily.difficulty]} XP</span>
            {results[daily.id]?.solvedAt && <span className="badge badge-good"><CheckCircle2 size={12} /> Solved</span>}
          </div>
        </div>
        <span className="btn btn-primary">{results[daily.id]?.solvedAt ? 'Solve again' : 'Start'} <ArrowRight size={15} /></span>
      </Link>

      <div className="row" style={{ flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
        <Filter label="Level" value={level} onChange={setLevel} options={[['all', 'All levels'], ['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']]} />
        <Filter label="Language" value={lang} onChange={setLang} options={[['all', 'All languages'], ['javascript', 'JavaScript'], ['python', 'Python'], ['sql', 'SQL']]} />
        <Filter label="Type" value={cat} onChange={setCat} options={[['all', 'All types'], ...(Object.entries(CATEGORY_LABEL) as [ChallengeCategory, string][])]} />
        <Filter label="Status" value={status} onChange={setStatus} options={[['all', 'Any status'], ['todo', 'Not solved'], ['solved', 'Solved']]} />
      </div>

      {list.length ? (
        <ul className="list panel" style={{ padding: '0 var(--sp-5)' }}>
          {list.map((c) => {
            const r = results[c.id];
            return (
              <li key={c.id}>
                <Link to={`/challenges/${c.id}`} className="list-item">
                  <span style={{ color: r?.solvedAt ? 'var(--good)' : 'var(--text-3)', display: 'inline-flex' }} aria-label={r?.solvedAt ? 'Solved' : 'Not solved'}>
                    {r?.solvedAt ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </span>
                  <LanguageMark lang={getLanguage(c.lang)!} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="list-title">{c.title}</div>
                    <div className="subtle" style={{ fontSize: 'var(--fs-xs)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inline(c.description.split('\n')[0])}</div>
                  </div>
                  <span className="badge hide-sm">{CATEGORY_LABEL[c.category]}</span>
                  <LevelBadge level={c.difficulty} />
                  {r?.bestMs !== undefined ? (
                    <span className="subtle mono hide-sm" style={{ fontSize: 'var(--fs-xs)', width: 64, textAlign: 'right' }} title="Best timed solve"><Timer size={12} /> {fmtMs(r.bestMs)}</span>
                  ) : (
                    <span className="subtle hide-sm" style={{ fontSize: 'var(--fs-xs)', width: 64, textAlign: 'right' }}><Clock size={12} /> ~{c.minutes}m</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty"><strong>No challenges match these filters</strong>Try a different level or language.</div>
      )}
    </div>
  );
}

function Filter<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <select className="select" aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
