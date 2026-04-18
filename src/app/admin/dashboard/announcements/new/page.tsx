import { createAnnouncement } from '../actions';
import Link from 'next/link';
import styles from '../../products/new/page.module.css';

export const metadata = { title: 'New Announcement' };

export default function NewAnnouncementPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>New announcement</h1><p className={styles.sub}>Publish an update or notice</p></div>
        <Link href="/admin/dashboard/announcements" className="btn">← Back</Link>
      </div>
      <form action={createAnnouncement} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Content</h2>
          <div className={styles.fg}><label className={styles.label}>Title <span className={styles.req}>*</span></label><input name="title" required className={styles.input} placeholder="Announcement title" /></div>
          <div className={styles.fg}><label className={styles.label}>Body</label><textarea name="content" className={styles.textarea} placeholder="Additional details (optional)…" /></div>
        </div>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Options</h2>
          <div className={styles.checkRow}>
            <label className={styles.checkLabel}><input type="checkbox" name="featured" className={styles.check} /> Feature on homepage</label>
            <label className={styles.checkLabel}><input type="checkbox" name="published" className={styles.check} /> Publish immediately</label>
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/dashboard/announcements" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary">Publish announcement</button>
        </div>
      </form>
    </div>
  );
}
