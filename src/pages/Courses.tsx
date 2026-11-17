import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, Bookmark, CheckCircle2, Circle, Clock } from 'lucide-react';
import { COURSES, courseMinutes, courseProgress, getCourse, lessonPath, nextLessonIn, LEVEL_LABEL } from '../content';
import type { Level } from '../content/types';
import { CourseCard, CourseMark, LevelBadge } from '../components/lesson/CourseBits';
import { useAppStore } from '../store/useAppStore';
import { getLanguage } from '../data/languages';
import { inline } from '../lib/markdown';
import { NotFound } from './NotFound';

type LevelFilter = 'all' | Level;

export function Courses() {
  const [level, setLevel] = useState<LevelFilter>('all');
  const list = useMemo(() => COURSES.filter((c) => level === 'all' || c.level === level), [level]);
  const totalLessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Courses</h1>
          <p>{COURSES.length} courses · {totalLessons} interactive lessons. Every exercise is checked automatically in your browser.</p>
        </div>
        <Link to="/learn" className="btn">Not sure where to start?</Link>
      </header>

      <div className="segmented" role="group" aria-label="Level" style={{ marginBottom: 'var(--sp-5)' }}>
        {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((l) => (
          <button key={l} aria-pressed={level === l} onClick={() => setLevel(l)}>
            {l === 'all' ? 'All levels' : LEVEL_LABEL[l]}
          </button>
        ))}
      </div>

      {list.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}>
          {list.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      ) : (
        <div className="empty">
          <strong>No {level} courses yet</strong>
          Advanced courses (architecture, performance, testing) are being written. Meanwhile, finish the intermediate track and try the challenges when they arrive.
        </div>
      )}

      <p className="subtle" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-8)' }}>
        We’re adding courses steadily rather than padding the catalogue. Languages without a course yet still have an overview on the <Link to="/languages" className="link">Languages</Link> page.
      </p>
    </div>
  );
}

export function CourseDetail() {
  const { courseId = '' } = useParams();
  const course = getCourse(courseId);
  const completed = useAppStore((s) => s.completedLessons);
  const bookmarks = useAppStore((s) => s.bookmarks);
  if (!course) return <NotFound />;

  const p = courseProgress(course, completed);
  const next = nextLessonIn(course, completed);
  const lang = getLanguage(course.languageId);
  const prereqs = course.prerequisites.map(getCourse).filter(Boolean);

  return (
    <div className="page" style={{ maxWidth: 960 }}>
      <Link to="/courses" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--sp-4)', marginLeft: -12 }}>
        <ArrowLeft size={14} /> All courses
      </Link>

      <header className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="row" style={{ gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
          <CourseMark course={course} size={56} />
          <div>
            <div className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
              <LevelBadge level={course.level} />
              {lang && <Link to={`/languages/${lang.id}`} className="badge">{lang.name}</Link>}
              <span className="badge"><Clock size={12} aria-hidden /> ~{courseMinutes(course)} min</span>
            </div>
            <h1 style={{ marginTop: 'var(--sp-2)' }}>{course.title}</h1>
            <p style={{ maxWidth: 620 }}>{course.description}</p>
          </div>
        </div>
        <div className="stack" style={{ alignItems: 'flex-end', gap: 'var(--sp-2)' }}>
          <Link to={lessonPath(course.id, next.id)} className="btn btn-primary btn-lg">
            {p.complete ? 'Review' : p.done ? 'Continue' : 'Start'}: {next.title} <ArrowRight size={16} />
          </Link>
          {p.complete && (
            <Link to={`/certificates/${course.id}`} className="btn"><Award size={15} /> View certificate</Link>
          )}
        </div>
      </header>

      <div className="grid-12">
        <section className="panel col-8 panel-flush" aria-labelledby="lessons-h">
          <div className="panel-header" style={{ padding: 'var(--sp-5) var(--sp-5) 0' }}>
            <h2 id="lessons-h">Lessons</h2>
            <span className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>{p.done} / {p.total} complete</span>
          </div>
          <ol className="list" style={{ padding: '0 var(--sp-5) var(--sp-2)' }}>
            {course.lessons.map((l, i) => {
              const done = !!completed[l.id];
              return (
                <li key={l.id}>
                  <Link to={lessonPath(course.id, l.id)} className="list-item" style={{ alignItems: 'flex-start' }}>
                    <span style={{ marginTop: 2, color: done ? 'var(--good)' : 'var(--text-3)' }} aria-label={done ? 'Completed' : 'Not started'}>
                      {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="list-title"><span className="subtle mono" style={{ marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>{l.title}</div>
                      <div className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>{l.goal}</div>
                    </div>
                    {bookmarks.includes(l.id) && <Bookmark size={14} className="subtle" aria-label="Bookmarked" />}
                    <span className="subtle" style={{ fontSize: 'var(--fs-xs)', whiteSpace: 'nowrap' }}>{l.minutes} min</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="col-4 stack">
          <section className="panel">
            <h2 className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>You’ll be able to</h2>
            <ul className="prose prose-sm" style={{ paddingLeft: 'var(--sp-4)', margin: 0 }}>
              {course.outcomes.map((o) => <li key={o}>{inline(o)}</li>)}
            </ul>
          </section>
          <section className="panel">
            <h2 className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>Progress</h2>
            <div className="progress" style={{ height: 8 }} role="progressbar" aria-valuenow={p.done} aria-valuemin={0} aria-valuemax={p.total} aria-label="Course progress">
              <span style={{ width: `${p.pct * 100}%` }} />
            </div>
            <p className="subtle" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-2)' }}>
              {p.complete ? 'Course complete — your certificate is ready.' : 'Finish every lesson to earn a certificate.'}
            </p>
          </section>
          {prereqs.length > 0 && (
            <section className="panel">
              <h2 className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>Recommended first</h2>
              {prereqs.map((c) => (
                <Link key={c!.id} to={`/courses/${c!.id}`} className="row link" style={{ fontSize: 'var(--fs-sm)' }}>
                  {courseProgress(c!, completed).complete && <CheckCircle2 size={14} />} {c!.title}
                </Link>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
