'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  lessonId: string;
  videoId: string | null;
  otp: { otp: string; playbackInfo: string } | null;
  durationSeconds: number;
}

/**
 * Video player wrapping VdoCipher's embed iframe.
 *
 * Progress tracking strategy:
 *  - Every 30 seconds while playing, POST current watched seconds to /api/lessons/progress
 *  - On page unload, send a final beacon
 *  - When the user has watched >= 90% of the video, mark complete
 *
 * VdoCipher's iframe exposes a postMessage API. We listen for time updates.
 */
export function VideoPlayer({ lessonId, videoId, otp, durationSeconds }: Props) {
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);
  const lastSyncedRef = useRef(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Listen for time updates from VdoCipher iframe
  useEffect(() => {
    if (!videoId || !otp) return;

    function onMessage(ev: MessageEvent) {
      try {
        if (!iframeRef.current || ev.source !== iframeRef.current.contentWindow) return;
        const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        if (data && typeof data.currentTime === 'number') {
          setWatchedSeconds((prev) => Math.max(prev, Math.floor(data.currentTime)));
        }
      } catch {
        // ignore non-JSON messages
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [videoId, otp]);

  // Sync progress to server every 30s
  useEffect(() => {
    if (watchedSeconds === 0) return;
    if (watchedSeconds - lastSyncedRef.current < 30) return;
    lastSyncedRef.current = watchedSeconds;

    const isComplete =
      durationSeconds > 0 && watchedSeconds >= durationSeconds * 0.9;

    fetch('/api/lessons/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId,
        watchedSeconds,
        completed: isComplete,
      }),
    }).catch(() => {/* swallow */});

    if (isComplete && !completed) setCompleted(true);
  }, [watchedSeconds, durationSeconds, lessonId, completed]);

  // Beacon on unload
  useEffect(() => {
    function onBeforeUnload() {
      if (watchedSeconds > lastSyncedRef.current) {
        try {
          navigator.sendBeacon(
            '/api/lessons/progress',
            new Blob(
              [JSON.stringify({ lessonId, watchedSeconds })],
              { type: 'application/json' }
            )
          );
        } catch {/* ignore */}
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [lessonId, watchedSeconds]);

  // Render: video missing, OTP missing, or successful player
  if (!videoId) {
    return (
      <PlaceholderBlock
        title="Video coming soon"
        body="The instructor hasn't uploaded this lesson's video yet. Other lesson types (text, PDF) still work normally."
      />
    );
  }

  if (!otp) {
    return (
      <PlaceholderBlock
        title="Video playback unavailable"
        body="VdoCipher isn't configured yet (or the OTP couldn't be minted). Set VDOCIPHER_API_SECRET in your environment and reload."
      />
    );
  }

  const embedUrl = `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(
    otp.otp
  )}&playbackInfo=${encodeURIComponent(otp.playbackInfo)}`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-ink/10 bg-ink">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        allowFullScreen
        allow="encrypted-media"
        title="Lesson video"
      />
    </div>
  );
}

function PlaceholderBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-ink/15 bg-bg-alt/40 p-8 text-center">
      <div className="eyebrow text-ink-subtle">[ {title} ]</div>
      <p className="max-w-md text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
