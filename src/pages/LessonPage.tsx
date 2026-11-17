import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, Bookmark, BookmarkCheck, CheckCircle2, Circle, Clock, NotebookPen, Target } from 'lucide-react';
import { courseProgress, findLesson, lessonPath, lessonXp } from '../content';
import { BlockView } from '../components/lesson/Blocks';
import { useAppStore } from '../store/useAppStore';
import { useToasts } from '../store/useToasts';
import { inline } from '../lib/markdown';
import { NotFound } from './NotFound';
import { LessonVideos } from '../components/lesson/VideoEmbed';
import { LESSON_VIDEOS } from '../content/videos';

export default function LessonPage() {
  const { courseId = '', lessonId = '' } = useParams();
  const ref = findLesson(courseId, lessonId);
  // Remount per lesson so quiz/exercise state resets cleanly.
  return ref ? <Lesson key={lessonId} courseId={courseId} lessonId={lessonId} /> : <NotFound />;
}

function Lesson({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const { course, lesson, index, prev, next } = findLesson(courseId, lessonId)!;
  const navigate = useNavigate();
  const completedLessons = useAppStore((s) => s.completedLessons);
  const exercises = useAppStore((s) => s.exercises);
  const bookmarked = useAppStore((s) => s.bookmarks.includes(lesson.id));
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const setLastVisited = useAppStore((s) => s.setLastVisited);
  const push = useToasts((s) => s.push);
  const [quizzesCorrect, setQuizzesCorrect] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLastVisited({ title: lesson.title, path: lessonPath(course.id, lesson.id), subtitle: course.title });
  }, [course, lesson, setLastVisited]);

  const quizIds = useMemo(() => lesson.blocks.flatMap((b) => (b.type === 'quiz' ? [b.id] : [])), [lesson]);
  const exerciseIds = useMemo(() => lesson.blocks.flatMap((b) => (b.type === 'exercise' ? [b.id] : [])), [lesson]);
  const isDone = !!completedLessons[lesson.id];
  const quizzesLeft = quizIds.filter((id) => !quizzesCorrect.has(id)).length;
  const exercisesLeft = exerciseIds.filter((id) => !exercises[id]?.passedAt && !exercises[id]?.revealed).length;
  const ready = isDone || (quizzesLeft === 0 && exercisesLeft === 0);
  const xp = lessonXp(lesson);

  const finish = () => {
    const awarded = completeLesson(lesson.id, xp);
    if (awarded) push({ title: `Lesson complete · +${xp} XP`, body: lesson.title, tone: 'good' });
    const nowComplete = courseProgress(course, { ...completedLessons, [lesson.id]: Date.now() }).complete;
    if (awarded && nowComplete) {
      push({ title: 'Course complete!', body: `Your ${course.title} certificate is ready.`, tone: 'good' });
      navigate(`/certificates/${course.id}`);
    } else if (next) {
      navigate(lessonPath(course.id, next.id));
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  return (
    <div className="lesson-layout">
      <article className="lesson-main" aria-labelledby="lesson-title">
        <nav className="row subtle" style={{ fontSize: 'var(--fs-sm)', flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }} aria-label="Breadcrumb">
          <Link to="/courses" className="link" style={{ color: 'var(--text-3)' }}>Courses</Link>/
          <Link to={`/courses/${course.id}`} className="link" style={{ color: 'var(--text-3)' }}>{course.title}</Link>/
          <span>Lesson {index + 1} of {course.lessons.length}</span>
        </nav>

        <header style={{ marginBottom: 'var(--sp-6)' }}>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <h1 id="lesson-title" style={{ flex: 1, fontSize: 'var(--fs-2xl)' }}>{lesson.title}</h1>
            <button className="icon-btn" onClick={() => toggleBookmark(lesson.id)} aria-pressed={bookmarked} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'} title={bookmarked ? 'Bookmarked' : 'Bookmark'}>
              {bookmarked ? <BookmarkCheck size={19} color="var(--accent)" /> : <Bookmark size={19} />}
            </button>
          </div>
          <div className="row muted" style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--fs-sm)', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
            <span className="row" style={{ gap: 6 }}><Target size={15} aria-hidden /> {inline(lesson.goal)}</span>
            <span className="row" style={{ gap: 6 }}><Clock size={15} aria-hidden /> ~{lesson.minutes} min</span>
            {isDone && <span className="badge badge-good"><CheckCircle2 size={12} /> Completed</span>}
          </div>
        </header>

        <div className="lesson-blocks">
          <LessonVideos videos={LESSON_VIDEOS[lesson.id] ?? []} />
          {lesson.blocks.map((b, i) => (
            <BlockView key={i} block={b} onQuizCorrect={(id) => setQuizzesCorrect((s) => new Set(s).add(id))} />
          ))}
        </div>

        <section className="panel" style={{ marginTop: 'var(--sp-8)' }} aria-labelledby="summary-h">
          <h2 id="summary-h" style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-3)' }}>Summary</h2>
          <ul className="prose prose-sm" style={{ margin: 0, paddingLeft: 'var(--sp-5)' }}>
            {lesson.summary.map((s) => <li key={s}>{inline(s)}</li>)}
          </ul>
        </section>

        <Notes lessonId={lesson.id} />

        <footer className="lesson-footer">
          {prev ? (
            <Link to={lessonPath(course.id, prev.id)} className="btn btn-ghost"><ArrowLeft size={15} /> {prev.title}</Link>
          ) : <span />}
          <div className="stack" style={{ alignItems: 'flex-end', gap: 4 }}>
            <button className="btn btn-primary btn-lg" disabled={!ready} onClick={finish}>
              {isDone ? (next ? <>Next: {next.title} <ArrowRight size={16} /></> : <>Back to course <ArrowRight size={16} /></>) : <>Complete lesson · +{xp} XP <ArrowRight size={16} /></>}
            </button>
            {!ready && (
              <span className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>
                {[quizzesLeft && `${quizzesLeft} quick check${quizzesLeft > 1 ? 's' : ''}`, exercisesLeft && `${exercisesLeft} exercise${exercisesLeft > 1 ? 's' : ''}`].filter(Boolean).join(' and ')} left
              </span>
            )}
          </div>
        </footer>
      </article>

      <aside className="lesson-aside" aria-label="Course outline">
        <div className="lesson-aside-inner">
          <Link to={`/courses/${course.id}`} className="eyebrow link" style={{ color: 'var(--text-3)', display: 'block', marginBottom: 'var(--sp-3)' }}>{course.title}</Link>
          <ol className="outline">
            {course.lessons.map((l, i) => {
              const done = !!completedLessons[l.id];
              return (
                <li key={l.id}>
                  <Link to={lessonPath(course.id, l.id)} aria-current={l.id === lesson.id ? 'page' : undefined}>
                    <span style={{ color: done ? 'var(--good)' : 'var(--text-3)', display: 'inline-flex' }}>{done ? <CheckCircle2 size={14} /> : <Circle size={14} />}</span>
                    <span>{i + 1}. {l.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          {courseProgress(course, completedLessons).complete && (
            <Link to={`/certificates/${course.id}`} className="btn btn-sm" style={{ marginTop: 'var(--sp-4)' }}><Award size={14} /> Certificate</Link>
          )}
        </div>
      </aside>
    </div>
  );
}

function Notes({ lessonId }: { lessonId: string }) {
  const saved = useAppStore((s) => s.notes[lessonId] ?? '');
  const setNote = useAppStore((s) => s.setNote);
  const [text, setText] = useState(saved);
  const [open, setOpen] = useState(!!saved);

  useEffect(() => {
    const id = window.setTimeout(() => { if (text !== saved) setNote(lessonId, text); }, 500);
    return () => window.clearTimeout(id);
  }, [text, saved, lessonId, setNote]);

  return (
    <section className="panel" style={{ marginTop: 'var(--sp-4)' }}>
      <button className="row" onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', width: '100%' }}>
        <NotebookPen size={16} aria-hidden />
        <span style={{ fontWeight: 600 }}>My notes</span>
        <span className="subtle" style={{ fontSize: 'var(--fs-xs)', marginLeft: 'auto' }}>{saved ? 'Saved' : 'Private to this browser'}</span>
      </button>
      {open && (
        <textarea
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write what you learned in your own words — it helps you remember."
          aria-label="Lesson notes"
          rows={5}
          style={{ width: '100%', height: 'auto', padding: 'var(--sp-3)', marginTop: 'var(--sp-3)', resize: 'vertical', lineHeight: 1.6 }}
        />
      )}
    </section>
  );
}
