import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.impactStrip}>
        <div className={styles.impactItem}>
          <span className={styles.impactNum}>420+</span>
          <span className={styles.impactLbl}>Beneficiaries trained</span>
        </div>
        <div className={styles.impactSep} />
        <div className={styles.impactItem}>
          <span className={styles.impactNum}>6</span>
          <span className={styles.impactLbl}>Communities reached</span>
        </div>
        <div className={styles.impactSep} />
        <div className={styles.impactItem}>
          <span className={styles.impactNum}>18</span>
          <span className={styles.impactLbl}>Programmes run</span>
        </div>
        <div className={styles.impactSep} />
        <div className={styles.impactItem}>
          <span className={styles.impactNum}>580k</span>
          <span className={styles.impactLbl}>GHS in livelihoods</span>
        </div>
      </div>

      <div className={styles.grid}>
        <div>
          <div className={styles.logo}>EXA<span className={styles.logoAccent}>·</span>ANESVAD</div>
          <div className={styles.tagline}>Skills · Dignity · Community Transformation</div>
          <p className={styles.desc}>
            A socio-economic empowerment programme connecting trained artisans to markets across Africa, powered by Divine EXA Ventures in partnership with Anesvad Foundation.
          </p>
          <div className={styles.partners}>
            <div className={styles.partner}>
              <div className={styles.partnerDot} />
              <span className={styles.pExa}>Divine EXA Ventures</span>
            </div>
            <div className={styles.partner}>
              <div className={styles.partnerDot} />
              <span className={styles.pAnvd}>anesvad Foundation</span>
            </div>
          </div>
        </div>

        <div className={styles.col}>
          <h4>Platform</h4>
          <Link href="/shop">Shop</Link>
          <Link href="/activities">Activities</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/videos">Videos</Link>
          <Link href="/announcements">Updates</Link>
        </div>

        <div className={styles.col}>
          <h4>About</h4>
          <Link href="/about">Our story</Link>
          <Link href="/about#mission">Mission</Link>
          <Link href="/about#impact">Impact</Link>
          <Link href="/contact">Contact us</Link>
        </div>

        <div className={styles.col}>
          <h4>Contact</h4>
          <a href="mailto:info@exa-anesvad.org">info@exa-anesvad.org</a>
          <a>+233 XX XXX XXXX</a>
          <a>Accra, Ghana</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} EXA-ANESVAD. All rights reserved.</span>
        <Link href="/admin" className={styles.adminLink}>Admin →</Link>
      </div>
    </footer>
  );
}
