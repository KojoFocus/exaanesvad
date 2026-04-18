'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ImageUpload.module.css';

interface Props {
  name: string;
  defaultValue?: string | null;
  label?: string;
}

export default function ImageUpload({ name, defaultValue, label = 'Featured image' }: Props) {
  const [url, setUrl] = useState<string>(defaultValue ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'activities');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setUrl(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <label className={styles.label}>{label}</label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className={styles.preview}>
          <Image src={url} alt="Featured image" fill style={{ objectFit: 'cover' }} />
          <button
            type="button"
            className={styles.remove}
            onClick={() => { setUrl(''); if (inputRef.current) inputRef.current.value = ''; }}
          >
            ✕ Remove
          </button>
        </div>
      ) : (
        <label className={`${styles.dropzone} ${loading ? styles.loading : ''}`}>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className={styles.fileInput} />
          {loading
            ? <span className={styles.hint}>Uploading…</span>
            : <><span className={styles.icon}>↑</span><span className={styles.hint}>Click to upload image</span><span className={styles.sub}>JPG, PNG, WebP · max 5MB</span></>
          }
        </label>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
