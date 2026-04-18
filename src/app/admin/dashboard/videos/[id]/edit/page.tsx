import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { updateVideo } from '../../actions';
import Link from 'next/link';
import styles from '../../../products/new/page.module.css';

export const metadata = { title: 'Edit Video' };

const CATEGORIES = ['Training', 'Workshop', 'Community', 'Impact', 'General'];

type EditVideoPageProps = { params: Promise<{ id: string }> };

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) notFound();

  const action = updateVideo.bind(null, video.id);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Edit video</h1>
          <p className={styles.sub}>{video.title}</p>
        </div>
        <Link href="/admin/dashboard/videos" className="btn">← Back</Link>
      </div>

      <form action={action} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Video details</h2>

          <div className={styles.fg}>
            <label className={styles.label}>Title <span className={styles.req}>*</span></label>
            <input name="title" required className={styles.input} defaultValue={video.title} />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Description</label>
            <textarea name="description" className={styles.textarea} defaultValue={video.description ?? ''} />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Category</label>
            <select name="category" className={styles.select} defaultValue={video.category ?? undefined}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Links</h2>

          <div className={styles.fg}>
            <label className={styles.label}>Video URL <span className={styles.req}>*</span></label>
            <input name="videoUrl" type="url" required className={styles.input} defaultValue={video.videoUrl ?? ''} />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Embed URL</label>
            <input name="embedUrl" type="url" className={styles.input} defaultValue={video.embedUrl ?? undefined} />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Thumbnail URL</label>
            <input name="thumbnail" type="url" className={styles.input} defaultValue={video.thumbnail ?? undefined} />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Visibility</h2>
          <div className={styles.checkRow}>
            <label className={styles.checkLabel}>
              <input type="checkbox" name="published" className={styles.check} defaultChecked={video.published} />
              Published
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/admin/dashboard/videos" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary">Save changes</button>
        </div>
      </form>
    </div>
  );
}
