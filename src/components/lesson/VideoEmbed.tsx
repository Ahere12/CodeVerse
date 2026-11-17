import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { siYoutube } from 'simple-icons';
import { VIDEO_KIND_LABEL, type Video } from '../../content/videos';

/**
 * Privacy-friendly YouTube embed: nothing is requested from YouTube (not even a
 * thumbnail) until the learner presses play. Then it loads from youtube-nocookie.com.
 */
export function VideoEmbed({ video, compact }: { video: Video; compact?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <figure className="video" style={{ margin: 0 }}>
      <div className="video-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button className="video-facade" onClick={() => setPlaying(true)} aria-label={`Play video: ${video.title} by ${video.author}`}>
            <span className="video-play"><Play size={compact ? 20 : 26} fill="currentColor" aria-hidden /></span>
            <span className="video-facade-title">{video.title}</span>
            <span className="video-facade-meta">
              <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden><path d={siYoutube.path} /></svg>
              {video.author} · {VIDEO_KIND_LABEL[video.kind]}
            </span>
            <span className="video-facade-note">Loads from YouTube when you press play</span>
          </button>
        )}
      </div>
      <figcaption className="row subtle" style={{ fontSize: 'var(--fs-xs)', marginTop: 6, justifyContent: 'space-between' }}>
        <span>{video.author}</span>
        <a href={watchUrl} target="_blank" rel="noreferrer noopener" className="row link" style={{ gap: 4 }}>Watch on YouTube <ExternalLink size={12} /></a>
      </figcaption>
    </figure>
  );
}

export function LessonVideos({ videos }: { videos: Video[] }) {
  const [open, setOpen] = useState(false);
  if (!videos.length) return null;
  return (
    <section className="panel" style={{ padding: 'var(--sp-4)' }} aria-label="Videos for this lesson">
      <button className="row" onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ width: '100%', background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}>
        <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden style={{ color: 'var(--critical)' }}><path d={siYoutube.path} /></svg>
        <span style={{ fontWeight: 600 }}>Prefer watching?</span>
        <span className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>{videos.length} video{videos.length > 1 ? 's' : ''} on this topic</span>
        <span className="spacer" />
        <span className="link" style={{ fontSize: 'var(--fs-sm)' }}>{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: videos.length > 1 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr', gap: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
          {videos.map((v) => <VideoEmbed key={v.id} video={v} compact={videos.length > 1} />)}
        </div>
      )}
    </section>
  );
}
