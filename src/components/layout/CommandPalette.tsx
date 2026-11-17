import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import { ALL_NAV_ITEMS } from '../../lib/nav';
import { LANGUAGES } from '../../data/languages';
import { GLOSSARY } from '../../data/glossary';
import { ALL_LESSONS, COURSES, lessonPath } from '../../content';
import { CHALLENGES } from '../../content/challenges';
import { ROADMAPS } from '../../content/roadmaps';
import { GUIDED_PROJECTS } from '../../content/guidedProjects';

interface Result {
  id: string;
  section: string;
  title: string;
  hint: string;
  to: string;
}

/** Search index — new content types (courses, lessons, docs, challenges) register here. */
function buildIndex(): Result[] {
  return [
    ...ALL_NAV_ITEMS.map((n) => ({ id: `nav:${n.to}`, section: 'Pages', title: n.label, hint: n.description, to: n.to })),
    ...COURSES.map((c) => ({ id: `course:${c.id}`, section: 'Courses', title: c.title, hint: c.description, to: `/courses/${c.id}` })),
    ...ROADMAPS.map((r) => ({ id: `rm:${r.id}`, section: 'Roadmaps', title: r.title, hint: r.summary, to: `/roadmaps/${r.id}` })),
    ...GUIDED_PROJECTS.map((p) => ({ id: `gp:${p.id}`, section: 'Projects', title: p.title, hint: p.summary, to: `/projects/${p.id}` })),
    ...CHALLENGES.map((c) => ({ id: `ch:${c.id}`, section: 'Challenges', title: c.title, hint: `${c.lang} · ${c.difficulty}`, to: `/challenges/${c.id}` })),
    ...ALL_LESSONS.map(({ course, lesson }) => ({ id: `lesson:${lesson.id}`, section: 'Lessons', title: lesson.title, hint: `${course.title} · ${lesson.goal}`, to: lessonPath(course.id, lesson.id) })),
    ...LANGUAGES.map((l) => ({ id: `lang:${l.id}`, section: 'Languages', title: l.name, hint: l.tagline, to: `/languages/${l.id}` })),
    ...Object.entries(GLOSSARY).map(([k, g]) => ({ id: `term:${k}`, section: 'Glossary', title: g.term, hint: g.definition, to: `/glossary#${k}` })),
  ];
}

function score(r: Result, q: string): number {
  const t = r.title.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  if (r.hint.toLowerCase().includes(q)) return 30;
  return 0;
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.filter((r) => r.section === 'Pages');
    return index
      .map((r) => ({ r, s: score(r, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((x) => x.r);
  }, [query, index]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    setActive(0);
  }, [query]);

  const go = (r?: Result) => {
    if (!r) return;
    navigate(r.to);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter') go(results[active]);
    if (e.key === 'Escape') onClose();
  };

  let lastSection = '';
  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <Search size={18} className="subtle" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search courses, lessons, languages, terms…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `pr-${active}` : undefined}
          />
          <kbd>Esc</kbd>
        </div>
        {results.length === 0 ? (
          <div className="palette-empty">No matches for “{query}”. Try a language name like “python”.</div>
        ) : (
          <ul className="palette-results" id="palette-results" role="listbox">
            {results.map((r, i) => {
              const header = r.section !== lastSection ? <li className="palette-section" role="presentation">{r.section}</li> : null;
              lastSection = r.section;
              return (
                <FragmentWithHeader key={r.id} header={header}>
                  <li
                    id={`pr-${i}`}
                    role="option"
                    aria-selected={i === active}
                    className="palette-item"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                  >
                    <span style={{ fontWeight: 500 }}>{r.title}</span>
                    <span className="subtle" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                      {r.hint}
                    </span>
                    {i === active && <CornerDownLeft size={14} className="subtle" aria-hidden />}
                  </li>
                </FragmentWithHeader>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function FragmentWithHeader({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      {header}
      {children}
    </>
  );
}
