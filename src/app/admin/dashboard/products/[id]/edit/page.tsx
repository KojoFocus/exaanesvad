import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateProduct } from '../../actions';
import ImageUploader from '@/components/admin/ImageUploader';
import styles from '../../new/page.module.css';

export const metadata = { title: 'Edit Product' };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Edit product</h1>
          <p className={styles.sub}>{product.name}</p>
        </div>
        <Link href="/admin/dashboard/products" className="btn">← Back</Link>
      </div>

      <form action={action} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Basic information</h2>
          <div className={styles.fg}><label className={styles.label}>Product name <span className={styles.req}>*</span></label><input name="name" required defaultValue={product.name} className={styles.input} /></div>
          <div className={styles.fg}><label className={styles.label}>Short description <span className={styles.req}>*</span></label><input name="shortDescription" required defaultValue={product.shortDescription} className={styles.input} /></div>
          <div className={styles.fg}><label className={styles.label}>Full description <span className={styles.req}>*</span></label><textarea name="description" required defaultValue={product.description} className={styles.textarea} /></div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Pricing &amp; inventory</h2>
          <div className={styles.row}>
            <div className={styles.fg}><label className={styles.label}>Price (GHS) <span className={styles.req}>*</span></label><input name="price" type="number" required min="0" step="0.01" defaultValue={product.price} className={styles.input} /></div>
            <div className={styles.fg}><label className={styles.label}>Stock quantity <span className={styles.req}>*</span></label><input name="stock" type="number" required min="0" defaultValue={product.stock} className={styles.input} /></div>
            <div className={styles.fg}><label className={styles.label}>Category <span className={styles.req}>*</span></label>
              <select name="categoryId" required defaultValue={product.categoryId} className={styles.select}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Product images</h2>
          <ImageUploader
            name="images"
            label="Upload product photos"
            multiple
            initialUrls={Array.isArray(product.images) ? product.images as string[] : []}
            folder="exa-anesvad/products"
          />
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Visibility</h2>
          <div className={styles.checkRow}>
            <label className={styles.checkLabel}><input type="checkbox" name="featured" defaultChecked={product.featured} className={styles.check} /> Featured on homepage</label>
            <label className={styles.checkLabel}><input type="checkbox" name="published" defaultChecked={product.published} className={styles.check} /> Published</label>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/admin/dashboard/products" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary">Save changes</button>
        </div>
      </form>
    </div>
  );
}
