/**
 * The CodeVerse mark: a "C" drawn as an orbit, a planet in its opening ("verse")
 * and a text cursor inside ("code"). Uses currentColor so every theme can colour it.
 * Standalone files for download live in /public/brand.
 */
export function LogoMark({ size = 28, planet = 'currentColor' }: { size?: number; planet?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden focusable="false">
      <path d="M24.43 8.93 A11 11 0 1 0 24.43 23.07" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="14.4" y="10.5" width="3.2" height="11" rx="1.6" fill="currentColor" />
      <circle cx="27.2" cy="16" r="2.7" fill={planet} />
    </svg>
  );
}
