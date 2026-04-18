'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ImageUploader.module.css';

interface Props {
  name: string;
  label?: string;
  multiple?: boolean;
  initialUrls?: string[];
  folder?: string;
}

export default function ImageUploader({
  name,
  label = 'Images',
  multiple = false,
  initialUrls = [],
  folder = 'exa-anesvad',
}: Props) {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);

    const toUpload = multiple ? Array.from(files) : [files[0]];
    const uploaded: string[] = [];

    for (const file of toUpload) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg);
        }
        const json = await res.json();
        uploaded.push(json.url);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    }

    setUrls(prev => multiple ? [...prev, ...uploaded] : uploaded);
    setUploading(false);
  }

  function removeUrl(idx: number) {
    setUrls(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>{label}</p>

      {/* Hidden inputs carry values to the form */}
      {urls.map((url, i) => (
        <input key={i} type="hidden" name={name} value={url} />
      ))}

      {/* Preview grid */}
      {urls.length > 0 && (
        <div className={styles.previews}>
          {urls.map((url, i) => (
            <div key={i} className={styles.previewWrap}>
              <Image src={url} alt={`Upload ${i + 1}`} fill style={{ objectFit: 'cover' }} />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeUrl(i)}
                aria-label="Remove image"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {(multiple || urls.length === 0) && (
        <div
          className={`${styles.dropZone} ${uploading ? styles.uploading : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          {uploading ? (
            <span className={styles.uploadingText}>Uploading…</span>
          ) : (
            <>
              <span className={styles.dropIcon}>↑</span>
              <span className={styles.dropText}>
                {multiple ? 'Click or drag images to upload' : 'Click or drag to upload image'}
              </span>
              <span className={styles.dropHint}>JPEG, PNG, WebP · max 5 MB</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={multiple}
            className={styles.fileInput}
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
