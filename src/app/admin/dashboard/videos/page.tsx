import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteVideo, toggleVideoPublish } from './actions';
import DeleteButton from '@/components/admin/DeleteButton';
import styles from '../products/page.module.css';

export const metadata = { title: 'Videos' };

export default async function VideosAdminPage() {
  const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Videos</h1>
          <p className={styles.sub}>{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/dashboard/videos/new" className="btn btn-primary">+ Add video</Link>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>URL</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr><td colSpan={5} className={styles.empty}>No videos yet. <Link href="/admin/dashboard/videos/new">Add one →</Link></td></tr>
            ) : videos.map(v => (
              <tr key={v.id}>
                <td><span className={styles.productName}>{v.title}</span></td>
                <td>{v.category ?? '—'}</td>
                <td>
                  <a href={v.videoUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: 'var(--green)', textDecoration: 'none', fontFamily: 'var(--sans)' }}>
                    View ↗
                  </a>
                </td>
                <td>
                  <span className={`badge ${v.published ? 'badge-success' : 'badge-neutral'}`}>
                    {v.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/dashboard/videos/${v.id}/edit`} className="btn btn-sm">Edit</Link>
                    <form action={toggleVideoPublish.bind(null, v.id, !v.published)} style={{ display: 'inline' }}>
                      <button type="submit" className="btn btn-sm">{v.published ? 'Unpublish' : 'Publish'}</button>
                    </form>
                    <form action={deleteVideo.bind(null, v.id)} style={{ display: 'inline' }}>
                      <DeleteButton className="btn btn-sm btn-danger" message="Delete this video?">Delete</DeleteButton>
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
