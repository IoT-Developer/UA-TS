/**
 * VdoCipher OTP generator.
 *
 * VdoCipher streams DRM-protected videos. The browser cannot directly play them —
 * it needs a one-time OTP (and a "playback info" string) minted by your server
 * using your API secret. We pass these to the embed iframe.
 *
 * Setup:
 *   1. Sign up at vdocipher.com
 *   2. Upload videos, copy each `videoId`
 *   3. Get your API secret from dashboard → Settings → API
 *   4. Set VDOCIPHER_API_SECRET in .env.local
 */

export interface VdoCipherOtp {
  otp: string;
  playbackInfo: string;
}

export async function generateVdoCipherOtp(videoId: string): Promise<VdoCipherOtp | null> {
  const apiSecret = process.env.VDOCIPHER_API_SECRET;
  if (!apiSecret) {
    console.warn('VDOCIPHER_API_SECRET not configured — video playback disabled');
    return null;
  }
  if (!videoId) return null;

  try {
    const res = await fetch(
      `https://dev.vdocipher.com/api/videos/${encodeURIComponent(videoId)}/otp`,
      {
        method: 'POST',
        headers: {
          Authorization: `Apisecret ${apiSecret}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        // OTP valid for 5 hours; one-time-use protects against link sharing
        body: JSON.stringify({ ttl: 300 }),
        // Don't cache — every page load gets a fresh OTP
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('VdoCipher OTP error:', res.status, text);
      return null;
    }

    const data = (await res.json()) as { otp?: string; playbackInfo?: string };
    if (!data.otp || !data.playbackInfo) {
      console.error('VdoCipher returned malformed OTP response:', data);
      return null;
    }
    return { otp: data.otp, playbackInfo: data.playbackInfo };
  } catch (err) {
    console.error('VdoCipher fetch failed:', err);
    return null;
  }
}
