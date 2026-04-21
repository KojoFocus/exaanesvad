'use client';

import Link from 'next/link';
import { verifyPayment, getOrderWithItems, markOrderAsPaid } from '../actions';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';
import { env } from 'process';
import styles from './page.module.css';

export default function ConfirmationClient({ searchParams }: { searchParams: { order?: string; ref?: string; test?: string } }) {
  const { order: orderId, ref: paymentRef, test: isTest } = searchParams;
  const { clearCart } = useCart();
  const [order, setOrder] = useState<{
    id: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    items: Array<{
      id: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Test mode: simulate successful payment without API calls
  const isTestMode = env.PAYSTACK_TEST_MODE === 'true';
  
  useEffect(() => {
    async function handlePayment() {
      try {
        if (paymentRef && !isTest) {
          // Only verify real payments, not test mode
          const verificationResult = await verifyPayment(paymentRef);
          if (verificationResult.success && verificationResult.orderId) {
            // Clear cart after successful payment
            clearCart();
            // Fetch the order
            const orderData = await getOrderWithItems(verificationResult.orderId);
            setOrder(orderData);
          }
        } else if (isTest && isTestMode && orderId) {
          // In test mode, mark order as paid directly
          await markOrderAsPaid(orderId);
          // Clear cart after successful test payment
          clearCart();
          // Fetch the order
          const orderData = await getOrderWithItems(orderId);
          setOrder(orderData);
        } else if (orderId) {
          // If we have an order ID but no payment reference, just fetch the order
          const orderData = await getOrderWithItems(orderId);
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Error handling payment:', error);
      } finally {
        setLoading(false);
      }
    }
    
    handlePayment();
  }, [paymentRef, isTest, isTestMode, orderId, clearCart]);

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