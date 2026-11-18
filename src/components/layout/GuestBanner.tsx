import { Link, useLocation } from 'react-router-dom';
import { CloudOff } from 'lucide-react';
import { cloudConfigured } from '../../lib/supabase';
import { useAuth } from '../../store/useAuth';

/** Reminds guests that progress is only kept for signed-in learners. */
export function GuestBanner() {
  const { ready, user, error } = useAuth();
  const { pathname } = useLocation();
  if (!cloudConfigured || !ready || user || pathname === '/account') return null;
  if (error) {
    return (
      <div className="guest-banner" role="alert">
        <CloudOff size={15} aria-hidden />
        <span>{error}</span>
        <Link to="/account" className="btn btn-sm btn-primary">Try again</Link>
      </div>
    );
  }
  return (
    <div className="guest-banner" role="status">
      <CloudOff size={15} aria-hidden />
      <span><strong>You’re not signed in.</strong> Your progress will be lost when you close this tab.</span>
      <Link to="/account" className="btn btn-sm btn-primary">Sign in to save</Link>
    </div>
  );
}
