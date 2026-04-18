import { prisma } from '@/lib/prisma';
import { updateOrderStatus } from './actions';
import styles from './page.module.css';

export const metadata = { title: 'Orders' };

const STATUS_BADGE: Record<string, string> = {
  pending:    'badge-warning',
  confirmed:  'badge-info',
  processing: 'badge-info',
  delivered:  'badge-success',
  cancelled:  'badge-danger',
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.sub}>{orders.length} total orders</p>
        </div>
      </div>

      <div className={styles.pills}>
        {['pending', 'confirmed', 'processing', 'delivered', 'cancelled'].map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <span key={s} className={`badge ${STATUS_BADGE[s]}`} style={{ padding: '5px 12px' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
            </span>
          );
        })}
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={8} className={styles.empty}>No orders yet.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div>{order.customerName}</div>
                    <div className={styles.email}>{order.customerEmail}</div>
                  </td>
                  <td>{order.customerPhone}</td>
                  <td>{order.items.length}</td>
                  <td>GHS {order.totalAmount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[order.status] ?? 'badge-neutral'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <form action={updateOrderStatus.bind(null, order.id)}>
                      <select name="status" defaultValue={order.status} className={styles.statusSelect}
                        onChange={(e) => (e.target.form as HTMLFormElement).requestSubmit()}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </form>
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(order.createdAt).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}
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
