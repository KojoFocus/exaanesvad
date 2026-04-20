import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = { title: 'Videos' };
export const dynamic = 'force-dynamic';

type VideosPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const { category } = await searchParams;
  const activeCategory = category ?? null;

  const videos = await prisma.video.findMany({
    where: {
      published: true,
      ...(activeCategory ? { category: activeCategory } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  const allCategories = await prisma.video.findMany({
    where: { published: true, category: { not: null } },
    select: { category: true },
  });
  const categories = Array.from(new Set(allCategories.map(v => v.category).filter((c): c is string => !!c)));

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>Media & stories</p>
        <h1 className={styles.h1}>Videos</h1>
        <p className={styles.sub}>Watch field activities, training sessions, and community stories from EXA-ANESVAD programmes.</p>
      </div>

      <div className={styles.inner}>
        {categories.length > 0 && (
          <div className={styles.chipRow}>
            <Link
              href="/videos"
              className={`${styles.chip} ${!activeCategory ? styles.chipActive : styles.chipInactive}`}
            >
              All
            </Link>
            {categories.map(c => (
              <Link
                key={c}
                href={`/videos?category=${encodeURIComponent(c)}`}
                className={`${styles.chip} ${activeCategory === c ? styles.chipActive : styles.chipInactive}`}
              >
                {c}
              </Link>
            ))}
          </div>
        )}

        {videos.length === 0 ? (
          <div className={styles.empty}>No videos published yet.</div>
        ) : (
          <div className={styles.grid}>
            {videos.map(v => (
              <div key={v.id} className={styles.card}>
                <a
                  href={v.videoUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cardThumb}
                  aria-label={`Watch ${v.title}`}
                >
                  {v.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnail ?? undefined} alt={v.title} className={styles.thumbImg} />
                  ) : (
                    <div className={styles.thumbPlaceholder}>
                      <span className={styles.playIcon}>▶</span>
                    </div>
                  )}
                  <div className={styles.playOverlay}>
                    <span className={styles.playBtn}>▶</span>
                  </div>
                </a>
                <div className={styles.cardBody}>
                  {v.category && <p className={styles.cardCat}>{v.category}</p>}
                  <p className={styles.cardTitle}>{v.title}</p>
                  {v.description && <p className={styles.cardDesc}>{v.description}</p>}
                  <a
                    href={v.videoUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.watchLink}
                  >
                    Watch video →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
