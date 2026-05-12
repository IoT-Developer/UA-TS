/**
 * Cloudinary helpers.
 *
 * Two flows:
 *  1. Unsigned browser upload via the preset (no API secret needed in browser).
 *     Browser POSTs FormData to https://api.cloudinary.com/v1_1/<cloud>/image/upload
 *     with `upload_preset=ua_uploads` and the file. Returns a JSON with secure_url.
 *
 *  2. Server-side delete via the Admin API. Needs the API secret.
 *
 * The cloud name and upload preset are exposed to the browser via NEXT_PUBLIC_ env vars.
 */

import crypto from 'node:crypto';

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ua_uploads';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

export function isCloudinaryConfigured(): boolean {
  return !!CLOUDINARY_CLOUD_NAME && !!CLOUDINARY_UPLOAD_PRESET;
}

export function getUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
}

/**
 * Extract the public_id from a Cloudinary URL (needed to delete).
 * Example URL:
 *   https://res.cloudinary.com/abc/image/upload/v1234/ua-platform/avatars/xyz.jpg
 * Returns: ua-platform/avatars/xyz
 */
export function extractPublicId(url: string): string | null {
  if (!url) return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[a-z]+)?$/i);
    if (!match) return null;
    return match[1];
  } catch {
    return null;
  }
}

/**
 * Server-side: delete an image by public_id (no-op if not configured).
 * Used when admin replaces a cover image, or when a user is hard-deleted.
 */
export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary delete skipped — credentials not configured');
    return false;
  }
  if (!publicId) return false;

  const timestamp = Math.floor(Date.now() / 1000);
  // Signature is SHA-1 of "public_id=<id>&timestamp=<ts><secret>"
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest('hex');

  const form = new URLSearchParams();
  form.set('public_id', publicId);
  form.set('timestamp', String(timestamp));
  form.set('api_key', CLOUDINARY_API_KEY);
  form.set('signature', signature);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: form,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    if (!res.ok) {
      console.error('Cloudinary delete failed:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    return false;
  }
}
