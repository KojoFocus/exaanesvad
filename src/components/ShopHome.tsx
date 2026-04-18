'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './ShopHome.module.css';
import type { HomeData } from './HomePageClient.types';

export default function ShopHome({ featuredProducts, announcement }: HomeData) {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>

        <div className={styles.heroContent}>
          <h1 className={styles.heroHeadline}>
            Tough on Dirt.<br />Safe on Hands.
          </h1>

          <div className={styles.heroStage}>
            <div className={styles.heroGlow} />
            <Image
              src="/hero/washing-powder.png"
              alt="Divine Wash Detergent"
              width={520}
              height={520}
              style={{ objectFit: 'contain', position: 'relative', zIndex: 1 }}
              priority
            />
            <div className={styles.heroGroundShadow} />
          </div>

          <div className={styles.heroCtas}>
            <Link href="/shop" className={styles.ctaPrimary}>Shop Now</Link>
            <Link href="/about" className={styles.ctaSecondary}>Our Mission</Link>
          </div>
        </div>

        <div className={styles.heroArrow}>↓</div>

        <div className={styles.heroBottom}>
          <Link href="/shop" className={styles.heroBottomLeft}>Our products</Link>
          <Link href="/shop" className={styles.heroBottomRight}>View all →</Link>
        </div>
      </section>

      {/* Mission strip */}
      <div className={styles.missionStrip}>
        <div className={styles.missionStripInner}>
          <p className={styles.missionStripText}>
            100% of proceeds fund vocational training for people living with NTDs,
            PWDs, and vulnerable women in Ghana.
          </p>
          <Link href="/about" className={styles.missionStripLink}>Our mission →</Link>
        </div>
      </div>

      {/* Product list */}
      <div className={styles.listWrap}>
        <div className={styles.listHead}>
          <p className={styles.listLabel}>From the community</p>
          <Link href="/shop" className={styles.listAll}>View all →</Link>
        </div>

        {featuredProducts.length === 0 ? (
          <p className={styles.empty}>No products yet.</p>
        ) : (
          <div className={styles.list}>
            {featuredProducts.map((p, i) => {
              const imgs: string[] = Array.isArray(p.images) ? p.images as string[] : [];
              return (
                <Link key={p.id} href={`/shop/${p.slug}`} className={styles.item}>
                  <div className={styles.itemImg}>
                    {imgs[0]
                      ? <Image src={imgs[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      : <div className={styles.itemImgPlaceholder} />}
                    <span className={styles.itemNum}>0{i + 1}</span>
                  </div>
                  <div className={styles.itemBody}>
                    <p className={styles.itemCat}>{p.category.name}</p>
                    <p className={styles.itemName}>{p.name}</p>
                    {p.description && (
                      <p className={styles.itemDesc}>{p.description}</p>
                    )}
                    <span className={styles.itemCta}>View product →</span>
                  </div>
                  <div className={styles.itemPrice}>
                    GHS {p.price.toLocaleString()}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
