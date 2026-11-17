import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Monitor, Moon, RotateCcw, Sun, Upload } from 'lucide-react';
import { exportState, useAppStore, type FontScale, type Preferences } from '../store/useAppStore';
import { useToasts } from '../store/useToasts';
import { LANGUAGES } from '../data/languages';
import { StylePicker } from '../components/ui/StylePicker';
import { useAuth } from '../store/useAuth';

export function Settings() {
  const prefs = useAppStore((s) => s.prefs);
  const update = useAppStore((s) => s.updatePrefs);
  const togglePref = useAppStore((s) => s.togglePreferredLanguage);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const importState = useAppStore((s) => s.importState);
  const push = useToasts((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const set = <K extends keyof Preferences>(k: K) => (v: Preferences[K]) => update({ [k]: v } as Partial<Preferences>);

  const doExport = () => {
    const blob = new Blob([exportState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeverse-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    if (file.size > 2_000_000) return push({ title: 'File too large', body: 'Exports are usually a few KB.', tone: 'critical' });
    const result = importState(await file.text());
    push(result.ok ? { title: 'Progress imported', tone: 'good' } : { title: 'Import failed', body: result.error, tone: 'critical' });
  };

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Saved automatically in this browser.</p>
        </div>
      </header>

      <div className="stack" style={{ gap: 'var(--sp-5)' }}>
        <Section id="profile" title="Profile">
          <Row label="Display name" hint="Shown on your dashboard. Stays on this device.">
            <input className="input" value={prefs.displayName} maxLength={40} onChange={(e) => update({ displayName: e.target.value })} placeholder="Your name" style={{ width: 220 }} />
          </Row>
        </Section>

        <Section id="appearance" title="Appearance">
          <div style={{ padding: 'var(--sp-3) 0', borderTop: '1px solid var(--border)' }}>
            <div className="field-label" style={{ marginBottom: 'var(--sp-3)' }}>Design style</div>
            <StylePicker value={prefs.designStyle} onChange={(s) => update({ designStyle: s })} />
          </div>
          <Row label="Colour mode">
            <Segmented
              value={prefs.theme}
              onChange={set('theme')}
              options={[
                { v: 'dark', label: 'Dark', icon: <Moon size={14} /> },
                { v: 'light', label: 'Light', icon: <Sun size={14} /> },
                { v: 'system', label: 'System', icon: <Monitor size={14} /> },
              ]}
            />
          </Row>
          <Row label="Text size" hint="Scales the whole interface.">
            <Segmented<FontScale>
              value={prefs.fontScale}
              onChange={set('fontScale')}
              options={[{ v: 'sm', label: 'S' }, { v: 'md', label: 'M' }, { v: 'lg', label: 'L' }, { v: 'xl', label: 'XL' }]}
            />
          </Row>
          <Row label="Reduce motion" hint="Turns off animations and transitions.">
            <Switch checked={prefs.reducedMotion} onChange={set('reducedMotion')} label="Reduce motion" />
          </Row>
          <Row label="Collapsed sidebar" hint={<>Toggle any time with <kbd>Ctrl</kbd> <kbd>\</kbd></>}>
            <Switch checked={prefs.sidebarCollapsed} onChange={set('sidebarCollapsed')} label="Collapsed sidebar" />
          </Row>
        </Section>

        <Section id="editor" title="Code editor" note="Applies to the editor and playground once they ship.">
          <Row label="Editor theme">
            <Segmented value={prefs.editorTheme} onChange={set('editorTheme')} options={[{ v: 'match', label: 'Match app' }, { v: 'dark', label: 'Dark' }, { v: 'light', label: 'Light' }]} />
          </Row>
          <Row label="Editor font size">
            <div className="row">
              <input type="range" min={11} max={22} value={prefs.editorFontSize} onChange={(e) => update({ editorFontSize: Number(e.target.value) })} aria-label="Editor font size" />
              <span className="mono" style={{ width: 40, fontSize: prefs.editorFontSize }}>{prefs.editorFontSize}</span>
            </div>
          </Row>
        </Section>

        <Section id="goals" title="Learning">
          <Row label="Daily goal" hint="Active minutes per day.">
            <Segmented value={String(prefs.dailyGoalMinutes)} onChange={(v) => update({ dailyGoalMinutes: Number(v) })} options={['5', '15', '30', '60'].map((v) => ({ v, label: `${v}m` }))} />
          </Row>
          <Row label="Weekly goal" hint="Days per week you’d like to learn.">
            <select className="select" value={prefs.weeklyGoalDays} onChange={(e) => update({ weeklyGoalDays: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'}</option>)}
            </select>
          </Row>
          <Row label="Experience" hint="Shapes your suggested path.">
            <select className="select" value={prefs.experience} onChange={(e) => update({ experience: e.target.value as Preferences['experience'] })}>
              <option value="new">Brand new</option>
              <option value="some">Tried a little</option>
              <option value="experienced">Already code</option>
            </select>
          </Row>
          <Row label="Explain technical words" hint="Show plain-language definitions on dotted words.">
            <Switch checked={prefs.showTermHints} onChange={set('showTermHints')} label="Explain technical words" />
          </Row>
          <div style={{ padding: 'var(--sp-4) 0 0' }}>
            <div className="field-label" style={{ marginBottom: 'var(--sp-2)' }}>Preferred languages</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {LANGUAGES.map((l) => {
                const on = prefs.preferredLanguages.includes(l.id);
                return (
                  <button key={l.id} aria-pressed={on} onClick={() => togglePref(l.id)} className="badge" style={{ cursor: 'pointer', height: 26, color: on ? 'var(--accent)' : undefined, borderColor: on ? 'var(--accent)' : undefined, background: on ? 'var(--accent-soft)' : undefined }}>
                    {l.name}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section id="notifications" title="Notifications & privacy">
          <Row label="Achievement pop-ups" hint="A small notice when you unlock a badge.">
            <Switch checked={prefs.notifyAchievements} onChange={set('notifyAchievements')} label="Achievement pop-ups" />
          </Row>
          <Row label="Leaderboards" hint="Off by default. Leaderboards need accounts, which aren’t available yet — nothing is shared.">
            <Switch checked={prefs.showLeaderboards} onChange={set('showLeaderboards')} label="Leaderboards" />
          </Row>
        </Section>

        <Section id="data" title="Your data" note="Everything is stored locally in this browser. Export a backup to move it to another device.">
          <div className="row" style={{ flexWrap: 'wrap', paddingTop: 'var(--sp-2)' }}>
            <button className="btn" onClick={doExport}><Download size={15} /> Export progress</button>
            <button className="btn" onClick={() => fileRef.current?.click()}><Upload size={15} /> Import progress</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ''; }} />
            <div className="spacer" />
            {confirmReset ? (
              <div className="row" role="alert">
                <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Erase XP, streaks, time and badges?</span>
                <button className="btn btn-danger" onClick={() => { resetProgress(); setConfirmReset(false); void useAuth.getState().pushLocal(); push({ title: 'Progress reset' }); }}>Yes, reset</button>
                <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
              </div>
            ) : (
              <button className="btn btn-ghost" onClick={() => setConfirmReset(true)}><RotateCcw size={15} /> Reset progress</button>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className="panel" aria-labelledby={`${id}-h`} style={{ scrollMarginTop: 72 }}>
      <h2 id={`${id}-h`} style={{ fontSize: 'var(--fs-md)' }}>{title}</h2>
      {note && <p className="subtle" style={{ fontSize: 'var(--fs-sm)', marginTop: 2 }}>{note}</p>}
      <div style={{ marginTop: 'var(--sp-2)' }}>{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-4)', padding: 'var(--sp-3) 0', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
      <div style={{ minWidth: 200, flex: 1 }}>
        <div className="field-label">{label}</div>
        {hint && <div className="field-hint">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} />;
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; icon?: ReactNode }[] }) {
  return (
    <div className="segmented" role="group">
      {options.map((o) => (
        <button key={o.v} aria-pressed={value === o.v} onClick={() => onChange(o.v)}>
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
