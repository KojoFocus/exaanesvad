import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>EXA<span className={styles.logoAccent}>·</span>ANESVAD</div>
          <div className={styles.tagline}>Skills · Dignity · Community Transformation</div>
        </div>

        <nav className={styles.links}>
          <Link href="/shop" prefetch={false}>Shop</Link>
          <Link href="/activities" prefetch={false}>Activities</Link>
          <Link href="/gallery" prefetch={false}>Gallery</Link>
          <Link href="/videos" prefetch={false}>Videos</Link>
          <Link href="/announcements" prefetch={false}>Updates</Link>
          <Link href="/about" prefetch={false}>About</Link>
          <Link href="/contact" prefetch={false}>Contact</Link>
        </nav>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} EXA-ANESVAD. All rights reserved.</span>
          <Link href="/admin" className={styles.adminLink} prefetch={false}>Admin →</Link>
        </div>
      </div>
    </footer>
  );
}
