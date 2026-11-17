import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { courseProgress, getCourse, lessonPath, nextLessonIn } from '../content';
import { useAppStore } from '../store/useAppStore';
import { NotFound } from './NotFound';

/** Short, stable reference code for a certificate. Not a security feature — just an ID. */
function certId(courseId: string, name: string, ts: number) {
  let h = 2166136261;
  for (const ch of `${courseId}|${name}|${ts}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `CV-${(h >>> 0).toString(36).toUpperCase().padStart(7, '0')}`;
}

export function Certificate() {
  const { courseId = '' } = useParams();
  const course = getCourse(courseId);
  const completed = useAppStore((s) => s.completedLessons);
  const name = useAppStore((s) => s.prefs.displayName);
  const update = useAppStore((s) => s.updatePrefs);
  if (!course) return <NotFound />;

  const p = courseProgress(course, completed);
  if (!p.complete) {
    const next = nextLessonIn(course, completed);
    return (
      <div className="page" style={{ maxWidth: 600 }}>
        <h1>Certificate not earned yet</h1>
        <p className="muted" style={{ marginTop: 'var(--sp-2)' }}>
          Complete all {p.total} lessons of {course.title} to unlock it. You’ve finished {p.done}.
        </p>
        <Link to={lessonPath(course.id, next.id)} className="btn btn-primary" style={{ marginTop: 'var(--sp-5)' }}>Continue: {next.title}</Link>
      </div>
    );
  }

  const finishedAt = Math.max(...course.lessons.map((l) => completed[l.id]));
  const displayName = name.trim() || 'CodeVerse Learner';

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <div className="row no-print" style={{ marginBottom: 'var(--sp-4)', flexWrap: 'wrap' }}>
        <Link to={`/courses/${course.id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: -12 }}><ArrowLeft size={14} /> {course.title}</Link>
        <span className="spacer" />
        <label className="row" style={{ fontSize: 'var(--fs-sm)' }}>
          <span className="muted">Name on certificate</span>
          <input className="input" value={name} onChange={(e) => update({ displayName: e.target.value })} placeholder="Your name" maxLength={40} style={{ width: 180 }} />
        </label>
        <button className="btn btn-primary" onClick={() => window.print()}><Printer size={15} /> Print / save as PDF</button>
      </div>

      <div className="certificate" role="document" aria-label={`Certificate of completion for ${course.title}`}>
        <div className="cert-small">Certificate of completion</div>
        <h1 style={{ marginTop: 18 }}>{course.title}</h1>
        <p style={{ marginTop: 24, color: '#5b5547' }}>This certifies that</p>
        <div className="cert-name">{displayName}</div>
        <p style={{ color: '#5b5547', maxWidth: 520, margin: '0 auto' }}>
          completed all {course.lessons.length} lessons and exercises of the {course.level} course, demonstrating the ability to {course.outcomes[0].charAt(0).toLowerCase() + course.outcomes[0].slice(1)}.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 44, gap: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'left' }}>
            <div className="cert-small">Completed</div>
            <div>{new Date(finishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, alignSelf: 'center' }}>{'</>'} CODEVERSE</div>
          <div style={{ textAlign: 'right' }}>
            <div className="cert-small">Reference</div>
            <div style={{ fontFamily: 'var(--font-mono)' }}>{certId(course.id, displayName, finishedAt)}</div>
          </div>
        </div>
      </div>
      <p className="subtle no-print" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-4)' }}>
        Issued on this device from your saved progress. It records your learning; it isn’t an accredited qualification and can’t be verified online yet.
      </p>
    </div>
  );
}
