import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteActivity, toggleActivityPublish } from './actions';
import DeleteButton from '@/components/admin/DeleteButton';
import styles from './page.module.css';

export const metadata = { title: 'Activities' };

export default async function ActivitiesAdminPage() {
  const activities = await prisma.activity.findMany({ orderBy: { activityDate: 'desc' } });
  return (
    <div>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Activities</h1><p className={styles.sub}>{activities.length} total</p></div>
        <Link href="/admin/dashboard/activities/new" className="btn btn-primary">+ Add activity</Link>
      </div>
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead><tr><th>Title</th><th>Date</th><th>Location</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {activities.length === 0 ? (
              <tr><td colSpan={6} className={styles.empty}>No activities yet.</td></tr>
            ) : activities.map(a => (
              <tr key={a.id}>
                <td><strong>{a.title}</strong></td>
                <td>{new Date(a.activityDate).toLocaleDateString('en-GH', { month:'short', day:'numeric', year:'numeric' })}</td>
                <td>{a.location}</td>
                <td><span className="badge badge-success">{a.category}</span></td>
                <td><span className={`badge ${a.published ? 'badge-success' : 'badge-neutral'}`}>{a.published ? 'Published' : 'Draft'}</span></td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/dashboard/activities/${a.id}/edit`} className="btn btn-sm">Edit</Link>
                    <form action={toggleActivityPublish.bind(null, a.id, !a.published)} style={{display:'inline'}}>
                      <button type="submit" className="btn btn-sm">{a.published ? 'Unpublish' : 'Publish'}</button>
                    </form>
                    <form action={deleteActivity.bind(null, a.id)} style={{display:'inline'}}>
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
