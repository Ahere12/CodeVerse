import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Search } from 'lucide-react';
import { CATEGORY_LABELS, getLanguage, LANGUAGES, type LanguageCategory } from '../data/languages';
import { CurveBadge, LanguageMark, RuntimeBadge } from '../components/ui/bits';
import { useAppStore } from '../store/useAppStore';
import { Term } from '../components/ui/Term';
import { NotFound } from './NotFound';
import { coursesForLanguage } from '../content';
import { CourseCard } from '../components/lesson/CourseBits';
import { LANGUAGE_ICONS } from '../data/languageIcons';
import { LANGUAGE_VIDEOS } from '../content/videos';
import { VideoEmbed } from '../components/lesson/VideoEmbed';

const brandOf = (id: string) => (LANGUAGE_ICONS[id] ? `#${LANGUAGE_ICONS[id].hex}` : undefined);

type Filter = 'all' | LanguageCategory;

export function Languages() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const mine = useAppStore((s) => s.prefs.preferredLanguages);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        (filter === 'all' || l.category === filter) &&
        (!query || l.name.toLowerCase().includes(query) || l.tagline.toLowerCase().includes(query) || l.usedFor.some((u) => u.toLowerCase().includes(query))),
    );
  }, [q, filter]);

  const groups = (Object.keys(CATEGORY_LABELS) as LanguageCategory[])
    .map((c) => ({ c, items: list.filter((l) => l.category === c) }))
    .filter((g) => g.items.length);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Languages</h1>
          <p>
            {LANGUAGES.length} <Term id="programming-language">languages</Term> and technologies. Not sure where to begin? Start with HTML.
          </p>
        </div>
      </header>

      <div className="row" style={{ flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
        <label className="row" style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search size={15} className="subtle" style={{ position: 'absolute', left: 10 }} aria-hidden />
          <input className="input" style={{ paddingLeft: 32, width: '100%' }} placeholder="Filter by name or use, e.g. “games”" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter languages" />
        </label>
        <div className="segmented" role="group" aria-label="Category" style={{ overflowX: 'auto', maxWidth: '100%' }}>
          {(['all', ...Object.keys(CATEGORY_LABELS)] as Filter[]).map((f) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : CATEGORY_LABELS[f].split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <div className="empty">
          <strong>No languages match “{q}”</strong>
          Try a broader word like “web”, “data” or “apps”.
          <button className="btn btn-sm" onClick={() => { setQ(''); setFilter('all'); }}>Clear filters</button>
        </div>
      )}

      <div className="stack" style={{ gap: 'var(--sp-8)' }}>
        {groups.map(({ c, items }) => (
          <section key={c} aria-labelledby={`cat-${c}`}>
            <h2 id={`cat-${c}`} className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>
              {CATEGORY_LABELS[c]} <span className="subtle">· {items.length}</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--sp-3)' }}>
              {items.map((l) => (
                <Link key={l.id} to={`/languages/${l.id}`} className="panel lang-card" style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', ['--brand' as string]: brandOf(l.id) }}>
                  <div className="row" style={{ gap: 'var(--sp-3)' }}>
                    <LanguageMark lang={l} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{l.name}</div>
                      <div className="subtle" style={{ fontSize: 'var(--fs-xs)' }}>{l.usedFor.slice(0, 2).join(' · ')}</div>
                    </div>
                    {mine.includes(l.id) && <span className="badge badge-good" title="In your languages"><Check size={12} /> Mine</span>}
                  </div>
                  <p className="muted" style={{ fontSize: 'var(--fs-sm)', flex: 1 }}>{l.tagline}</p>
                  <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                    <CurveBadge lang={l} />
                    <RuntimeBadge lang={l} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function LanguageDetail() {
  const { id = '' } = useParams();
  const lang = getLanguage(id);
  const mine = useAppStore((s) => s.prefs.preferredLanguages.includes(id));
  const toggle = useAppStore((s) => s.togglePreferredLanguage);
  const setLastVisited = useAppStore((s) => s.setLastVisited);

  useEffect(() => {
    if (lang) setLastVisited({ title: lang.name, path: `/languages/${lang.id}`, subtitle: 'Language overview' });
  }, [lang, setLastVisited]);

  if (!lang) return <NotFound />;
  const prereq = lang.prerequisite ? getLanguage(lang.prerequisite) : undefined;
  const leadsTo = LANGUAGES.filter((l) => l.prerequisite === lang.id);
  const courses = coursesForLanguage(lang.id);

  return (
    <div className="page" style={{ maxWidth: 960 }}>
      <Link to="/languages" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--sp-4)', marginLeft: -12 }}>
        <ArrowLeft size={14} /> All languages
      </Link>
      <header className="page-header" style={{ alignItems: 'center' }}>
        <div className="row" style={{ gap: 'var(--sp-4)' }}>
          <LanguageMark lang={lang} size={56} />
          <div>
            <div className="eyebrow">{CATEGORY_LABELS[lang.category]}</div>
            <h1>{lang.name}</h1>
            <p>{lang.tagline}</p>
          </div>
        </div>
        <button className={mine ? 'btn' : 'btn btn-primary'} onClick={() => toggle(lang.id)} aria-pressed={mine}>
          {mine ? <><Check size={16} /> In my languages</> : <><Plus size={16} /> Add to my languages</>}
        </button>
      </header>

      <div className="grid-12">
        <section className="panel col-8">
          <h2 style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-3)' }}>What people build with {lang.name}</h2>
          <div className="row" style={{ flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
            {lang.usedFor.map((u) => <span key={u} className="badge" style={{ height: 26, fontSize: 'var(--fs-sm)' }}>{u}</span>)}
          </div>

          {LANGUAGE_VIDEOS[lang.id] && (
            <>
              <h2 style={{ fontSize: 'var(--fs-md)', margin: 'var(--sp-6) 0 var(--sp-3)' }}>{lang.name} in a nutshell</h2>
              <VideoEmbed video={LANGUAGE_VIDEOS[lang.id]} />
            </>
          )}

          <h2 style={{ fontSize: 'var(--fs-md)', margin: 'var(--sp-6) 0 var(--sp-3)' }}>Courses</h2>
          {courses.length ? (
            <div className="stack">
              {courses.map((c) => <CourseCard key={c.id} course={c} />)}
              {!courses.some((c) => c.level === 'advanced') && (
                <p className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>
                  {courses.some((c) => c.level === 'intermediate') ? 'An advanced course is being written.' : 'Intermediate and advanced courses are being written.'}
                </p>
              )}
            </div>
          ) : (
            <div className="empty">
              <strong>No {lang.name} course yet</strong>
              We’re writing courses one language at a time, starting with the web. Until then, use this page to learn what {lang.name} is for.
              <Link to="/courses" className="btn btn-sm">See available courses</Link>
            </div>
          )}
        </section>

        <aside className="col-4 stack">
          <section className="panel">
            <h2 className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>Running code</h2>
            <RuntimeBadge lang={lang} />
            <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-2)' }}>{lang.runtime.note}</p>
            {lang.runtime.status !== 'available' && (
              <p className="subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-2)' }}>
                We only label a language “Runs in browser” once its <Term id="sandbox">sandboxed</Term> <Term id="runtime">runtime</Term> is built and tested.
              </p>
            )}
          </section>
          <section className="panel">
            <h2 className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>Learning curve</h2>
            <CurveBadge lang={lang} />
            {prereq && (
              <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-3)' }}>
                Helpful to know first: <Link className="link" to={`/languages/${prereq.id}`}>{prereq.name}</Link>
              </p>
            )}
            {leadsTo.length > 0 && (
              <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-2)' }}>
                Leads to:{' '}
                {leadsTo.map((l, i) => (
                  <span key={l.id}>{i > 0 && ', '}<Link className="link" to={`/languages/${l.id}`}>{l.name}</Link></span>
                ))}
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
