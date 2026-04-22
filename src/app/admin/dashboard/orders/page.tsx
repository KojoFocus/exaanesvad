import { prisma } from '@/lib/prisma';
import StatusSelect from './StatusSelect';
import { deleteOrder } from './actions';
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
              <th>Phone</th>
              <th>Items ordered</th>
              <th>Delivery address</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Update</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={10} className={styles.empty}>No orders yet.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className={styles.phone}>{order.customerPhone}</div>
                  </td>
                  <td>
                    <ul className={styles.itemList}>
                      {order.items.map((item) => (
                        <li key={item.id} className={styles.itemLine}>
                          <span className={styles.itemName}>{item.productName}</span>
                          <span className={styles.itemQty}>× {item.quantity}</span>
                          <span className={styles.itemPrice}>GHS {(item.unitPrice * item.quantity).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className={styles.addressCell}>{order.address}</td>
                  <td className={styles.totalCell}>GHS {order.totalAmount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[order.status] ?? 'badge-neutral'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <StatusSelect orderId={order.id} current={order.status} />
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(order.createdAt).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}
                  </td>
                  <td>
                    <form action={deleteOrder.bind(null, order.id)}>
                      <button type="submit" className={styles.deleteBtn} title="Delete order">✕</button>
                    </form>
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
