import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = { title: 'Gallery' };
export const dynamic = 'force-dynamic';

const CATEGORIES = ['Trainings', 'Products', 'Community'];

type GalleryPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function GalleryPage({
  searchParams,
}: GalleryPageProps) {
  const { category } = await searchParams;
  const activeCategory = category ?? null;

  const items = await prisma.galleryItem.findMany({
    where: activeCategory ? { category: activeCategory } : {},
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>Visual story</p>
        <h1 className={styles.h1}>Gallery</h1>
        <p className={styles.sub}>Field activities, trainings, and community moments.</p>
      </div>

      <div className={styles.inner}>
        <div className={styles.chipRow}>
          <Link
            href="/gallery"
            className={`${styles.chip} ${!activeCategory ? styles.chipActive : styles.chipInactive}`}
          >
            All
          </Link>
          {CATEGORIES.map(c => (
            <Link
              key={c}
              href={`/gallery?category=${c}`}
              className={`${styles.chip} ${activeCategory === c ? styles.chipActive : styles.chipInactive}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            No photos yet{activeCategory ? ` in ${activeCategory}` : ''}.
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => (
              <div key={item.id} className={styles.cell}>
                <Image
                  src={item.image}
                  alt={item.caption ?? 'Gallery image'}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                {item.caption && (
                  <div className={styles.caption}>{item.caption}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
