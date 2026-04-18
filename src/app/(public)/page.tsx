import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import HeroCarousel from '@/components/HeroCarousel';
import { fieldPhoto } from '@/lib/fieldPhotos';
import styles from './home.module.css';

export const dynamic = 'force-dynamic';

const TICKER_ITEMS = [
  'NTD Support', 'Skills Training', 'Community Empowerment', 'Dignified Livelihoods',
  'Artisan Commerce', 'Field Activities', 'Nima · Ashaiman · Ningo-Prampram · Ho',
  'Powered by Anesvad Foundation',
];


export default async function HomePage() {
  const [featuredProducts, recentActivities, announcement] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, featured: true },
      include: { category: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activity.findMany({
      where: { published: true },
      take: 4,
      orderBy: { activityDate: 'desc' },
    }),
    prisma.announcement.findFirst({
      where: { published: true, featured: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <>
      {/* Announcement */}
      {announcement && (
        <div className={styles.announcementBanner}>
          <span className={styles.annLabel}>Update</span>
          <span className={styles.annText}>{announcement.title}</span>
          <Link href={`/announcements/${announcement.slug}`} className={styles.annLink}>Read more →</Link>
        </div>
      )}

      <HeroCarousel />

      {/* Strip */}
      <div className={styles.strip}>
        <div className={styles.stripInner}>
          {TICKER_ITEMS.flatMap((item, i) => [
            i > 0 ? <span key={`sep-${i}`} className={styles.stripSep} /> : null,
            <span key={item} className={styles.stripItem}>{item}</span>,
          ])}
        </div>
      </div>

      {/* Featured Products */}
      <section className={styles.productsSection}>
        <div className={styles.secHeader}>
          <div>
            <p className={styles.secNum}>01 — Shop</p>
            <h2 className={styles.secTitle}>Featured products</h2>
          </div>
          <Link href="/shop" className={styles.secLink}>View all products →</Link>
        </div>

        {featuredProducts.length === 0 ? (
          <p style={{ color: '#bbb', fontSize: '13px' }}>No featured products yet.</p>
        ) : (
          <div className={styles.productGrid}>
            {featuredProducts.map(p => {
              const imgs: string[] = Array.isArray(p.images) ? p.images as string[] : [];
              return (
                <Link key={p.id} href={`/shop/${p.slug}`} className={styles.productCard}>
                  <div className={styles.productImgWrap}>
                    {imgs[0] ? (
                      <Image src={imgs[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.productImg} />
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <p className={styles.productCat}>{p.category.name}</p>
                    <p className={styles.productName}>{p.name}</p>
                    <div className={styles.productFooter}>
                      <span className={styles.productPrice}>GHS {p.price.toLocaleString()}</span>
                      <span className={styles.productTag}>Artisan made ✦</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className={styles.divider} />

      {/* Activities */}
      <section className={styles.activitiesSection}>
        <div className={styles.secHeader}>
          <div>
            <p className={styles.secNum}>02 — Field work</p>
            <h2 className={styles.secTitle}>Latest activities</h2>
          </div>
          <Link href="/activities" className={styles.secLink}>All activities →</Link>
        </div>

        {recentActivities.length === 0 ? (
          <p style={{ color: '#bbb', fontSize: '13px' }}>No activities yet.</p>
        ) : (
          <div className={styles.activityGrid}>
            {recentActivities.map((a, i) => (
              <Link key={a.id} href={`/activities/${a.slug}`} className={styles.activityCard}>
                <div className={styles.actCardImg}>
                  <Image
                    src={a.featuredImage ?? fieldPhoto(i)}
                    alt={a.title}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </div>
                <div className={styles.actCardBody}>
                  <p className={styles.actCardTitle}>{a.title}</p>
                  <p className={styles.actCardSummary}>{a.summary}</p>
                  <span className={styles.actCardLink}>
                    Read more <span className={styles.actCardArrow}>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Mission section */}
      <section className={styles.missionSection}>
        <div className={styles.missionLeft}>
          <p className={styles.missionLabel}>Our purpose</p>
          <h2 className={styles.missionHeadline}>
            Where craft meets <em>commerce</em> —<br />and purpose meets profit.
          </h2>
          <p className={styles.missionText}>
            EXA Ventures &amp; Anesvad is a socio-economic empowerment programme supporting
            people living with NTDs, persons with disabilities, caregivers, and vulnerable
            women in Ghana — building skills, dignity, and sustainable livelihoods.
          </p>
          <Link href="/about" className={styles.missionCta}>Discover the programme →</Link>
        </div>
        <div className={styles.missionRight}>
          <div className={styles.missionQuote}>
            <p className={styles.missionQuoteText}>
              &ldquo;Every product you purchase supports a livelihood — and the
              dignity of someone who built it.&rdquo;
            </p>
            <p className={styles.missionQuoteCite}>EXA Ventures &amp; Anesvad Programme</p>
          </div>
          <div className={styles.missionPartners}>
            <div className={styles.missionPartner}>
              <span className={`${styles.missionPartnerLogo} ${styles.green}`}>Divine EXA Ventures</span>
              <span className={styles.missionPartnerDesc}>Ghanaian enterprise development &amp; community empowerment</span>
            </div>
            <div className={styles.missionPartner}>
              <span className={`${styles.missionPartnerLogo} ${styles.gold}`}>anesvad Foundation</span>
              <span className={styles.missionPartnerDesc}>Spanish NGO · 50+ years of global health &amp; rights work</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partner band */}
      <div className={styles.partnerBand}>
        <span className={styles.partnerLabel}>In partnership with</span>
        <span className={styles.partnerSep} />
        <span className={styles.partnerName}>anesvad Foundation</span>
        <span className={styles.partnerSep} />
        <span className={styles.partnerDesc}>50+ years of global community development</span>
      </div>
    </>
  );
}
