'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroCarousel.module.css';

const STATS = [
  { n: '420+', l: 'Beneficiaries' },
  { n: '18',   l: 'Programmes'   },
  { n: '6',    l: 'Communities'  },
  { n: '580k', l: 'GHS supported'},
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* ── Left: text ── */}
      <div className={styles.left}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Community · Commerce · Impact</p>
          <h1 className={styles.headline}>
            Every product tells the story of someone who made it.
          </h1>
          <div className={styles.rule} />
          <p className={styles.sub}>
            Each item is crafted by a trained beneficiary — people living with NTDs,
            caregivers, PWDs, and vulnerable women — building a sustainable livelihood.
            Your purchase funds the next cohort.
          </p>
          <div className={styles.ctas}>
            <Link href="/shop" className={styles.ctaPrimary}>Shop &amp; support</Link>
            <Link href="/about" className={styles.ctaGhost}>About the programme →</Link>
          </div>
        </div>

        <div className={styles.statsRow}>
          {STATS.map(s => (
            <div key={s.l} className={styles.stat}>
              <div className={styles.statNum}>{s.n}</div>
              <div className={styles.statLabel}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: image ── */}
      <div className={styles.right}>
        <Image
          src="/hero/hero.jpeg"
          alt="EXA-ANESVAD field activity — NTD programme community session"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>
    </section>
  );
}
