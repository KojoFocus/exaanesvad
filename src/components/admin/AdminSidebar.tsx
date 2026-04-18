'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './AdminSidebar.module.css';

const NAV = [
  {
    group: 'Overview',
    items: [
      { href: '/admin/dashboard',               label: 'Dashboard',     icon: 'grid'   },
    ],
  },
  {
    group: 'Commerce',
    items: [
      { href: '/admin/dashboard/products',      label: 'Products',      icon: 'bag'    },
      { href: '/admin/dashboard/orders',        label: 'Orders',        icon: 'box'    },
    ],
  },
  {
    group: 'Programme',
    items: [
      { href: '/admin/dashboard/activities',    label: 'Activities',    icon: 'shield' },
      { href: '/admin/dashboard/announcements', label: 'Announcements', icon: 'bell'   },
    ],
  },
  {
    group: 'Media',
    items: [
      { href: '/admin/dashboard/gallery',       label: 'Gallery',       icon: 'image'    },
      { href: '/admin/dashboard/videos',        label: 'Videos',        icon: 'video'    },
    ],
  },
  {
    group: 'System',
    items: [
      { href: '/admin/dashboard/settings',      label: 'Settings',      icon: 'settings' },
    ],
  },
];

const ICONS: Record<string, React.ReactNode> = {
  grid:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  bag:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  box:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  shield: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  bell:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  image:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  video:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.aside}>
      <div className={styles.logo}>
        <div className={styles.logoMark}><div className={styles.logoMarkDot} /></div>
        <span className={styles.logoText}>EXA-ANESVAD</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <div className={styles.group}>{group}</div>
            {items.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.item} ${
                  href === '/admin/dashboard'
                    ? pathname === href
                    : pathname.startsWith(href)
                  ? styles.active : ''}`}
              >
                <span className={styles.icon}>{ICONS[icon]}</span>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button onClick={() => signOut({ callbackUrl: '/admin' })} className={styles.signout}>
          <span className={styles.icon}>{ICONS.logout}</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
