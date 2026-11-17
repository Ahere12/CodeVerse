import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check, Copy, Download, FileCode2, FilePlus2, FolderOpen, Loader2, Maximize2, Minimize2, Play, RotateCcw, Share2, Trash2, Upload, X,
} from 'lucide-react';
import { useAppStore, type Project, type ProjectKind } from '../store/useAppStore';
import { useToasts } from '../store/useToasts';
import { CodeEditor } from '../components/code/CodeEditor';
import { LogView, RunOutput, SqlOutput, WebPreview } from '../components/code/Outputs';
import { useAuth } from '../store/useAuth';
import { CONSOLE_SHIM, storageShim, buildWebDocument, decodeShare, downloadText, encodeShare, fromTemplate, langOfFile, MAX_SHARE_LENGTH, newId, TEMPLATES } from '../lib/projects';
import { runJs, type LogLine, type RunResult } from '../runtime/jsRunner';
import { onPythonStatus, preloadPython, pythonStatus, runPython } from '../runtime/pyRunner';
import { runSql, type SqlResult } from '../runtime/sqlRunner';
import { useCodeTheme } from '../lib/hooks';

const LAST_KEY = 'codeverse:lastProject';
/** Per-project stand-in localStorage for previews (kept while this page is open). */
const previewStorage = new Map<string, Record<string, string>>();
const SPLIT_KEY = 'codeverse:playgroundSplit';
const KIND_LABEL: Record<ProjectKind, string> = { web: 'HTML · CSS · JS', javascript: 'JavaScript', python: 'Python', sql: 'SQL' };
const ALLOWED_EXT: Record<ProjectKind, RegExp> = { web: /\.(html|css|m?js)$/i, javascript: /\.m?js$/i, python: /\.py$/i, sql: /\.sql$/i };

const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

export default function Playground() {
  const projects = useAppStore((s) => s.projects);
  const saveProject = useAppStore((s) => s.saveProject);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const push = useToasts((s) => s.push);
  const signedIn = !!useAuth((s) => s.user);

  /** The project being edited. Shared projects are "unsaved" until the learner saves a copy. */
  const [project, setProject] = useState<Project | null>(null);
  const [unsaved, setUnsaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Open a shared link, else the last project.
  useEffect(() => {
    const m = /#share=([\w-]+)/.exec(window.location.hash);
    if (m) {
      decodeShare(m[1]).then((p) => {
        if (p) {
          const now = Date.now();
          setProject({ ...p, id: newId(), createdAt: now, updatedAt: now });
          setUnsaved(true);
        } else push({ title: 'That share link is broken or incomplete', tone: 'critical' });
        history.replaceState(null, '', window.location.pathname);
      });
      return;
    }
    const wanted = new URLSearchParams(window.location.search).get('open');
    if (wanted && useAppStore.getState().projects[wanted]) {
      setProject(useAppStore.getState().projects[wanted]);
      // Remember it as the last project too, so a re-run of this effect opens the same one.
      safeSet(LAST_KEY, wanted);
      history.replaceState(null, '', window.location.pathname);
      return;
    }
    const last = safeGet(LAST_KEY);
    const stored = last ? useAppStore.getState().projects[last] : undefined;
    if (stored) setProject(stored);
    else setShowPicker(true);
  }, [push]);

  // Autosave edits to saved projects.
  useEffect(() => {
    if (!project || unsaved) return;
    safeSet(LAST_KEY, project.id);
    const t = window.setTimeout(() => {
      const stored = useAppStore.getState().projects[project.id];
      if (!stored || JSON.stringify(stored.files) !== JSON.stringify(project.files) || stored.name !== project.name) saveProject(project);
    }, 600);
    return () => window.clearTimeout(t);
  }, [project, unsaved, saveProject]);

  const open = (p: Project) => {
    setProject(p);
    setUnsaved(false);
    setShowPicker(false);
  };

  const create = (templateId: string) => {
    const t = TEMPLATES.find((x) => x.id === templateId)!;
    const p = fromTemplate(t, `${t.name} ${Object.values(projects).filter((x) => x.kind === t.kind).length + 1}`);
    saveProject(p);
    open(p);
  };

  const sorted = Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);

  if (showPicker || !project) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h1>Playground</h1>
            <p>Experiment freely. Projects save automatically{signedIn ? ' and sync to your account' : ' in this browser'}.</p>
          </div>
          {project && <button className="btn" onClick={() => setShowPicker(false)}><X size={15} /> Back to {project.name}</button>}
        </header>

        <h2 className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>Start from a template</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-8)' }}>
          {TEMPLATES.map((t) => (
            <button key={t.id} className="panel lang-card" style={{ textAlign: 'left', cursor: 'pointer', padding: 'var(--sp-4)' }} onClick={() => create(t.id)}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{t.name}</strong>
                <span className="badge">{KIND_LABEL[t.kind]}</span>
              </div>
              <p className="muted" style={{ fontSize: 'var(--fs-sm)', marginTop: 6 }}>{t.description}</p>
            </button>
          ))}
        </div>

        <h2 className="eyebrow" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>Your projects</h2>
        {sorted.length ? (
          <ul className="list panel" style={{ padding: '0 var(--sp-5)' }}>
            {sorted.map((p) => (
              <li key={p.id} className="list-item">
                <FileCode2 size={16} className="subtle" aria-hidden />
                <button onClick={() => open(p)} className="list-title" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', flex: 1, textAlign: 'left' }}>{p.name}</button>
                <span className="badge">{KIND_LABEL[p.kind]}</span>
                <span className="subtle" style={{ fontSize: 'var(--fs-xs)', minWidth: 90, textAlign: 'right' }}>{new Date(p.updatedAt).toLocaleDateString()}</span>
                <button className="icon-btn" aria-label={`Delete ${p.name}`} onClick={() => { if (window.confirm(`Delete “${p.name}”? This can’t be undone.`)) deleteProject(p.id); }}>
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty"><strong>No saved projects yet</strong>Pick a template above — your work saves automatically as you type.</div>
        )}
      </div>
    );
  }

  return (
    <Workspace
      key={project.id}
      project={project}
      setProject={setProject}
      unsaved={unsaved}
      onSaveCopy={() => { const p = { ...project, id: newId(), createdAt: Date.now() }; saveProject(p); setProject(p); setUnsaved(false); push({ title: 'Saved to your projects', tone: 'good' }); }}
      onOpenPicker={() => setShowPicker(true)}
    />
  );
}

function Workspace({ project, setProject, unsaved, onSaveCopy, onOpenPicker }: {
  project: Project;
  setProject: (p: Project) => void;
  unsaved: boolean;
  onSaveCopy: () => void;
  onOpenPicker: () => void;
}) {
  const push = useToasts((s) => s.push);
  const codeTheme = useCodeTheme();
  const [active, setActive] = useState(project.files[0]?.name ?? '');
  const [webLogs, setWebLogs] = useState<LogLine[]>([]);
  const [webDoc, setWebDoc] = useState('');
  const [runKey, setRunKey] = useState(0);
  const [autoRun, setAutoRun] = useState(true);
  const [jsRun, setJsRun] = useState<RunResult | null>(null);
  const [sqlRun, setSqlRun] = useState<SqlResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [pyStatus, setPyStatus] = useState(pythonStatus());
  const [split, setSplit] = useState(() => Number(safeGet(SPLIT_KEY)) || 0.5);
  const [fullscreen, setFullscreen] = useState(false);
  const [addingFile, setAddingFile] = useState(false);
  const [newName, setNewName] = useState('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const file = project.files.find((f) => f.name === active) ?? project.files[0];
  const update = (patch: Partial<Project>) => setProject({ ...project, ...patch });
  const setFileContent = (content: string) => update({ files: project.files.map((f) => (f.name === file.name ? { ...f, content } : f)) });

  useEffect(() => {
    if (project.kind !== 'python') return;
    preloadPython();
    return onPythonStatus(setPyStatus) as () => void;
  }, [project.kind]);

  const run = useCallback(async () => {
    if (project.kind === 'web') {
      setWebLogs([]);
      setWebDoc(buildWebDocument(project, storageShim(previewStorage.get(project.id) ?? {}) + CONSOLE_SHIM));
      setRunKey((k) => k + 1);
      return;
    }
    setBusy(true);
    if (project.kind === 'javascript') setJsRun(await runJs(project.files.filter((f) => /\.m?js$/.test(f.name)).map((f) => f.content).join('\n;\n'), [], 3000));
    if (project.kind === 'python') setJsRun(await runPython(project.files.filter((f) => f.name.endsWith('.py')).map((f) => f.content).join('\n\n')));
    if (project.kind === 'sql') setSqlRun(await runSql(file.content));
    setBusy(false);
  }, [project, file]);

  // Web projects: run once on open, then re-run as you type when auto-run is on.
  const firstRun = useRef(true);
  useEffect(() => {
    if (project.kind !== 'web') return;
    if (firstRun.current) { firstRun.current = false; run(); return; }
    if (!autoRun) return;
    const t = window.setTimeout(run, 700);
    return () => window.clearTimeout(t);
  }, [project.files, autoRun, project.kind, run]);

  // Fullscreen
  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
  const toggleFullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : rootRef.current?.requestFullscreen?.());

  // Resizable split
  const startDrag = (e: React.PointerEvent) => {
    const body = bodyRef.current;
    if (!body) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const vertical = window.matchMedia('(max-width: 860px)').matches;
    const move = (ev: PointerEvent) => {
      const r = body.getBoundingClientRect();
      const ratio = vertical ? (ev.clientY - r.top) / r.height : (ev.clientX - r.left) / r.width;
      setSplit(Math.min(0.8, Math.max(0.2, ratio)));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setSplit((s) => { safeSet(SPLIT_KEY, String(s)); return s; });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const nudgeSplit = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setSplit((s) => Math.max(0.2, s - 0.05));
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setSplit((s) => Math.min(0.8, s + 0.05));
  };

  // Files
  const canAddFiles = project.kind === 'web' || project.kind === 'javascript';
  const addFile = () => {
    const name = newName.trim();
    setAddingFile(false);
    setNewName('');
    if (!name) return;
    if (!ALLOWED_EXT[project.kind].test(name)) return push({ title: 'Unsupported file type', body: project.kind === 'web' ? 'Use .html, .css or .js' : 'Use .js', tone: 'critical' });
    if (project.files.some((f) => f.name === name)) return push({ title: 'A file with that name already exists', tone: 'critical' });
    if (!/^[\w.-]{1,40}$/.test(name)) return push({ title: 'Use letters, numbers, dots, dashes or underscores', tone: 'critical' });
    update({ files: [...project.files, { name, content: '' }] });
    setActive(name);
  };
  const removeFile = (name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    const files = project.files.filter((f) => f.name !== name);
    update({ files });
    if (active === name) setActive(files[0].name);
  };

  const resetTemplate = () => {
    const t = TEMPLATES.find((x) => x.kind === project.kind)!;
    if (window.confirm('Replace all files with the starter template? Your current code will be lost.')) {
      update({ files: t.files.map((f) => ({ ...f })) });
      setActive(t.files[0].name);
    }
  };

  // Download / import / share
  const download = () => {
    const slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
    if (project.kind === 'web') downloadText(`${slug}.html`, buildWebDocument(project), 'text/html');
    else downloadText(file.name, file.content);
  };
  const exportJson = () => downloadText(`${project.name.replace(/[^\w-]+/g, '-')}.codeverse.json`, JSON.stringify({ app: 'codeverse-project', version: 1, name: project.name, kind: project.kind, files: project.files }, null, 2), 'application/json');

  const importFiles = async (list: FileList) => {
    const added: { name: string; content: string }[] = [];
    for (const f of Array.from(list).slice(0, 20)) {
      if (f.size > 500_000) { push({ title: `${f.name} is too large (max 500 KB)`, tone: 'critical' }); continue; }
      const text = await f.text();
      if (f.name.endsWith('.json')) {
        try {
          const d = JSON.parse(text);
          if (d.app === 'codeverse-project' && Array.isArray(d.files)) {
            const now = Date.now();
            const p: Project = { id: newId(), name: String(d.name ?? 'Imported'), kind: d.kind, files: d.files.map((x: { name: string; content: string }) => ({ name: String(x.name), content: String(x.content) })), createdAt: now, updatedAt: now };
            useAppStore.getState().saveProject(p);
            setProject(p);
            push({ title: `Imported “${p.name}”`, tone: 'good' });
            return;
          }
        } catch { /* fall through */ }
        push({ title: `${f.name} isn’t a CodeVerse project file`, tone: 'critical' });
        continue;
      }
      if (!ALLOWED_EXT[project.kind].test(f.name)) { push({ title: `${f.name} doesn’t fit a ${KIND_LABEL[project.kind]} project`, tone: 'critical' }); continue; }
      added.push({ name: f.name, content: text });
    }
    if (!added.length) return;
    const files = [...project.files];
    for (const a of added) {
      const i = files.findIndex((x) => x.name === a.name);
      if (i >= 0) files[i] = a; else files.push(a);
    }
    update({ files });
    setActive(added[0].name);
    push({ title: `Imported ${added.length} file${added.length > 1 ? 's' : ''}`, tone: 'good' });
  };

  const share = async () => {
    const code = await encodeShare(project);
    if (code.length > MAX_SHARE_LENGTH) return push({ title: 'Project too large to share as a link', body: 'Use “Export project” to send the file instead.', tone: 'critical' });
    const url = `${window.location.origin}/playground#share=${code}`;
    setShareUrl(url);
    try { await navigator.clipboard.writeText(url); } catch { /* shown in the dialog anyway */ }
  };

  const outputArea = (() => {
    if (project.kind === 'web') {
      return (
        <div className="pg-output-split">
          <div style={{ flex: 1, minHeight: 0 }}>{webDoc && <WebPreview doc={webDoc} runKey={runKey} onLog={(l) => setWebLogs((x) => [...x.slice(-199), l])} onStorage={(d) => previewStorage.set(project.id, d)} />}</div>
          <div className="pg-console">
            <div className="preview-label">Console {webLogs.length > 0 && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', height: 22 }} onClick={() => setWebLogs([])}>Clear</button>}</div>
            <div style={{ flex: 1, minHeight: 0 }}><LogView logs={webLogs} empty="console.log output from your page appears here." /></div>
          </div>
        </div>
      );
    }
    if (project.kind === 'sql') return <SqlOutput result={sqlRun} />;
    return <RunOutput run={jsRun} lang={project.kind === 'python' ? 'python' : 'javascript'} />;
  })();

  return (
    <div ref={rootRef} className="playground" data-code-theme={codeTheme} data-fullscreen={fullscreen}>
      {unsaved && (
        <div className="pg-banner">
          You’re viewing a shared project. Changes aren’t saved until you
          <button className="btn btn-sm btn-primary" onClick={onSaveCopy}>Save a copy</button>
        </div>
      )}
      <div className="pg-toolbar">
        <button className="icon-btn" onClick={onOpenPicker} aria-label="Open projects" title="Projects & templates"><FolderOpen size={17} /></button>
        <input className="pg-name" value={project.name} onChange={(e) => update({ name: e.target.value.slice(0, 80) })} aria-label="Project name" />
        <span className="badge">{KIND_LABEL[project.kind]}</span>
        {project.kind === 'python' && pyStatus === 'loading' && <span className="badge badge-info"><Loader2 size={12} className="spin" /> Downloading Python (first time only)</span>}
        <span className="spacer" />
        {project.kind === 'web' && (
          <label className="row subtle" style={{ fontSize: 'var(--fs-xs)', gap: 6 }}>
            <input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} /> Auto-run
          </label>
        )}
        <button className="btn btn-primary btn-sm" onClick={run} disabled={busy} title="Run (Ctrl+Enter)">
          {busy ? <Loader2 size={14} className="spin" /> : <Play size={14} />} Run
        </button>
        <div className="pg-actions">
          <button className="icon-btn" onClick={share} aria-label="Share link" title="Share link"><Share2 size={16} /></button>
          <button className="icon-btn" onClick={download} aria-label="Download" title={project.kind === 'web' ? 'Download as one HTML file' : `Download ${file.name}`}><Download size={16} /></button>
          <button className="icon-btn" onClick={exportJson} aria-label="Export project" title="Export project (.json)"><FileCode2 size={16} /></button>
          <button className="icon-btn" onClick={() => fileInput.current?.click()} aria-label="Import files" title="Import files or a project"><Upload size={16} /></button>
          <button className="icon-btn" onClick={resetTemplate} aria-label="Reset to template" title="Reset to template"><RotateCcw size={16} /></button>
          <button className="icon-btn" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'} title="Full screen">{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
        </div>
        <input ref={fileInput} type="file" multiple hidden accept=".html,.css,.js,.mjs,.py,.sql,.json" onChange={(e) => { if (e.target.files) importFiles(e.target.files); e.target.value = ''; }} />
      </div>

      <div ref={bodyRef} className="pg-body" style={{ ['--split' as string]: `${split * 100}%` }}>
        <section className="pg-editor" aria-label="Editor">
          <div className="pg-tabs" role="tablist" aria-label="Files">
            {project.files.map((f) => (
              <div key={f.name} className="pg-tab" data-active={f.name === file.name}>
                <button role="tab" aria-selected={f.name === file.name} onClick={() => setActive(f.name)}>{f.name}</button>
                {canAddFiles && project.files.length > 1 && f.name !== 'index.html' && (
                  <button className="pg-tab-x" onClick={() => removeFile(f.name)} aria-label={`Delete ${f.name}`}><X size={12} /></button>
                )}
              </div>
            ))}
            {canAddFiles && (addingFile ? (
              <input
                className="input"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={addFile}
                onKeyDown={(e) => { if (e.key === 'Enter') addFile(); if (e.key === 'Escape') { setAddingFile(false); setNewName(''); } }}
                placeholder={project.kind === 'web' ? 'utils.js' : 'helpers.js'}
                aria-label="New file name"
                style={{ height: 26, width: 120, fontSize: 'var(--fs-xs)' }}
              />
            ) : (
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setAddingFile(true)} aria-label="Add file" title="Add file"><FilePlus2 size={14} /></button>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CodeEditor key={file.name} value={file.content} onChange={setFileContent} lang={langOfFile(file.name)} onRun={run} height="100%" ariaLabel={`${file.name} editor`} />
          </div>
        </section>
        <div className="pg-divider" role="separator" aria-orientation="vertical" aria-label="Resize panels" tabIndex={0} onPointerDown={startDrag} onKeyDown={nudgeSplit} />
        <section className="pg-out" aria-label="Output">{outputArea}</section>
      </div>

      {shareUrl && (
        <div className="palette-backdrop" onMouseDown={() => setShareUrl(null)}>
          <div className="palette" style={{ padding: 'var(--sp-5)' }} role="dialog" aria-modal="true" aria-label="Share link" onMouseDown={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 'var(--fs-md)' }}>Share this project</h2>
            <p className="muted" style={{ fontSize: 'var(--fs-sm)', margin: 'var(--sp-2) 0 var(--sp-3)' }}>
              The whole project is packed into the link itself — nothing is uploaded. Anyone with the link can open a copy.
            </p>
            <div className="row">
              <input className="input" readOnly value={shareUrl} style={{ flex: 1 }} onFocus={(e) => e.target.select()} aria-label="Share link" />
              <CopyButton text={shareUrl} />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 'var(--sp-4)' }}>
              <button className="btn" onClick={() => setShareUrl(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button className="btn" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); } catch { /* user can copy manually */ } }}>
      {done ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
    </button>
  );
}
