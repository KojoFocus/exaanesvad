import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { verifyPayment, clearCartAfterPayment } from '../actions';
import { env } from 'process';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order Confirmed' };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string; ref?: string; test?: string }> }) {
  const { order: orderId, ref: paymentRef, test: isTest } = await searchParams;
  
  // Test mode: simulate successful payment without API calls
  const isTestMode = env.PAYSTACK_TEST_MODE === 'true';
  
  if (paymentRef && !isTest) {
    // Only verify real payments, not test mode
    const verificationResult = await verifyPayment(paymentRef);
    if (verificationResult.success && verificationResult.orderId) {
      // Clear cart after successful payment
      await clearCartAfterPayment(verificationResult.orderId);
    }
  } else if (isTest && isTestMode && orderId) {
    // In test mode, mark order as paid directly
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'paid' },
    });
    // Clear cart after successful test payment
    await clearCartAfterPayment(orderId);
  }

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.icon}>✓</div>
      <h1 className={styles.title}>Thank you for your order</h1>
      <p className={styles.sub}>
        {order ? `Hello ${order.customerName.split(' ')[0]},` : 'Thank you!'} Your order has been received and we'll contact you shortly to confirm delivery details.
      </p>

      {order && (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardLabel}>Order confirmation</span>
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
            <span>Order total</span>
            <span className={styles.totalAmt}>GHS {order.totalAmount.toLocaleString()}</span>
          </div>

          <div className={styles.contact}>
            <p>A confirmation email will be sent to <strong>{order.customerEmail}</strong></p>
          </div>
        </div>
      )}

      <div className={styles.impactNote}>
        <span className={styles.impactIcon}>✦</span>
        Your purchase supports people living with NTDs, vulnerable women, and persons with disabilities through our skills training programmes.
      </div>

      <div className={styles.actions}>
        <Link href="/shop" className={styles.shopBtn}>Continue shopping</Link>
        <Link href="/" className={styles.homeLink}>← Back to home</Link>
      </div>
    </div>
  );
}
