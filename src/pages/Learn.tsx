import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, CheckCircle2, Circle, ClipboardCheck, PlayCircle } from 'lucide-react';
import { ALL_LESSONS, COURSES, courseProgress, getCourse, lessonPath, nextLessonIn } from '../content';
import { NOT_SURE, PLACEMENT, placementRecommendation } from '../content/placement';
import { useAppStore } from '../store/useAppStore';
import { CourseMark, LevelBadge } from '../components/lesson/CourseBits';
import { CodeBlock } from '../components/code/CodeBlock';
import { inline } from '../lib/markdown';

export function Learn() {
  const placement = useAppStore((s) => s.placement);
  const completed = useAppStore((s) => s.completedLessons);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const [quizOpen, setQuizOpen] = useState(false);

  if (quizOpen) return <PlacementQuiz onDone={() => setQuizOpen(false)} />;

  const recommended = placement ? getCourse(placement.courseId) : undefined;
  const bookmarked = ALL_LESSONS.filter(({ lesson }) => bookmarks.includes(lesson.id));
  const firstIncomplete = COURSES.find((c) => !courseProgress(c, completed).complete);

  return (
    <div className="page" style={{ maxWidth: 960 }}>
      <header className="page-header">
        <div>
          <h1>Learn</h1>
          <p>One clear path from zero to building real things. Go at your own pace.</p>
        </div>
      </header>

      <section className="panel" style={{ backgroundImage: 'var(--glow)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        {recommended ? (
          <div className="row" style={{ gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
            <ClipboardCheck size={28} color="var(--accent)" aria-hidden />
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="eyebrow">Your placement result · {placement!.score}/{placement!.total}</div>
              <h2 style={{ marginTop: 4 }}>Start with {recommended.title}</h2>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 4 }}>{placementRecommendation(placement!.score).reason}</p>
            </div>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" onClick={() => setQuizOpen(true)}>Retake quiz</button>
              <Link to={lessonPath(recommended.id, nextLessonIn(recommended, completed).id)} className="btn btn-primary">Go <ArrowRight size={15} /></Link>
            </div>
          </div>
        ) : (
          <div className="row" style={{ gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h2>Where should you start?</h2>
              <p className="muted" style={{ marginTop: 4 }}>Take a 2-minute, 8-question quiz and we’ll suggest a starting point. Or begin at the very beginning — no experience needed.</p>
            </div>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => setQuizOpen(true)}><ClipboardCheck size={16} /> Take placement quiz</button>
              <Link to={lessonPath('start-here', 'sh-what-is-programming')} className="btn btn-lg"><PlayCircle size={16} /> Start from zero</Link>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="path-h" style={{ marginBottom: 'var(--sp-8)' }}>
        <h2 id="path-h" style={{ marginBottom: 'var(--sp-4)' }}>The path</h2>
        <ol className="path">
          {COURSES.map((c) => {
            const p = courseProgress(c, completed);
            const current = c.id === firstIncomplete?.id;
            return (
              <li key={c.id} data-state={p.complete ? 'done' : current ? 'current' : 'todo'}>
                <span className="path-dot" aria-hidden>{p.complete ? <CheckCircle2 size={18} /> : <Circle size={18} />}</span>
                <Link to={`/courses/${c.id}`} className="panel path-card">
                  <CourseMark course={c} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ flexWrap: 'wrap' }}>
                      <span className="list-title">{c.title}</span>
                      <LevelBadge level={c.level} />
                      {current && <span className="badge badge-good">Up next</span>}
                    </div>
                    <div className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>{p.done}/{p.total} lessons · {c.outcomes[0]}</div>
                  </div>
                  <ArrowRight size={16} className="subtle" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="subtle" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-3)' }}>
          Next on the path once written: the DOM and events (making pages interactive), then a first full project.
        </p>
      </section>

      <section aria-labelledby="bm-h">
        <h2 id="bm-h" style={{ marginBottom: 'var(--sp-3)' }}>Bookmarked lessons</h2>
        {bookmarked.length ? (
          <ul className="list panel" style={{ padding: '0 var(--sp-5)' }}>
            {bookmarked.map(({ course, lesson }) => (
              <li key={lesson.id}>
                <Link to={lessonPath(course.id, lesson.id)} className="list-item">
                  <Bookmark size={15} className="subtle" aria-hidden />
                  <span className="list-title" style={{ flex: 1 }}>{lesson.title}</span>
                  <span className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>{course.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <strong>No bookmarks yet</strong>
            Tap the bookmark icon on any lesson to save it here for quick review.
          </div>
        )}
      </section>
    </div>
  );
}

function PlacementQuiz({ onDone }: { onDone: () => void }) {
  const setPlacement = useAppStore((s) => s.setPlacement);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const q = PLACEMENT[i];
  const opts = [...q.options, NOT_SURE];

  const choose = (idx: number) => {
    const next = [...answers, idx];
    if (i + 1 < PLACEMENT.length) {
      setAnswers(next);
      setI(i + 1);
    } else {
      const score = next.filter((a, k) => a === PLACEMENT[k].answer).length;
      const { courseId } = placementRecommendation(score);
      setPlacement({ score, total: PLACEMENT.length, courseId });
      onDone();
    }
  };

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <div className="row" style={{ marginBottom: 'var(--sp-4)' }}>
        <button className="btn btn-ghost btn-sm" onClick={onDone} style={{ marginLeft: -12 }}>Cancel</button>
        <span className="spacer" />
        <span className="subtle mono" style={{ fontSize: 'var(--fs-sm)' }}>{i + 1} / {PLACEMENT.length}</span>
      </div>
      <div className="progress" style={{ marginBottom: 'var(--sp-6)' }} aria-hidden><span style={{ width: `${(i / PLACEMENT.length) * 100}%` }} /></div>
      <section className="quiz" aria-live="polite">
        <div className="eyebrow" style={{ marginBottom: 'var(--sp-2)' }}>Placement quiz</div>
        <h1 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--sp-4)' }}>{inline(q.question)}</h1>
        {q.code && <div style={{ marginBottom: 'var(--sp-4)' }}><CodeBlock code={q.code.code} lang={q.code.lang} /></div>}
        <div className="stack" style={{ gap: 'var(--sp-2)' }}>
          {opts.map((o, idx) => (
            <button key={`${q.id}-${idx}`} className="quiz-option" onClick={() => choose(idx)} style={idx === opts.length - 1 ? { borderStyle: 'dashed' } : undefined}>
              <span className="quiz-letter">{idx === opts.length - 1 ? '?' : String.fromCharCode(65 + idx)}</span>
              <span>{inline(o)}</span>
            </button>
          ))}
        </div>
        <p className="subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-4)' }}>
          Answering “I’m not sure” is better than guessing — it helps us place you accurately. Nothing here affects your XP.
        </p>
      </section>
    </div>
  );
}
