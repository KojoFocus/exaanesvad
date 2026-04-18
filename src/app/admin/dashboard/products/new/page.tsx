import { prisma } from '@/lib/prisma';
import { createProduct } from '../actions';
import ImageUploader from '@/components/admin/ImageUploader';
import styles from './page.module.css';
import Link from 'next/link';

export const metadata = { title: 'Add Product' };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Add product</h1>
          <p className={styles.sub}>New item for the shop catalogue</p>
        </div>
        <Link href="/admin/dashboard/products" className="btn">← Back</Link>
      </div>

      <form action={createProduct} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Basic information</h2>

          <div className={styles.fg}>
            <label className={styles.label}>Product name <span className={styles.req}>*</span></label>
            <input name="name" required className={styles.input} placeholder="e.g. Kente-Inspired Table Runner" />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Short description <span className={styles.req}>*</span></label>
            <input name="shortDescription" required className={styles.input} placeholder="One sentence summary" />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Full description <span className={styles.req}>*</span></label>
            <textarea name="description" required className={styles.textarea} placeholder="Detailed product description, materials, story…" />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Pricing & inventory</h2>
          <div className={styles.row}>
            <div className={styles.fg}>
              <label className={styles.label}>Price (GHS) <span className={styles.req}>*</span></label>
              <input name="price" type="number" required min="0" step="0.01" className={styles.input} placeholder="0.00" />
            </div>
            <div className={styles.fg}>
              <label className={styles.label}>Stock quantity <span className={styles.req}>*</span></label>
              <input name="stock" type="number" required min="0" className={styles.input} placeholder="0" />
            </div>
            <div className={styles.fg}>
              <label className={styles.label}>Category <span className={styles.req}>*</span></label>
              <select name="categoryId" required className={styles.select}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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
            folder="exa-anesvad/products"
          />
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Visibility</h2>
          <div className={styles.checkRow}>
            <label className={styles.checkLabel}>
              <input type="checkbox" name="featured" className={styles.check} />
              Mark as featured (shown on homepage)
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" name="published" className={styles.check} />
              Publish immediately
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/admin/dashboard/products" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary">Save product</button>
        </div>
      </form>
    </div>
  );
}
