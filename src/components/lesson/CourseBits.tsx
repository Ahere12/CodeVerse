import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import type { Course } from '../../content/types';
import { courseMinutes, courseProgress, LEVEL_LABEL, lessonPath, nextLessonIn } from '../../content';
import { getLanguage } from '../../data/languages';
import { LanguageMark } from '../ui/bits';
import { useAppStore } from '../../store/useAppStore';

export function LevelBadge({ level }: { level: Course['level'] }) {
  return <span className={`badge badge-dot badge-${level}`}>{LEVEL_LABEL[level]}</span>;
}

export function CourseMark({ course, size = 40 }: { course: Course; size?: number }) {
  const lang = getLanguage(course.languageId);
  if (lang) return <LanguageMark lang={lang} size={size} />;
  return (
    <span aria-hidden style={{ display: 'grid', placeItems: 'center', width: size, height: size, borderRadius: 'var(--r-md)', background: 'var(--accent-soft)', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>
      {'{ }'}
    </span>
  );
}

export function CourseCard({ course }: { course: Course }) {
  const completed = useAppStore((s) => s.completedLessons);
  const p = courseProgress(course, completed);
  const next = nextLessonIn(course, completed);
  return (
    <article className="panel lang-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', padding: 'var(--sp-5)' }}>
      <div className="row" style={{ gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
        <CourseMark course={course} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/courses/${course.id}`} className="list-title" style={{ fontSize: 'var(--fs-md)' }}>
            {course.title}
          </Link>
          <div className="row subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 2, flexWrap: 'wrap' }}>
            <LevelBadge level={course.level} />
            <span>{course.lessons.length} lessons</span>·<span className="row" style={{ gap: 3 }}><Clock size={12} aria-hidden /> ~{courseMinutes(course)} min</span>
          </div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 'var(--fs-sm)', flex: 1 }}>{course.description}</p>
      <div>
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 'var(--fs-xs)', marginBottom: 6 }}>
          <span className="subtle">{p.complete ? <span style={{ color: 'var(--good)' }} className="row"><CheckCircle2 size={13} /> Completed</span> : `${p.done} of ${p.total} lessons`}</span>
          <span className="subtle mono">{Math.round(p.pct * 100)}%</span>
        </div>
        <div className="progress" aria-hidden><span style={{ width: `${p.pct * 100}%` }} /></div>
      </div>
      <Link to={p.complete ? `/courses/${course.id}` : lessonPath(course.id, next.id)} className={p.done && !p.complete ? 'btn btn-primary' : 'btn'}>
        {p.complete ? 'Review course' : p.done ? 'Continue' : 'Start course'} <ArrowRight size={15} />
      </Link>
    </article>
  );
}
