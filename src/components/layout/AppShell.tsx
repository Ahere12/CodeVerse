import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react';
import { NAV } from '../../lib/nav';
import { useAppStore } from '../../store/useAppStore';
import { useToasts } from '../../store/useToasts';
import { levelInfo } from '../../lib/progress';
import { useAchievementWatcher, useApplyPreferences, useCloudSync, useStudyTimer } from '../../lib/hooks';
import { profileOf, useAuth } from '../../store/useAuth';
import { cloudConfigured } from '../../lib/supabase';
import { CommandPalette } from './CommandPalette';

export function AppShell() {
  useApplyPreferences();
  useStudyTimer();
  useAchievementWatcher();
  useCloudSync();
  const user = useAuth((s) => s.user);
  const syncState = useAuth((s) => s.sync);
  const profile = profileOf(user);

  const collapsed = useAppStore((s) => s.prefs.sidebarCollapsed);
  const updatePrefs = useAppStore((s) => s.updatePrefs);
  const xp = useAppStore((s) => s.xp);
  const { level, intoLevel, levelSize } = levelInfo(xp);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer and move focus to content on navigation.
  useEffect(() => {
    setMobileOpen(false);
    document.getElementById('main')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        updatePrefs({ sidebarCollapsed: !useAppStore.getState().prefs.sidebarCollapsed });
      }
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [updatePrefs]);

  return (
    <div className="shell" data-collapsed={collapsed} data-mobile-open={mobileOpen}>
      <a href="#main" className="skip-link">Skip to content</a>

      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">
          <span className="brand-mark" aria-hidden>{'</>'}</span>
          <span className="brand-name">CODEVERSE</span>
          <button className="icon-btn mobile-only" style={{ marginLeft: 'auto' }} onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={17} strokeWidth={1.8} aria-hidden />
                  <span className="nav-label">{item.label}</span>
                  {item.phase && <span className="nav-soon" title="In development">Soon</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="nav-link collapse-toggle"
            style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer' }}
            onClick={() => updatePrefs({ sidebarCollapsed: !collapsed })}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar (Ctrl+\\)' : 'Collapse sidebar (Ctrl+\\)'}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            <span className="nav-label">Collapse</span>
          </button>
        </div>
      </aside>
      <div className="scrim" onClick={() => setMobileOpen(false)} aria-hidden />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>
          <button className="search-trigger" onClick={() => setPaletteOpen(true)} aria-label="Search CodeVerse (Ctrl+K)">
            <Search size={15} aria-hidden />
            <span>Search lessons, languages…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="spacer" />
          <NavLink to="/profile" className="topbar-xp" title={`${intoLevel} / ${levelSize} XP to level ${level + 1}`}>
            <span className="level-chip" aria-label={`Level ${level}`}>{level}</span>
            <span className="xp-text mono">{xp.toLocaleString()} XP</span>
          </NavLink>
          {cloudConfigured && (
            <NavLink to="/account" className="avatar-link" title={profile ? `${profile.name} · ${syncState === 'error' ? 'sync problem' : 'synced'}` : 'Sign in'}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} width={28} height={28} referrerPolicy="no-referrer" />
              ) : profile ? (
                <span aria-label={profile.name}>{profile.name[0].toUpperCase()}</span>
              ) : (
                <span className="btn btn-sm btn-primary">Sign in</span>
              )}
              {profile && syncState === 'error' && <span className="avatar-dot" aria-label="Sync problem" />}
            </NavLink>
          )}
        </header>
        <main id="main" className="content" tabIndex={-1} style={{ outline: 'none' }}>
          <Outlet />
        </main>
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      <Toasts />
    </div>
  );
}

function Toasts() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{t.title}</div>
            {t.body && <div className="muted">{t.body}</div>}
          </div>
          <button className="icon-btn" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
