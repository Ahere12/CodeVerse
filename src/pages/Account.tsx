import { useState } from 'react';
import { CloudOff, Cloud, LogOut, RefreshCw, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import { siDiscord, siGithub, siGoogle } from 'simple-icons';
import { cloudConfigured, enabledProviders, type OAuthProvider } from '../lib/supabase';
import { profileOf, useAuth } from '../store/useAuth';

const PROVIDERS: { id: OAuthProvider; name: string; path: string }[] = [
  { id: 'github', name: 'GitHub', path: siGithub.path },
  { id: 'discord', name: 'Discord', path: siDiscord.path },
  { id: 'google', name: 'Google', path: siGoogle.path },
];

export function Account() {
  const { user, ready, sync, lastSyncedAt, error, signIn, signOut, syncNow, deleteCloudData } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<OAuthProvider | null>(null);
  const profile = profileOf(user);

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <header className="page-header">
        <div>
          <h1>Account</h1>
          <p>Sign in to save your progress to the cloud and pick up on any device.</p>
        </div>
      </header>

      {!cloudConfigured ? (
        <section className="panel stack">
          <div className="row"><CloudOff size={18} aria-hidden /> <strong>Accounts aren’t switched on for this site yet</strong></div>
          <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
            Your progress is still saved — in this browser. You can move it between devices with <strong>Settings → Export / Import</strong>.
          </p>
          {import.meta.env.DEV && (
            <div className="callout" style={{ fontSize: 'var(--fs-sm)' }}>
              <strong>Developer setup:</strong> create a free Supabase project, run <code className="inline-code">supabase/migrations/001_user_progress.sql</code>, enable the GitHub, Discord and Google providers, then copy <code className="inline-code">.env.example</code> to <code className="inline-code">.env.local</code> and restart the dev server. Full steps are in <code className="inline-code">SETUP-ACCOUNTS.md</code>.
            </div>
          )}
        </section>
      ) : !ready ? (
        <section className="panel subtle">Checking your session…</section>
      ) : !user ? (
        <section className="panel stack" style={{ gap: 'var(--sp-4)' }}>
          <h2 style={{ fontSize: 'var(--fs-md)' }}>Sign in or create an account</h2>
          <div className="stack" style={{ gap: 'var(--sp-2)' }}>
            {PROVIDERS.filter((p) => enabledProviders.includes(p.id)).map((p) => (
              <button
                key={p.id}
                className="btn btn-lg"
                style={{ justifyContent: 'flex-start', width: '100%' }}
                disabled={!!busy}
                onClick={async () => {
                  setBusy(p.id);
                  await signIn(p.id);
                  setBusy(null);
                }}
              >
                <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden><path d={p.path} /></svg>
                {busy === p.id ? 'Redirecting…' : `Continue with ${p.name}`}
              </button>
            ))}
          </div>
          {error && <p role="alert" style={{ color: 'var(--critical)', fontSize: 'var(--fs-sm)' }}><AlertTriangle size={14} /> {error}</p>}
          <p className="subtle row" style={{ fontSize: 'var(--fs-xs)', alignItems: 'flex-start' }}>
            <ShieldCheck size={14} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
            We only receive your name, avatar and email from the provider — never your password. Progress you’ve made on this device is merged into your account, nothing is lost.
          </p>
        </section>
      ) : (
        <>
          <section className="panel row" style={{ gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" width={56} height={56} style={{ borderRadius: 'var(--r-md)', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            ) : (
              <span style={{ width: 56, height: 56, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700, fontSize: 'var(--fs-lg)', borderRadius: 'var(--r-md)' }}>
                {profile?.name[0]?.toUpperCase()}
              </span>
            )}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>{profile?.name}</div>
              <div className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>
                Signed in with {profile?.provider[0].toUpperCase()}{profile?.provider.slice(1)}{profile?.email ? ` · ${profile.email}` : ''}
              </div>
            </div>
            <button className="btn" onClick={() => signOut()}><LogOut size={15} /> Sign out</button>
          </section>

          <section className="panel stack" style={{ marginTop: 'var(--sp-4)' }}>
            <div className="row">
              {sync === 'error' || sync === 'offline' ? <CloudOff size={18} color="var(--warning)" /> : <Cloud size={18} color="var(--good)" />}
              <strong>
                {sync === 'syncing' ? 'Syncing…' : sync === 'error' ? 'Sync problem' : sync === 'offline' ? 'Offline — will sync when you reconnect' : 'Progress synced'}
              </strong>
              <span className="spacer" />
              <button className="btn btn-sm" onClick={() => syncNow()} disabled={sync === 'syncing'}><RefreshCw size={13} /> Sync now</button>
            </div>
            {lastSyncedAt && <p className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>Last synced {new Date(lastSyncedAt).toLocaleTimeString()}. Changes sync automatically within 30 seconds.</p>}
            {error && <p role="alert" style={{ color: 'var(--critical)', fontSize: 'var(--fs-sm)' }}>{error}</p>}
          </section>

          <section className="panel stack" style={{ marginTop: 'var(--sp-4)' }}>
            <h2 style={{ fontSize: 'var(--fs-md)' }}>Your data</h2>
            <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
              Deleting your cloud data removes everything stored in your account. Progress on this device stays until you reset it in Settings.
            </p>
            {confirmDelete ? (
              <div className="row" role="alert" style={{ flexWrap: 'wrap' }}>
                <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Permanently delete your cloud copy? This can’t be undone.</span>
                <button className="btn btn-danger" onClick={async () => { if (await deleteCloudData()) { setConfirmDelete(false); await signOut({ skipSync: true }); } }}>Delete and sign out</button>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            ) : (
              <button className="btn btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete cloud data</button>
            )}
          </section>
        </>
      )}
    </div>
  );
}
