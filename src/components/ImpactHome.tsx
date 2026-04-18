'use client';

import Link from 'next/link';
import Image from 'next/image';
import HeroCarousel from './HeroCarousel';
import { fieldPhoto } from '@/lib/fieldPhotos';
import styles from '../app/(public)/home.module.css';
import { useSiteMode } from '@/contexts/SiteModeContext';
import type { ImpactData } from './HomePageClient.types';

const TICKER_ITEMS = [
  'NTD Support', 'Skills Training', 'Community Empowerment', 'Dignified Livelihoods',
  'Artisan Commerce', 'Field Activities', 'Nima · Ashaiman · Ningo-Prampram · Ho',
  'Powered by Anesvad Foundation',
];

export default function ImpactHome({ recentActivities, announcement }: ImpactData) {
  const { setMode } = useSiteMode();
  const goShop = () => setMode('shop');
  return (
    <>
      {announcement && (
        <div className={styles.announcementTicker}>
          <span className={styles.tickerLabel}>Update</span>
          <div className={styles.tickerTrack}>
            <span className={styles.tickerText}>
              {announcement.title}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;
              {announcement.title}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;
              {announcement.title}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>
      )}

      <HeroCarousel />

      <div className={styles.strip}>
        <div className={styles.stripInner}>
          {TICKER_ITEMS.flatMap((item, i) => [
            i > 0 ? <span key={`sep-${i}`} className={styles.stripSep} /> : null,
            <span key={item} className={styles.stripItem}>{item}</span>,
          ])}
        </div>
      </div>

      <div className={styles.divider} />

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
              &ldquo;Every product you purchase supports a livelihood — and the dignity of someone who built it.&rdquo;
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

      <div className={styles.shopCta}>
        <p className={styles.shopCtaText}>Products made by the people in this programme</p>
        <button className={styles.shopCtaBtn} onClick={goShop}>Go to Shop →</button>
      </div>

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
