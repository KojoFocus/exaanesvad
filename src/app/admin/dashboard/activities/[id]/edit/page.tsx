import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateActivity } from '../../actions';
import styles from '../../../products/new/page.module.css';

export const metadata = { title: 'Edit Activity' };

export default async function EditActivityPage({ params }: { params: { id: string } }) {
  const a = await prisma.activity.findUnique({ where: { id: params.id } });
  if (!a) notFound();

  const action = updateActivity.bind(null, a.id);
  const dateStr = new Date(a.activityDate).toISOString().split('T')[0];

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Edit activity</h1><p className={styles.sub}>{a.title}</p></div>
        <Link href="/admin/dashboard/activities" className="btn">← Back</Link>
      </div>
      <form action={action} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Details</h2>
          <div className={styles.fg}><label className={styles.label}>Title <span className={styles.req}>*</span></label><input name="title" required defaultValue={a.title} className={styles.input} /></div>
          <div className={styles.fg}><label className={styles.label}>Summary <span className={styles.req}>*</span></label><input name="summary" required defaultValue={a.summary} className={styles.input} /></div>
          <div className={styles.fg}><label className={styles.label}>Full content</label><textarea name="content" defaultValue={a.content} className={styles.textarea} /></div>
          <div className={styles.row}>
            <div className={styles.fg}><label className={styles.label}>Date <span className={styles.req}>*</span></label><input name="activityDate" type="date" required defaultValue={dateStr} className={styles.input} /></div>
            <div className={styles.fg}><label className={styles.label}>Location <span className={styles.req}>*</span></label><input name="location" required defaultValue={a.location} className={styles.input} /></div>
            <div className={styles.fg}><label className={styles.label}>Category</label>
              <select name="category" defaultValue={a.category} className={styles.select}>
                <option>Training</option><option>Workshop</option><option>Outreach</option><option>Certification</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Visibility</h2>
          <div className={styles.checkRow}><label className={styles.checkLabel}><input type="checkbox" name="published" defaultChecked={a.published} className={styles.check} /> Published</label></div>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/dashboard/activities" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary">Save changes</button>
        </div>
      </form>
    </div>
  );
}
