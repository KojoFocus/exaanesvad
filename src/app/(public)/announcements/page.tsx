import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = { title: 'Updates & Announcements' };
export const revalidate = 60;

export default async function AnnouncementsPage() {
  const items = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  const byYear = items.reduce<Record<string, typeof items>>((acc, item) => {
    const year = String(new Date(item.createdAt).getFullYear());
    (acc[year] ??= []).push(item);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>News &amp; updates</p>
        <h1 className={styles.h1}>Updates &amp; Announcements</h1>
        <p className={styles.sub}>News from EXA-ANESVAD programmes, field updates, and partnership milestones.</p>
      </div>

      <div className={styles.inner}>
        {items.length === 0 ? (
          <div className={styles.empty}>No announcements published yet.</div>
        ) : (
          years.map(year => (
            <div key={year} className={styles.yearGroup}>
              <div className={styles.yearLabel}>{year}</div>
              {byYear[year].map(a => {
                const d = new Date(a.createdAt);
                return (
                  <Link key={a.id} href={`/announcements/${a.slug}`} className={styles.card}>
                    <div className={styles.cardDate}>
                      <span className={styles.cardDateDay}>{d.getDate()}</span>
                      <span className={styles.cardDateMonth}>
                        {d.toLocaleDateString('en-GH', { month: 'short' })}
                      </span>
                    </div>
                    <div className={styles.cardDivider} />
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        {a.featured && <span className={styles.featuredBadge}>Featured</span>}
                      </div>
                      <p className={styles.cardTitle}>{a.title}</p>
                      {a.summary && <p className={styles.cardSummary}>{a.summary}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))
        )}
      </div>
    </>
  );
}
