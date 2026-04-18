'use client';

import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.css';

export default function CheckoutSummary() {
  const { items, total } = useCart();

  return (
    <div className={styles.summary}>
      <h2 className={styles.summaryTitle}>Order summary</h2>

      <div className={styles.summaryItems}>
        {items.map(item => (
          <div key={item.id} className={styles.summaryItem}>
            <div className={styles.summaryItemImg}>
              {item.image ? (
                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div className={styles.summaryItemImgPlaceholder} />
              )}
              <span className={styles.summaryQtyBadge}>{item.quantity}</span>
            </div>
            <div className={styles.summaryItemInfo}>
              <p className={styles.summaryItemName}>{item.name}</p>
              {item.category && <p className={styles.summaryItemCat}>{item.category}</p>}
            </div>
            <p className={styles.summaryItemPrice}>GHS {(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className={styles.summaryDivider} />

      <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <span>GHS {total.toLocaleString()}</span>
      </div>
      <div className={styles.summaryRow}>
        <span>Shipping</span>
        <span className={styles.summaryShip}>Calculated on confirmation</span>
      </div>

      <div className={styles.summaryDivider} />

      <div className={styles.summaryTotal}>
        <span>Total</span>
        <span>GHS {total.toLocaleString()}</span>
      </div>

      <div className={styles.impactNote}>
        <span className={styles.impactIcon}>✦</span>
        <span>Every purchase directly supports a trained artisan and funds the next programme cohort.</span>
      </div>
    </div>
  );
}
