import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order Confirmed' };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.icon}>✓</div>
      <h1 className={styles.title}>Order received</h1>
      <p className={styles.sub}>
        Thank you{order ? `, ${order.customerName.split(' ')[0]}` : ''}. We've received your order and will be in touch shortly to confirm delivery details.
      </p>

      {order && (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardLabel}>Order reference</span>
            <span className={styles.cardId}>#{order.id.slice(-8).toUpperCase()}</span>
          </div>

          <div className={styles.items}>
            {order.items.map(item => (
              <div key={item.id} className={styles.item}>
                <span className={styles.itemName}>{item.productName}</span>
                <span className={styles.itemQty}>× {item.quantity}</span>
                <span className={styles.itemPrice}>GHS {(item.unitPrice * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className={styles.total}>
            <span>Total paid</span>
            <span className={styles.totalAmt}>GHS {order.totalAmount.toLocaleString()}</span>
          </div>

          <div className={styles.contact}>
            <p>Confirmation will be sent to <strong>{order.customerEmail}</strong></p>
          </div>
        </div>
      )}

      <div className={styles.impactNote}>
        <span className={styles.impactIcon}>✦</span>
        Your purchase supports a trained artisan and helps fund the next programme cohort.
      </div>

      <div className={styles.actions}>
        <Link href="/shop" className={styles.shopBtn}>Continue shopping</Link>
        <Link href="/" className={styles.homeLink}>← Back to home</Link>
      </div>
    </div>
  );
}
