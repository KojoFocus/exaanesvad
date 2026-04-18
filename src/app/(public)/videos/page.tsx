import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const metadata = { title: 'Videos' };
export const revalidate = 60;

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = Array.from(new Set(videos.map(v => v.category).filter((c): c is string => !!c)));

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>Media & stories</p>
        <h1 className={styles.h1}>Videos</h1>
        <p className={styles.sub}>Watch field activities, training sessions, and community stories from EXA-ANESVAD programmes.</p>
      </div>

      <div className={styles.inner}>
        {categories.length > 1 && (
          <div className={styles.chipRow}>
            <span className={`${styles.chip} ${styles.chipActive}`}>All</span>
            {categories.map(c => (
              <span key={c} className={styles.chip}>{c}</span>
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
