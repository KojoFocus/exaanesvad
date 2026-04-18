import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteAnnouncement } from './actions';
import DeleteButton from '@/components/admin/DeleteButton';
import styles from './page.module.css';

export const metadata = { title: 'Announcements' };

export default async function AnnouncementsAdminPage() {
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Announcements</h1><p className={styles.sub}>{items.length} total</p></div>
        <Link href="/admin/dashboard/announcements/new" className="btn btn-primary">+ New announcement</Link>
      </div>
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead><tr><th>Title</th><th>Featured</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className={styles.empty}>No announcements yet.</td></tr>
            ) : items.map(a => (
              <tr key={a.id}>
                <td><strong>{a.title}</strong></td>
                <td>{a.featured ? '★' : '—'}</td>
                <td><span className={`badge ${a.published ? 'badge-success' : 'badge-neutral'}`}>{a.published ? 'Published' : 'Draft'}</span></td>
                <td style={{color:'var(--ink3)'}}>{new Date(a.createdAt).toLocaleDateString('en-GH', { month:'short', day:'numeric' })}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/dashboard/announcements/${a.id}/edit`} className="btn btn-sm">Edit</Link>
                    <form action={deleteAnnouncement.bind(null, a.id)} style={{display:'inline'}}>
                      <DeleteButton className="btn btn-sm btn-danger">Delete</DeleteButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
