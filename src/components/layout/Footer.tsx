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
          <Link href="/shop">Shop</Link>
          <Link href="/activities">Activities</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/videos">Videos</Link>
          <Link href="/announcements">Updates</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} EXA-ANESVAD. All rights reserved.</span>
          <Link href="/admin" className={styles.adminLink}>Admin →</Link>
        </div>
      </div>
    </footer>
  );
}
