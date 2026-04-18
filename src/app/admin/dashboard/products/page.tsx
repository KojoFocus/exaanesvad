import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteProduct, togglePublish } from './actions';
import DeleteButton from '@/components/admin/DeleteButton';
import styles from './page.module.css';

export const metadata = { title: 'Products' };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.sub}>{products.length} products in {categories.length} categories</p>
        </div>
        <Link href="/admin/dashboard/products/new" className="btn btn-primary">
          + Add product
        </Link>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={6} className={styles.empty}>No products yet. <Link href="/admin/dashboard/products/new">Add one →</Link></td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td><span className={styles.productName}>{p.name}</span></td>
                  <td>{p.category.name}</td>
                  <td>GHS {p.price.toLocaleString()}</td>
                  <td className={p.stock === 0 ? styles.outOfStock : ''}>{p.stock}</td>
                  <td>
                    <span className={`badge ${p.published ? 'badge-success' : 'badge-neutral'}`}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/dashboard/products/${p.id}/edit`} className="btn btn-sm">
                        Edit
                      </Link>
                      <form action={togglePublish.bind(null, p.id, !p.published)} style={{ display: 'inline' }}>
                        <button type="submit" className="btn btn-sm">
                          {p.published ? 'Unpublish' : 'Publish'}
                        </button>
                      </form>
                      <form action={deleteProduct.bind(null, p.id)} style={{ display: 'inline' }}>
                        <DeleteButton className="btn btn-sm btn-danger" message="Delete this product?">Delete</DeleteButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
