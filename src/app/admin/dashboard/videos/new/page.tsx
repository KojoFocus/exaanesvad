import { createVideo } from '../actions';
import Link from 'next/link';
import styles from '../../products/new/page.module.css';

export const metadata = { title: 'Add Video' };

const CATEGORIES = ['Training', 'Workshop', 'Community', 'Impact', 'General'];

export default function NewVideoPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Add video</h1>
          <p className={styles.sub}>Add a YouTube or other video to the media library</p>
        </div>
        <Link href="/admin/dashboard/videos" className="btn">← Back</Link>
      </div>

      <form action={createVideo} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Video details</h2>

          <div className={styles.fg}>
            <label className={styles.label}>Title <span className={styles.req}>*</span></label>
            <input name="title" required className={styles.input} placeholder="e.g. Soap Making Training — Batch 7" />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Description</label>
            <textarea name="description" className={styles.textarea} placeholder="Brief description of the video…" />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Category</label>
            <select name="category" className={styles.select}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Links</h2>

          <div className={styles.fg}>
            <label className={styles.label}>Video URL <span className={styles.req}>*</span></label>
            <input name="videoUrl" type="url" required className={styles.input} placeholder="https://youtube.com/watch?v=..." />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Embed URL <span style={{ color: '#bbb', fontWeight: 400 }}>(optional — for iframe embed)</span></label>
            <input name="embedUrl" type="url" className={styles.input} placeholder="https://youtube.com/embed/..." />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Thumbnail URL <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label>
            <input name="thumbnail" type="url" className={styles.input} placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Visibility</h2>
          <div className={styles.checkRow}>
            <label className={styles.checkLabel}>
              <input type="checkbox" name="published" className={styles.check} />
              Publish immediately
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/admin/dashboard/videos" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary">Save video</button>
        </div>
      </form>
    </div>
  );
}
