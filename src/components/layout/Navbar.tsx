'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import styles from './Navbar.module.css';

const LINKS = [
  { href: '/shop',          label: 'Shop'       },
  { href: '/about',         label: 'About'      },
  { href: '/activities',    label: 'Activities' },
  { href: '/gallery',       label: 'Gallery'    },
  { href: '/videos',        label: 'Videos'     },
  { href: '/announcements', label: 'Updates'    },
  { href: '/contact',       label: 'Contact'    },
];

export default function Navbar() {
  const path = usePathname();
  const { count } = useCart();
  const [logoLoaded, setLogoLoaded] = useState(true);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          {logoLoaded ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/hero/logo.png"
              alt="Divine EXA Ventures × Anesvad Foundation"
              className={styles.logoImg}
              onError={() => setLogoLoaded(false)}
            />
          ) : (
            <div className={styles.logoText}>
              <span className={styles.logoMain}>EXA-ANESVAD</span>
              <span className={styles.logoSub}>Divine EXA × Anesvad</span>
            </div>
          )}
        </Link>

        <ul className={styles.links}>
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.link} ${path.startsWith(href) ? styles.active : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.right}>
          <Link href="/cart" className={styles.cartBtn}>
            Cart
            {count > 0 && <span className={styles.cartBadge}>{count}</span>}
          </Link>
          <Link href="/admin/dashboard" className={styles.dashBtn}>Dashboard</Link>
        </div>
      </nav>
    </header>
  );
}
