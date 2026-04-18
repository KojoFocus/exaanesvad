import { createActivity } from '../actions';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import styles from '../../products/new/page.module.css';

export const metadata = { title: 'Add Activity' };

export default function NewActivityPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Add activity</h1><p className={styles.sub}>New field activity or training event</p></div>
        <Link href="/admin/dashboard/activities" className="btn">← Back</Link>
      </div>
      <form action={createActivity} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Details</h2>
          <div className={styles.fg}><label className={styles.label}>Title <span className={styles.req}>*</span></label><input name="title" required className={styles.input} placeholder="e.g. Soap-Making Training: Batch 8" /></div>
          <div className={styles.fg}><label className={styles.label}>Summary <span className={styles.req}>*</span></label><input name="summary" required className={styles.input} placeholder="One-sentence summary" /></div>
          <div className={styles.fg}><label className={styles.label}>Full content</label><textarea name="content" className={styles.textarea} placeholder="Full description of the activity…" /></div>
          <div className={styles.row}>
            <div className={styles.fg}><label className={styles.label}>Date <span className={styles.req}>*</span></label><input name="activityDate" type="date" required className={styles.input} /></div>
            <div className={styles.fg}><label className={styles.label}>Location <span className={styles.req}>*</span></label><input name="location" required className={styles.input} placeholder="e.g. Accra" /></div>
            <div className={styles.fg}><label className={styles.label}>Category</label>
              <select name="category" className={styles.select}>
                <option>Training</option><option>Workshop</option><option>Outreach</option><option>Certification</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Media</h2>
          <ImageUpload name="featuredImage" />
        </div>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Visibility</h2>
          <div className={styles.checkRow}><label className={styles.checkLabel}><input type="checkbox" name="published" className={styles.check} /> Publish immediately</label></div>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/dashboard/activities" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary">Save activity</button>
        </div>
      </form>
    </div>
  );
}
