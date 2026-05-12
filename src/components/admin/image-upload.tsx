'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface Props {
  /** Current image URL (from DB). */
  value: string | null;
  /** Called after successful upload with the new secure_url. */
  onUploaded: (url: string) => void;
  /** Called when user clears the image. */
  onCleared?: () => void;
  /** Visual variant: rectangular cover (16:9) or circular avatar (1:1). */
  shape?: 'cover' | 'avatar' | 'logo';
  /** Folder suffix inside ua-platform/ (e.g. "courses", "avatars", "tech-icons"). */
  folder?: string;
  /** Label shown above the upload area. */
  label?: string;
  /** Helper text below the upload area. */
  hint?: string;
  /** Max file size in MB (defaults to 2). */
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onUploaded,
  onCleared,
  shape = 'cover',
  folder = 'misc',
  label,
  hint,
  maxSizeMB = 2,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ua_uploads';

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!cloudName) {
        setError('Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.');
        return;
      }

      // Size check
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large (max ${maxSizeMB}MB)`);
        return;
      }

      // Type check
      if (!/^image\/(jpeg|png|webp|svg\+xml)$/.test(file.type)) {
        setError('Only JPG, PNG, WEBP, or SVG allowed');
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', `ua-platform/${folder}`);

        // Use XMLHttpRequest for progress events
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(
            'POST',
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
          );
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error('Bad response from Cloudinary'));
              }
            } else {
              let errMsg = `Upload failed (HTTP ${xhr.status})`;
              try {
                const data = JSON.parse(xhr.responseText);
                if (data?.error?.message) errMsg = data.error.message;
              } catch {/* ignore */}
              reject(new Error(errMsg));
            }
          });
          xhr.addEventListener('error', () => reject(new Error('Network error')));
          xhr.send(formData);
        });

        onUploaded(result.secure_url);
        setProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [cloudName, uploadPreset, folder, maxSizeMB, onUploaded]
  );

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    if (onCleared) onCleared();
    onUploaded('');
  }

  const aspectClass = shape === 'avatar'
    ? 'aspect-square rounded-full'
    : shape === 'logo'
    ? 'aspect-square rounded-xl'
    : 'aspect-video rounded-xl';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted">
          {label}
        </label>
      )}

      {value ? (
        // Preview state
        <div className={`relative w-full ${shape === 'avatar' ? 'max-w-32' : 'max-w-md'}`}>
          <div className={`relative overflow-hidden bg-bg-alt ${aspectClass} border border-ink/15`}>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-full border border-ink/20 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-ink-muted hover:border-ink hover:text-ink disabled:opacity-50"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={uploading}
              className="rounded-full border border-red-300 bg-red-50 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        // Empty state — drag-drop area
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer items-center justify-center border-2 border-dashed transition ${aspectClass} ${
            shape === 'avatar' ? 'max-w-32' : 'max-w-md'
          } ${
            dragOver ? 'border-accent bg-accent/5' : 'border-ink/20 bg-bg hover:border-ink/40 hover:bg-bg-alt'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <div className="text-center">
              <div className="font-mono text-xs uppercase tracking-widest text-ink-muted">
                Uploading…
              </div>
              <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 font-mono text-xs text-ink-subtle">{progress}%</div>
            </div>
          ) : (
            <div className="text-center px-4">
              <div className="text-2xl">↑</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-muted">
                {shape === 'avatar' ? 'Add photo' : 'Drop or click'}
              </div>
              {shape !== 'avatar' && (
                <div className="mt-1 text-[0.65rem] text-ink-subtle">
                  JPG, PNG, WEBP · max {maxSizeMB}MB
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleSelect}
        className="hidden"
      />

      {hint && !error && <p className="text-xs text-ink-subtle">{hint}</p>}
      {error && <p className="font-mono text-xs text-red-600">→ {error}</p>}
    </div>
  );
}
