import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { useAppStore, type ExperienceLevel } from '../store/useAppStore';
import { LanguageMark } from '../components/ui/bits';
import { Term } from '../components/ui/Term';
import { StylePicker } from '../components/ui/StylePicker';
import type { DesignStyle, ThemePref } from '../store/useAppStore';

const EXPERIENCE: { id: ExperienceLevel; title: string; body: string }[] = [
  { id: 'new', title: 'I’m brand new', body: 'I have never written code. Start from the very beginning.' },
  { id: 'some', title: 'I’ve tried a little', body: 'I’ve followed a tutorial or two but I’m not confident yet.' },
  { id: 'experienced', title: 'I already code', body: 'I know at least one language and want to go further.' },
];

const GOALS = [5, 15, 30, 60];

/** Suggested picks per experience level, shown first. */
const SUGGESTED: Record<ExperienceLevel, string[]> = {
  new: ['html', 'css', 'javascript', 'python'],
  some: ['javascript', 'python', 'sql', 'typescript'],
  experienced: ['typescript', 'react', 'rust', 'go'],
};

export function Onboarding() {
  const complete = useAppStore((s) => s.completeOnboarding);
  const updatePrefs = useAppStore((s) => s.updatePrefs);
  const designStyle = useAppStore((s) => s.prefs.designStyle);
  const themePref = useAppStore((s) => s.prefs.theme);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>('new');
  const [langs, setLangs] = useState<string[]>([]);
  const [goal, setGoal] = useState(15);

  const toggle = (id: string) => setLangs((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const finish = () =>
    complete({ displayName: name.trim(), experience, preferredLanguages: langs.length ? langs : SUGGESTED[experience].slice(0, 2), dailyGoalMinutes: goal, designStyle, theme: themePref });

  const suggested = SUGGESTED[experience].map((id) => LANGUAGES.find((l) => l.id === id)!);
  const others = LANGUAGES.filter((l) => !SUGGESTED[experience].includes(l.id));

  const steps = ['Welcome', 'Look', 'Experience', 'Interests', 'Goal'];
  // Style changes apply live so the learner sees the result immediately.
  const pickStyle = (s: DesignStyle) => updatePrefs({ designStyle: s, theme: s === 'friendly' ? 'light' : s === 'terminal' ? 'dark' : themePref });

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div className="row" style={{ gap: 6, marginBottom: 'var(--sp-6)' }} aria-label={`Step ${step + 1} of ${steps.length}`}>
        {steps.map((s, i) => (
          <span key={s} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= step ? 'var(--accent)' : 'var(--surface-3)' }} />
        ))}
      </div>

      <section className="panel" style={{ padding: 'var(--sp-8)', backgroundImage: 'var(--glow)' }}>
        {step === 0 && (
          <div className="stack" style={{ gap: 'var(--sp-5)' }}>
            <div>
              <div className="eyebrow">Welcome to CodeVerse</div>
              <h1 style={{ marginTop: 'var(--sp-2)' }}>Let’s set up your learning space</h1>
              <p className="muted" style={{ marginTop: 'var(--sp-2)' }}>
                Four quick questions so we can suggest where to start. You can change any of this later in Settings.
                Your progress is saved in this browser — no account needed.
              </p>
            </div>
            <label className="field">
              <span className="field-label">What should we call you? <span className="subtle">(optional)</span></span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Your name" autoFocus />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="stack" style={{ gap: 'var(--sp-5)' }}>
            <div>
              <h1>Pick a look</h1>
              <p className="muted" style={{ marginTop: 'var(--sp-2)' }}>Choose the style you’d enjoy reading every day. You can switch any time in Settings.</p>
            </div>
            <StylePicker value={designStyle} onChange={pickStyle} />
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Colour mode</span>
              <div className="segmented" role="group" aria-label="Colour mode">
                {(['light', 'dark', 'system'] as ThemePref[]).map((t) => (
                  <button key={t} aria-pressed={themePref === t} onClick={() => updatePrefs({ theme: t })}>{t[0].toUpperCase() + t.slice(1)}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="stack" style={{ gap: 'var(--sp-5)' }}>
            <div>
              <h1>How much have you coded before?</h1>
              <p className="muted" style={{ marginTop: 'var(--sp-2)' }}>
                There’s no wrong answer. If you’re not sure what <Term id="code">code</Term> even is, pick the first option.
              </p>
            </div>
            <div className="stack" role="radiogroup" aria-label="Experience">
              {EXPERIENCE.map((e) => (
                <button
                  key={e.id}
                  role="radio"
                  aria-checked={experience === e.id}
                  onClick={() => setExperience(e.id)}
                  className="panel"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 'var(--sp-4)',
                    display: 'flex',
                    gap: 'var(--sp-3)',
                    alignItems: 'center',
                    borderColor: experience === e.id ? 'var(--accent)' : 'var(--border)',
                    background: experience === e.id ? 'var(--accent-soft)' : 'var(--surface)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{e.title}</div>
                    <div className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{e.body}</div>
                  </div>
                  {experience === e.id && <Check size={18} color="var(--accent)" aria-hidden />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="stack" style={{ gap: 'var(--sp-5)' }}>
            <div>
              <h1>What would you like to learn?</h1>
              <p className="muted" style={{ marginTop: 'var(--sp-2)' }}>
                Pick any that interest you. {experience === 'new' && 'Most beginners start with HTML, CSS and JavaScript — they let you build websites you can see right away.'}
              </p>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 'var(--sp-2)' }}>Suggested for you</div>
              <LangPicker list={suggested} selected={langs} onToggle={toggle} />
            </div>
            <details>
              <summary className="link" style={{ cursor: 'pointer', fontSize: 'var(--fs-sm)' }}>Show all {LANGUAGES.length} languages</summary>
              <div style={{ marginTop: 'var(--sp-3)' }}>
                <LangPicker list={others} selected={langs} onToggle={toggle} />
              </div>
            </details>
          </div>
        )}

        {step === 4 && (
          <div className="stack" style={{ gap: 'var(--sp-5)' }}>
            <div>
              <h1>Set a daily goal</h1>
              <p className="muted" style={{ marginTop: 'var(--sp-2)' }}>
                Small and steady beats long and rare. Missing a day never costs you anything — your <Term id="xp">XP</Term> and progress stay.
              </p>
            </div>
            <div className="segmented" role="group" aria-label="Daily goal in minutes">
              {GOALS.map((g) => (
                <button key={g} aria-pressed={goal === g} onClick={() => setGoal(g)}>
                  {g} min
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: 'var(--sp-8)' }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div className="spacer" />
          {step < steps.length - 1 ? (
            <button className="btn btn-primary btn-lg" onClick={() => setStep(step + 1)}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={finish}>
              Go to my dashboard <ArrowRight size={16} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function LangPicker({ list, selected, onToggle }: { list: typeof LANGUAGES; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--sp-2)' }}>
      {list.map((l) => {
        const on = selected.includes(l.id);
        return (
          <button
            key={l.id}
            aria-pressed={on}
            onClick={() => onToggle(l.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-3)',
              padding: 'var(--sp-2) var(--sp-3)',
              borderRadius: 'var(--r-md)',
              border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
              background: on ? 'var(--accent-soft)' : 'var(--surface)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <LanguageMark lang={l} size={28} />
            <span style={{ fontWeight: 500, fontSize: 'var(--fs-sm)', flex: 1 }}>{l.name}</span>
            {on && <Check size={15} color="var(--accent)" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
