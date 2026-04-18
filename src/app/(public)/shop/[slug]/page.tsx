import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from './AddToCartButton';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

type ProductDetailPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return { title: product.name, description: product.shortDescription };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { slug, published: true },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!product) notFound();

  const images: string[] = Array.isArray(product.images) ? product.images as string[] : [];
  const mainImage = images[0] ?? null;
  const currentIndex = allProducts.findIndex(p => p.id === product.id);
  const nextProduct = allProducts[currentIndex + 1] ?? null;
  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <>
      <nav className={styles.breadcrumb}>
        <Link href="/shop">Our products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.product}>
        <div className={styles.imageCol}>
          <div className={styles.mainImgWrap}>
            {mainImage ? (
              <Image src={mainImage} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
            ) : (
              <div className={styles.imgPlaceholder}>
                <span className={styles.imgPlaceholderLabel}>{product.category.name}</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles.thumbRow}>
              {images.slice(1).map((src, i) => (
                <div key={i} className={styles.thumb}>
                  <Image src={src} alt={`${product.name} ${i + 2}`} fill style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoCol}>
          <p className={styles.category}>{product.category.name}</p>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>GHS {product.price.toLocaleString()}</p>

          <p className={styles.shortDesc}>{product.shortDescription}</p>

          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              stock: product.stock,
              image: mainImage ?? undefined,
              category: product.category.name,
            }}
          />

          <div className={styles.rule} />

          {product.description && (
            <div className={styles.descSection}>
              <p className={styles.descLabel}>About this product</p>
              <p className={styles.desc}>{product.description}</p>
            </div>
          )}

          <div className={styles.impactNote}>
            <div className={styles.impactIcon}>✦</div>
            <p className={styles.impactText}>
              Made through the EXA Ventures &amp; Anesvad livelihood training programme.
              Every purchase directly supports a trained artisan and funds the next cohort.
            </p>
          </div>

          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span className={styles.metaKey}>Category</span>
              <span className={styles.metaVal}>{product.category.name}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaKey}>Stock</span>
              <span className={styles.metaVal}>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaKey}>Origin</span>
              <span className={styles.metaVal}>Ghana, West Africa</span>
            </div>
          </div>
        </div>
      </div>

      {nextProduct && (
        <div className={styles.nextNav}>
          <Link href={`/shop/${nextProduct.slug}`} className={styles.nextLink}>
            {nextProduct.name} →
          </Link>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedHeader}>
            <p className={styles.relatedLabel}>You may also like</p>
            <Link href="/shop" className={styles.relatedAll}>View all →</Link>
          </div>
          <div className={styles.relatedGrid}>
            {relatedProducts.map(p => {
              const imgs: string[] = Array.isArray(p.images) ? p.images as string[] : [];
              return (
                <Link key={p.id} href={`/shop/${p.slug}`} className={styles.relCard}>
                  <div className={styles.relImgWrap}>
                    {imgs[0]
                      ? <Image src={imgs[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      : <div className={styles.relImgPlaceholder} />}
                  </div>
                  <div className={styles.relBody}>
                    <p className={styles.relCat}>{p.category.name}</p>
                    <p className={styles.relName}>{p.name}</p>
                    <p className={styles.relPrice}>GHS {p.price.toLocaleString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
