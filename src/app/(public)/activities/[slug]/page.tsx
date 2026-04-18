import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fieldPhoto } from '@/lib/fieldPhotos';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

type ActivityDetailPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ActivityDetailPageProps) {
  const { slug } = await params;
  const activity = await prisma.activity.findUnique({ where: { slug } });
  if (!activity) return {};
  return { title: activity.title, description: activity.summary };
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { slug } = await params;
  const [activity, related] = await Promise.all([
    prisma.activity.findUnique({ where: { slug, published: true } }),
    prisma.activity.findMany({
      where: { published: true },
      orderBy: { activityDate: 'desc' },
      take: 4,
    }),
  ]);

  if (!activity) notFound();

  const gallery: string[] = Array.isArray(activity.gallery) ? activity.gallery as string[] : [];
  const relatedActivities = related.filter(a => a.id !== activity.id).slice(0, 3);

  const BADGE_COLOR: Record<string, string> = {
    Training:      '#1C4A1C',
    Workshop:      '#92400E',
    Certification: '#1C4A1C',
    Outreach:      '#0C447C',
  };

  return (
    <>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroImg}>
          <Image
            src={activity.featuredImage ?? fieldPhoto(0)}
            alt={activity.title}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <Link href="/activities" className={styles.backLink}>← All activities</Link>
          <span
            className={styles.badge}
            style={{ color: BADGE_COLOR[activity.category] ?? '#555' }}
          >
            {activity.category}
          </span>
          <h1 className={styles.title}>{activity.title}</h1>
          <div className={styles.meta}>
            <span>{new Date(activity.activityDate).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className={styles.metaDot}>·</span>
            <span>{activity.location}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.bodyInner}>
          {/* Summary lead */}
          <p className={styles.lead}>{activity.summary}</p>

          {/* Full content */}
          {activity.content && (
            <div className={styles.content}>
              {activity.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {/* Video embed */}
          {activity.videoUrl && (
            <div className={styles.videoWrap}>
              <iframe
                src={activity.videoUrl.replace('watch?v=', 'embed/')}
                title={activity.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <div className={styles.gallerySection}>
              <p className={styles.gallerySectionLabel}>Photos from this activity</p>
              <div className={styles.galleryGrid}>
                {gallery.map((src, i) => (
                  <div key={i} className={styles.galleryCell}>
                    <Image src={src} alt={`${activity.title} photo ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <p className={styles.sideLabel}>Activity details</p>
            <div className={styles.sideItem}>
              <span className={styles.sideKey}>Date</span>
              <span>{new Date(activity.activityDate).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className={styles.sideItem}>
              <span className={styles.sideKey}>Location</span>
              <span>{activity.location}</span>
            </div>
            <div className={styles.sideItem}>
              <span className={styles.sideKey}>Category</span>
              <span>{activity.category}</span>
            </div>
          </div>

          <div className={styles.sideImpact}>
            <p className={styles.sideImpactText}>
              This programme is part of EXA-ANESVAD's mission to train and empower marginalised communities through vocational skills and enterprise development.
            </p>
            <Link href="/about" className={styles.sideImpactLink}>Learn about our mission →</Link>
          </div>
        </aside>
      </div>

      {/* Related */}
      {relatedActivities.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedHead}>
            <p className={styles.relatedLabel}>More activities</p>
            <Link href="/activities" className={styles.relatedAll}>View all →</Link>
          </div>
          <div className={styles.relatedGrid}>
            {relatedActivities.map(a => (
              <Link key={a.id} href={`/activities/${a.slug}`} className={styles.relCard}>
                <div className={styles.relImgWrap}>
                  <Image
                    src={a.featuredImage ?? fieldPhoto(relatedActivities.indexOf(a) + 1)}
                    alt={a.title}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </div>
                <p className={styles.relCat}>{a.category}</p>
                <p className={styles.relTitle}>{a.title}</p>
                <p className={styles.relDate}>
                  {new Date(a.activityDate).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', year: 'numeric' })} · {a.location}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
