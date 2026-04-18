import { prisma } from '@/lib/prisma';
import { deleteGalleryItem } from './actions';
import DeleteButton from '@/components/admin/DeleteButton';
import styles from './page.module.css';
import Image from 'next/image';

export const metadata = { title: 'Gallery' };

export default async function GalleryAdminPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  return (
    <div>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Gallery</h1><p className={styles.sub}>{items.length} photos</p></div>
      </div>
      <div className={styles.uploadNote}>Image upload requires Cloudinary. Use the API route <code>POST /api/upload</code> with a <code>multipart/form-data</code> body containing <code>file</code> and <code>folder=gallery</code>.</div>
      <div className={styles.grid}>
        {items.map(item => (
          <div key={item.id} className={styles.cell}>
            <Image src={item.image} alt={item.caption ?? ''} fill style={{objectFit:'cover'}} />
            <div className={styles.cellOverlay}>
              <form action={deleteGalleryItem.bind(null, item.id)}>
                <DeleteButton className={styles.delBtn} message="Remove this photo?">Remove</DeleteButton>
              </form>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className={styles.empty}>No photos yet.</div>}
      </div>
    </div>
  );
}
