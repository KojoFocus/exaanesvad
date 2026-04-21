'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useSiteMode } from '@/contexts/SiteModeContext';
import styles from './Navbar.module.css';

const SHOP_LINKS = [
  { href: '/shop',    label: 'Shop'    },
  { href: '/about',   label: 'About'   },
  { href: '/contact', label: 'Contact' },
];

const IMPACT_LINKS = [
  { href: '/shop',          label: 'Shop'       },
  { href: '/activities',    label: 'Activities' },
  { href: '/announcements', label: 'Updates'    },
  { href: '/gallery',       label: 'Gallery'    },
  { href: '/about',         label: 'About'      },
  { href: '/contact',       label: 'Contact'    },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { mode, setMode } = useSiteMode();
  const [logoLoaded, setLogoLoaded] = useState(true);

  const switchTo = (m: 'shop' | 'impact') => {
    setMode(m);
    router.push('/');
  };

  const links = mode === 'shop' ? SHOP_LINKS : IMPACT_LINKS;

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} prefetch={false}>
          {logoLoaded ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/hero/logo.png"
              alt="EXA Ventures × Anesvad"
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
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                prefetch={false}
                className={`${styles.link} ${path.startsWith(href) ? styles.active : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.right}>
          <div className={styles.modeToggle} role="group" aria-label="Switch view">
            <button
              onClick={() => switchTo('shop')}
              className={`${styles.modeBtn} ${mode === 'shop' ? styles.modeBtnActive : ''}`}
            >
              Shop
            </button>
            <button
              onClick={() => switchTo('impact')}
              className={`${styles.modeBtn} ${mode === 'impact' ? styles.modeBtnActive : ''}`}
            >
              Impact
            </button>
          </div>
          <Link href="/cart" className={styles.cartBtn} prefetch={false}>
            Cart
            {count > 0 && <span className={styles.cartBadge}>{count}</span>}
          </Link>
        </div>
      </nav>
    </header>
  );
}
