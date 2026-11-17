import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Code2, Eye, PartyPopper } from 'lucide-react';
import { GUIDED_PROJECTS, getGuidedProject, type GuidedProject } from '../content/guidedProjects';
import { getCourse, LEVEL_LABEL } from '../content';
import { LevelBadge } from '../components/lesson/CourseBits';
import { Markdown, inline } from '../lib/markdown';
import { newId } from '../lib/projects';
import { useAppStore, type Project } from '../store/useAppStore';
import { useToasts } from '../store/useToasts';
import { NotFound } from './NotFound';

const PROJECT_XP: Record<GuidedProject['difficulty'], number> = { beginner: 50, intermediate: 80, advanced: 120 };

export function GuidedProjects() {
  const guided = useAppStore((s) => s.guided);
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Build real things step by step. Each project opens in the playground with starter files, and your progress is saved.</p>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}>
        {GUIDED_PROJECTS.map((p) => {
          const g = guided[p.id];
          const done = g?.steps.length ?? 0;
          return (
            <Link key={p.id} to={`/projects/${p.id}`} className="panel lang-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>{p.title}</span>
                {g?.completedAt ? <span className="badge badge-good"><CheckCircle2 size={12} /> Built</span> : <LevelBadge level={p.difficulty} />}
              </div>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)', flex: 1 }}>{p.summary}</p>
              <div className="row subtle" style={{ fontSize: 'var(--fs-xs)', flexWrap: 'wrap' }}>
                {p.technologies.map((t) => <span key={t} className="badge">{t}</span>)}
                <span className="row" style={{ gap: 3 }}><Clock size={12} /> ~{p.minutes} min</span>
              </div>
              {g && !g.completedAt && (
                <div className="progress" aria-label={`${done} of ${p.steps.length} steps`}><span style={{ width: `${(done / p.steps.length) * 100}%` }} /></div>
              )}
            </Link>
          );
        })}
      </div>
      <p className="subtle" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-8)' }}>
        Projects that need a server (REST API, chat app, database-backed app) will be added once CodeVerse can run backend code safely. For now, practise SQL in the <Link to="/playground" className="link">playground</Link> and <Link to="/challenges" className="link">challenges</Link>.
      </p>
    </div>
  );
}

export function GuidedProjectDetail() {
  const { id = '' } = useParams();
  const p = getGuidedProject(id);
  const navigate = useNavigate();
  const g = useAppStore((s) => (p ? s.guided[p.id] : undefined));
  const projects = useAppStore((s) => s.projects);
  const setGuided = useAppStore((s) => s.setGuided);
  const saveProject = useAppStore((s) => s.saveProject);
  const awardXp = useAppStore((s) => s.awardXp);
  const push = useToasts((s) => s.push);
  if (!p) return <NotFound />;

  const steps = g?.steps ?? [];
  const course = p.recommended ? getCourse(p.recommended) : undefined;

  const openCopy = (files: GuidedProject['starter'], name: string, link: boolean) => {
    const existing = link && g?.playgroundId ? projects[g.playgroundId] : undefined;
    if (existing) return navigate(`/playground?open=${existing.id}`);
    const now = Date.now();
    const proj: Project = { id: newId(), name, kind: 'web', files: files.map((x) => ({ ...x })), createdAt: now, updatedAt: now };
    saveProject(proj);
    if (link) setGuided(p.id, { playgroundId: proj.id });
    navigate(`/playground?open=${proj.id}`);
  };

  const toggleStep = (i: number) => {
    const next = steps.includes(i) ? steps.filter((x) => x !== i) : [...steps, i].sort((a, b) => a - b);
    const finished = next.length === p.steps.length && !g?.completedAt;
    setGuided(p.id, { steps: next, ...(finished ? { completedAt: Date.now() } : {}) });
    if (finished) {
      awardXp(PROJECT_XP[p.difficulty]);
      push({ title: `Project complete! +${PROJECT_XP[p.difficulty]} XP`, body: p.title, tone: 'good' });
    }
  };

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <Link to="/projects" className="btn btn-ghost btn-sm" style={{ marginLeft: -12, marginBottom: 'var(--sp-4)' }}><ArrowLeft size={14} /> All projects</Link>
      <header className="page-header">
        <div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <LevelBadge level={p.difficulty} />
            {p.technologies.map((t) => <span key={t} className="badge">{t}</span>)}
            <span className="badge"><Clock size={12} /> ~{p.minutes} min</span>
          </div>
          <h1 style={{ marginTop: 'var(--sp-2)' }}>{p.title}</h1>
          <p>{p.summary}</p>
        </div>
        <div className="stack" style={{ alignItems: 'flex-end', gap: 'var(--sp-2)' }}>
          <button className="btn btn-primary btn-lg" onClick={() => openCopy(p.starter, p.title, true)}>
            <Code2 size={16} /> {g?.playgroundId && projects[g.playgroundId] ? 'Continue in playground' : 'Start building'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => openCopy(p.solution, `${p.title} (finished example)`, false)} title="Opens a separate copy so your work isn’t changed">
            <Eye size={14} /> See the finished version
          </button>
        </div>
      </header>

      {g?.completedAt && (
        <div className="panel row" style={{ marginBottom: 'var(--sp-5)', borderColor: 'var(--good)' }}>
          <PartyPopper size={20} color="var(--good)" />
          <span><strong>You built it!</strong> Try adding your own twist — that’s how real skills stick.</span>
        </div>
      )}

      <div className="grid-12">
        <section className="col-8 stack" style={{ gap: 'var(--sp-3)' }}>
          {p.steps.map((s, i) => {
            const done = steps.includes(i);
            return (
              <article key={i} className="panel" style={{ borderColor: done ? 'color-mix(in srgb, var(--good) 45%, var(--border))' : undefined }}>
                <div className="row" style={{ marginBottom: 'var(--sp-2)' }}>
                  <span className="subtle mono" style={{ fontSize: 'var(--fs-xs)' }}>Step {i + 1}</span>
                  <h2 style={{ fontSize: 'var(--fs-md)', flex: 1 }}>{s.title}</h2>
                </div>
                <div className="prose prose-sm"><Markdown md={s.md} /></div>
                <label className="row" style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--fs-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={done} onChange={() => toggleStep(i)} />
                  <span>{inline(s.check)}</span>
                </label>
              </article>
            );
          })}
        </section>
        <aside className="col-4 stack">
          <section className="panel">
            <h2 className="eyebrow" style={{ fontSize: 'var(--fs-xs)', marginBottom: 'var(--sp-2)' }}>You’ll learn to</h2>
            <ul className="prose prose-sm" style={{ paddingLeft: 'var(--sp-4)', margin: 0 }}>{p.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
          </section>
          <section className="panel">
            <h2 className="eyebrow" style={{ fontSize: 'var(--fs-xs)', marginBottom: 'var(--sp-2)' }}>Progress</h2>
            <div className="progress" style={{ height: 8 }}><span style={{ width: `${(steps.length / p.steps.length) * 100}%` }} /></div>
            <p className="subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 6 }}>{steps.length} of {p.steps.length} steps · {LEVEL_LABEL[p.difficulty]} · +{PROJECT_XP[p.difficulty]} XP when finished</p>
          </section>
          {course && (
            <section className="panel">
              <h2 className="eyebrow" style={{ fontSize: 'var(--fs-xs)', marginBottom: 'var(--sp-2)' }}>Helpful first</h2>
              <Link to={`/courses/${course.id}`} className="link">{course.title}</Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
