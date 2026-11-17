import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { ROADMAPS, getRoadmap, type Milestone, type Roadmap } from '../content/roadmaps';
import { courseProgress, getCourse, lessonPath, nextLessonIn } from '../content';
import { getChallenge } from '../content/challenges';
import { getGuidedProject } from '../content/guidedProjects';
import { getLanguage } from '../data/languages';
import { LanguageMark } from '../components/ui/bits';
import { useAppStore } from '../store/useAppStore';
import { NotFound } from './NotFound';

type State = Pick<ReturnType<typeof useAppStore.getState>, 'completedLessons' | 'roadmapChecks' | 'challenges' | 'guided'>;

/** Done when every linked course is complete, or the learner ticked it off. */
function milestoneDone(r: Roadmap, m: Milestone, s: State): boolean {
  if (s.roadmapChecks[`${r.id}/${m.id}`]) return true;
  if (m.courses?.length) return m.courses.every((id) => { const c = getCourse(id); return !!c && courseProgress(c, s.completedLessons).complete; });
  return false;
}
const autoTracked = (m: Milestone) => !!m.courses?.length;

function useRoadmapState(): State {
  const completedLessons = useAppStore((s) => s.completedLessons);
  const roadmapChecks = useAppStore((s) => s.roadmapChecks);
  const challenges = useAppStore((s) => s.challenges);
  const guided = useAppStore((s) => s.guided);
  return { completedLessons, roadmapChecks, challenges, guided };
}

export function Roadmaps() {
  const st = useRoadmapState();
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Roadmaps</h1>
          <p>Step-by-step paths to a developer career. Milestones link to courses, challenges and projects here, plus trusted free resources.</p>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}>
        {ROADMAPS.map((r) => {
          const done = r.milestones.filter((m) => milestoneDone(r, m, st)).length;
          return (
            <Link key={r.id} to={`/roadmaps/${r.id}`} className="panel lang-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>{r.title}</div>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)', flex: 1 }}>{r.summary}</p>
              <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                {r.languages.slice(0, 6).map((id) => { const l = getLanguage(id); return l ? <LanguageMark key={id} lang={l} size={24} /> : null; })}
              </div>
              <div>
                <div className="row subtle" style={{ justifyContent: 'space-between', fontSize: 'var(--fs-xs)', marginBottom: 6 }}>
                  <span>{done} of {r.milestones.length} milestones</span>
                  <span className="mono">{Math.round((done / r.milestones.length) * 100)}%</span>
                </div>
                <div className="progress" aria-hidden><span style={{ width: `${(done / r.milestones.length) * 100}%` }} /></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function RoadmapDetail() {
  const { id = '' } = useParams();
  const r = getRoadmap(id);
  const st = useRoadmapState();
  const toggle = useAppStore((s) => s.toggleRoadmapCheck);
  const [open, setOpen] = useState<string | null>(null);
  if (!r) return <NotFound />;

  const doneCount = r.milestones.filter((m) => milestoneDone(r, m, st)).length;
  const next = r.milestones.find((m) => !milestoneDone(r, m, st));
  const expanded = open ?? next?.id ?? null;

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <Link to="/roadmaps" className="btn btn-ghost btn-sm" style={{ marginLeft: -12, marginBottom: 'var(--sp-4)' }}><ArrowLeft size={14} /> All roadmaps</Link>
      <header className="page-header">
        <div>
          <div className="eyebrow">Roadmap</div>
          <h1>{r.title}</h1>
          <p>{r.summary}</p>
          <p className="subtle" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-2)' }}><strong>Before you start:</strong> {r.prerequisites}</p>
        </div>
        <div style={{ minWidth: 200 }}>
          <div className="subtle" style={{ fontSize: 'var(--fs-xs)', marginBottom: 6 }}>{doneCount} of {r.milestones.length} milestones</div>
          <div className="progress" style={{ height: 8 }} role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={r.milestones.length} aria-label="Roadmap progress">
            <span style={{ width: `${(doneCount / r.milestones.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {next && (
        <div className="panel row" style={{ marginBottom: 'var(--sp-6)', gap: 'var(--sp-3)', flexWrap: 'wrap', borderColor: 'var(--accent)' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="eyebrow">Next step</div>
            <div style={{ fontWeight: 600 }}>{next.title}</div>
          </div>
          <NextAction m={next} st={st} />
        </div>
      )}

      <ol className="path">
        {r.milestones.map((m, i) => {
          const done = milestoneDone(r, m, st);
          const isOpen = expanded === m.id;
          return (
            <li key={m.id} data-state={done ? 'done' : m.id === next?.id ? 'current' : 'todo'} style={{ alignItems: 'flex-start' }}>
              <span className="path-dot" aria-hidden style={{ marginTop: 14 }}>{done ? <CheckCircle2 size={18} /> : <Circle size={18} />}</span>
              <section className="panel" style={{ padding: 0 }}>
                <button className="milestone-head" onClick={() => setOpen(isOpen ? '' : m.id)} aria-expanded={isOpen}>
                  <span className="subtle mono" style={{ fontSize: 'var(--fs-xs)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontWeight: 600, flex: 1 }}>{m.title}</span>
                  {done && <span className="badge badge-good">Done</span>}
                </button>
                {isOpen && (
                  <div className="milestone-body">
                    <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{m.why}</p>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{m.skills.map((s) => <span key={s} className="badge">{s}</span>)}</div>
                    <MilestoneLinks m={m} st={st} />
                    {autoTracked(m) ? (
                      <p className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>Ticks itself off when you finish the linked course{m.courses!.length > 1 ? 's' : ''}.</p>
                    ) : (
                      <label className="row" style={{ fontSize: 'var(--fs-sm)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!st.roadmapChecks[`${r.id}/${m.id}`]} onChange={() => toggle(`${r.id}/${m.id}`)} />
                        I’ve learned this
                      </label>
                    )}
                  </div>
                )}
              </section>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function NextAction({ m, st }: { m: Milestone; st: State }) {
  const course = m.courses?.map(getCourse).find((c) => c && !courseProgress(c, st.completedLessons).complete);
  if (course) return <Link to={lessonPath(course.id, nextLessonIn(course, st.completedLessons).id)} className="btn btn-primary">Continue {course.title} <ArrowRight size={15} /></Link>;
  if (m.projects?.[0]) return <Link to={`/projects/${m.projects[0]}`} className="btn btn-primary">Start project <ArrowRight size={15} /></Link>;
  if (m.challenges?.[0]) return <Link to={`/challenges/${m.challenges[0]}`} className="btn btn-primary">Try a challenge <ArrowRight size={15} /></Link>;
  if (m.external?.[0]) return <a href={m.external[0].url} target="_blank" rel="noreferrer noopener" className="btn btn-primary">Open resource <ExternalLink size={14} /></a>;
  return null;
}

function MilestoneLinks({ m, st }: { m: Milestone; st: State }) {
  const items: { key: string; node: React.ReactNode }[] = [];
  m.courses?.forEach((id) => {
    const c = getCourse(id);
    if (c) items.push({ key: id, node: <Link to={`/courses/${id}`} className="link">Course: {c.title}{courseProgress(c, st.completedLessons).complete ? ' ✓' : ''}</Link> });
  });
  m.projects?.forEach((id) => {
    const p = getGuidedProject(id);
    if (p) items.push({ key: id, node: <Link to={`/projects/${id}`} className="link">Project: {p.title}{st.guided[id]?.completedAt ? ' ✓' : ''}</Link> });
  });
  m.challenges?.forEach((id) => {
    const c = getChallenge(id);
    if (c) items.push({ key: id, node: <Link to={`/challenges/${id}`} className="link">Challenge: {c.title}{st.challenges[id]?.solvedAt ? ' ✓' : ''}</Link> });
  });
  m.languages?.forEach((id) => {
    const l = getLanguage(id);
    if (l) items.push({ key: `l-${id}`, node: <Link to={`/languages/${id}`} className="link">Language: {l.name}</Link> });
  });
  m.external?.forEach((e) => items.push({ key: e.url, node: <a href={e.url} target="_blank" rel="noreferrer noopener" className="link row" style={{ display: 'inline-flex', gap: 4 }}>{e.label} <ExternalLink size={12} /></a> }));
  if (!items.length) return <p className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>CodeVerse doesn’t have material for this milestone yet — use the skills above as a checklist.</p>;
  return <ul className="milestone-links">{items.map((i) => <li key={i.key}>{i.node}</li>)}</ul>;
}
