import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export const revalidate = 60;

type AnnouncementDetailPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: AnnouncementDetailPageProps) {
  const { slug } = await params;
  const item = await prisma.announcement.findUnique({ where: { slug } });
  if (!item) return {};
  return { title: item.title, description: item.summary };
}

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
  const { slug } = await params;
  const [item, recent] = await Promise.all([
    prisma.announcement.findUnique({ where: { slug, published: true } }),
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ]);

  if (!item) notFound();

  const others = recent.filter(a => a.id !== item.id).slice(0, 3);

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Main */}
        <article className={styles.article}>
          <Link href="/announcements" className={styles.back}>← All updates</Link>

          <header className={styles.header}>
            {item.featured && <span className={styles.featuredBadge}>Featured</span>}
            <h1 className={styles.title}>{item.title}</h1>
            <div className={styles.meta}>
              <time dateTime={item.createdAt.toISOString()}>
                {new Date(item.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
              <span className={styles.metaDot}>·</span>
              <span>EXA-ANESVAD</span>
            </div>
          </header>

          <p className={styles.lead}>{item.summary}</p>

          <div className={styles.rule} />

          <div className={styles.content}>
            {item.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {others.length > 0 && (
            <div className={styles.sideSection}>
              <p className={styles.sideLabel}>More updates</p>
              {others.map(a => (
                <Link key={a.id} href={`/announcements/${a.slug}`} className={styles.sideItem}>
                  <p className={styles.sideItemDate}>
                    {new Date(a.createdAt).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className={styles.sideItemTitle}>{a.title}</p>
                </Link>
              ))}
              <Link href="/announcements" className={styles.sideAllLink}>View all updates →</Link>
            </div>
          )}

          <div className={styles.sideAbout}>
            <p className={styles.sideAboutText}>
              EXA-ANESVAD is a socio-economic empowerment programme training marginalised communities in Ghana through vocational skills, enterprise development, and direct market access.
            </p>
            <Link href="/about" className={styles.sideAboutLink}>About the programme →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
