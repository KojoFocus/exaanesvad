import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = { title: 'Dashboard' };

const STATUS_CLASS: Record<string, string> = {
  pending:    styles.bsPend,
  confirmed:  styles.bsConf,
  processing: styles.bsConf,
  delivered:  styles.bsDelv,
  cancelled:  styles.bsCanc,
};

export default async function DashboardPage() {
  const [productCount, orderCount, activityCount, recentOrders] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.order.count(),
    prisma.activity.count({ where: { published: true } }),
    prisma.order.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { items: true } }),
  ]);

  const revenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: { not: 'cancelled' } },
  });

  return (
    <>
      <div className={styles.hd}>
        <h1>Dashboard</h1>
        <p>
          {new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className={styles.metrics}>
        <div className={styles.mc}>
          <div className={styles.mcLbl}>Revenue</div>
          <div className={styles.mcNum} style={{ fontSize: '22px' }}>
            GHS {(revenue._sum.totalAmount ?? 0).toLocaleString()}
          </div>
          <div className={styles.mcChgBlue}>All time</div>
        </div>
        <div className={styles.mc}>
          <div className={styles.mcLbl}>Orders</div>
          <div className={styles.mcNum}>{orderCount}</div>
          <div className={styles.mcChg}>Total</div>
        </div>
        <div className={styles.mc}>
          <div className={styles.mcLbl}>Products</div>
          <div className={styles.mcNum}>{productCount}</div>
          <div className={styles.mcChg}>Published</div>
        </div>
        <div className={styles.mc}>
          <div className={styles.mcLbl}>Activities</div>
          <div className={styles.mcNum}>{activityCount}</div>
          <div className={styles.mcChg}>Published</div>
        </div>
      </div>

      <div className={styles.quickRow}>
        <Link href="/admin/dashboard/products/new" className={styles.quickBtn}>+ New product</Link>
        <Link href="/admin/dashboard/activities/new" className={styles.quickBtn}>+ New activity</Link>
        <Link href="/admin/dashboard/announcements/new" className={styles.quickBtn}>+ Announcement</Link>
        <Link href="/admin/dashboard/orders" className={styles.quickBtn}>View orders →</Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHd}>
          <h2>Recent orders</h2>
          <Link href="/admin/dashboard/orders" className={styles.seeAll}>View all →</Link>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={6} className={styles.empty}>No orders yet.</td></tr>
            ) : recentOrders.map(o => (
              <tr key={o.id}>
                <td><span className={styles.orderId}>#{o.id.slice(-6).toUpperCase()}</span></td>
                <td>{o.customerName}</td>
                <td style={{ color: '#999' }}>{o.items.length}</td>
                <td>GHS {o.totalAmount.toLocaleString()}</td>
                <td>
                  <span className={`${styles.badge} ${STATUS_CLASS[o.status] ?? styles.bsPend}`}>
                    {o.status}
                  </span>
                </td>
                <td style={{ color: '#bbb', fontSize: '11.5px' }}>
                  {new Date(o.createdAt).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
