import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateAnnouncement } from '../../actions';
import styles from '../../../products/new/page.module.css';

export const metadata = { title: 'Edit Announcement' };

type EditAnnouncementPageProps = { params: Promise<{ id: string }> };

export default async function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
  const { id } = await params;
  const a = await prisma.announcement.findUnique({ where: { id } });
  if (!a) notFound();

  const action = updateAnnouncement.bind(null, a.id);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Edit announcement</h1><p className={styles.sub}>{a.title}</p></div>
        <Link href="/admin/dashboard/announcements" className="btn">← Back</Link>
      </div>
      <form action={action} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Content</h2>
          <div className={styles.fg}><label className={styles.label}>Title <span className={styles.req}>*</span></label><input name="title" required defaultValue={a.title} className={styles.input} /></div>
          <div className={styles.fg}><label className={styles.label}>Body</label><textarea name="content" defaultValue={a.content ?? ''} className={styles.textarea} /></div>
        </div>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Options</h2>
          <div className={styles.checkRow}>
            <label className={styles.checkLabel}><input type="checkbox" name="featured" defaultChecked={a.featured} className={styles.check} /> Feature on homepage</label>
            <label className={styles.checkLabel}><input type="checkbox" name="published" defaultChecked={a.published} className={styles.check} /> Published</label>
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/dashboard/announcements" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary">Save changes</button>
        </div>
      </form>
    </div>
  );
}
