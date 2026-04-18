import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata = { title: 'Shop' };
export const dynamic = 'force-dynamic';

type ShopPageProps = { searchParams: Promise<{ category?: string }> };

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;
  const [allProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, ...(category ? { category: { slug: category } } : {}) },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const products = allProducts
    .filter(p => Array.isArray(p.images) && (p.images as string[]).some(img => typeof img === 'string' && img.trim() !== ''));

  return (
    <>
      <div className={styles.pageHead}>
        <span className={styles.eyebrow}>Our products</span>
        <Link href="/shop" className={styles.viewAllHead}>View all →</Link>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <div className={styles.sideLabel}>Category</div>
            <Link href="/shop" className={`${styles.filterItem} ${!category ? styles.filterActive : ''}`}>
              All
            </Link>
            {categories.map(c => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className={`${styles.filterItem} ${category === c.slug ? styles.filterActive : ''}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className={styles.impactNote}>
            <p className={styles.impactNoteText}>
              <strong>100% of proceeds</strong> support vocational training and community livelihoods in Ghana.
            </p>
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.toolbar}>
            <span className={styles.count}>
              {products.length} product{products.length !== 1 ? 's' : ''}
              {category ? ` in ${categories.find(c => c.slug === category)?.name ?? category}` : ''}
            </span>
          </div>

          {products.length === 0 ? (
            <div className={styles.empty}>No products found. <Link href="/shop" style={{ color: 'var(--green)' }}>View all →</Link></div>
          ) : (
            <div className={styles.grid}>
              {products.map(p => {
                const imgs: string[] = Array.isArray(p.images) ? p.images as string[] : [];
                return (
                  <Link key={p.id} href={`/shop/${p.slug}`} className={styles.card}>
                    <div className={styles.cardImgWrap}>
                      {imgs[0]
                        ? <Image src={imgs[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />
                        : <div className={styles.cardImgPlaceholder} />}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardRow}>
                        <p className={styles.cardName}>{p.name}</p>
                        <span className={styles.cardPrice}>GHS {p.price.toLocaleString()}</span>
                      </div>
                      <p className={styles.cardCat}>{p.category.name}</p>
                      {p.description && <p className={styles.cardDesc}>{p.description}</p>}
                      <span className={styles.cardLink}>View product →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
