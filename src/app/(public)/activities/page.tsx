import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { fieldPhoto } from '@/lib/fieldPhotos';
import styles from './page.module.css';

export const metadata = { title: 'Activities' };
export const revalidate = 60;

const CATEGORIES = ['Training', 'Workshop', 'Outreach', 'Certification'];

type ActivitiesPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ActivitiesPage({
  searchParams,
}: ActivitiesPageProps) {
  const { category } = await searchParams;
  const activeCategory = category ?? null;

  const activities = await prisma.activity.findMany({
    where: {
      published: true,
      ...(activeCategory ? { category: activeCategory } : {}),
    },
    orderBy: { activityDate: 'desc' },
  });

  const [featured, ...rest] = activities;

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>Field work &amp; programmes</p>
        <h1 className={styles.h1}>Activities &amp; Trainings</h1>
        <p className={styles.headSub}>
          On-the-ground work across communities in Ghana — skills training, workshops,
          outreach, and programme milestones.
        </p>
      </div>

      <div className={styles.inner}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Filter</span>
          <Link
            href="/activities"
            className={`${styles.chip} ${!activeCategory ? styles.chipActive : ''}`}
          >
            All
          </Link>
          {CATEGORIES.map(c => (
            <Link
              key={c}
              href={`/activities?category=${c}`}
              className={`${styles.chip} ${activeCategory === c ? styles.chipActive : ''}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {activities.length === 0 ? (
          <div className={styles.empty}>
            No {activeCategory ? activeCategory.toLowerCase() : ''} activities published yet.
            {activeCategory && (
              <> <Link href="/activities" style={{ color: 'var(--green)' }}>View all →</Link></>
            )}
          </div>
        ) : (
          <>
            {featured && (
              <Link href={`/activities/${featured.slug}`} className={styles.featuredCard}>
                <div className={styles.featuredImgWrap}>
                  <Image
                    src={featured.featuredImage ?? fieldPhoto(0)}
                    alt={featured.title}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </div>
                <div className={styles.featuredBody}>
                  <div className={styles.featuredTag}>
                    <span className={styles.featuredCat}>{featured.category}</span>
                    <span className={styles.featuredDot} />
                    <span className={styles.featuredDate}>
                      {new Date(featured.activityDate).toLocaleDateString('en-GH', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className={styles.featuredTitle}>{featured.title}</p>
                  {featured.summary && (
                    <p className={styles.featuredSummary}>{featured.summary}</p>
                  )}
                  <span className={styles.readLink}>Read full story →</span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className={styles.grid}>
                {rest.map(a => (
                  <Link key={a.id} href={`/activities/${a.slug}`} className={styles.card}>
                    <div className={styles.cardImgWrap}>
                      <Image
                        src={a.featuredImage ?? fieldPhoto(rest.indexOf(a) + 1)}
                        alt={a.title}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardCat}>{a.category}</span>
                        <span className={styles.cardMetaDot} />
                        <span className={styles.cardDate}>
                          {new Date(a.activityDate).toLocaleDateString('en-GH', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className={styles.cardTitle}>{a.title}</p>
                      {a.summary && <p className={styles.cardSummary}>{a.summary}</p>}
                      <span className={styles.cardLink}>
                        Read more <span className={styles.cardArrow}>→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
