'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.css';

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, clearCart } = useCart();

  if (count === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyLabel}>Your cart</p>
        <h1 className={styles.emptyTitle}>Nothing here yet.</h1>
        <p className={styles.emptySub}>Browse the shop to find products made by trained artisans in Ghana.</p>
        <Link href="/shop" className={styles.emptyBtn}>Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Your cart <span className={styles.count}>({count} item{count !== 1 ? 's' : ''})</span></h1>
      </div>

      <div className={styles.layout}>
        {/* Items */}
        <div className={styles.items}>
          {items.map(item => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemImg}>
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.itemImgPlaceholder} />
                )}
              </div>

              <div className={styles.itemInfo}>
                {item.category && <p className={styles.itemCat}>{item.category}</p>}
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemPrice}>GHS {item.price.toLocaleString()}</p>
              </div>

              <div className={styles.itemRight}>
                <div className={styles.qtyRow}>
                  <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                  <span className={styles.qtyNum}>{item.quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                </div>
                <p className={styles.itemTotal}>GHS {(item.price * item.quantity).toLocaleString()}</p>
                <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            </div>
          ))}

          <div className={styles.clearRow}>
            <button className={styles.clearBtn} onClick={clearCart}>Clear cart</button>
            <Link href="/shop" className={styles.continueLink}>← Continue shopping</Link>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order summary</h2>

          <div className={styles.summaryLines}>
            {items.map(item => (
              <div key={item.id} className={styles.summaryLine}>
                <span className={styles.summaryLineLabel}>{item.name} × {item.quantity}</span>
                <span>GHS {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className={styles.summaryDivider} />

          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span className={styles.summaryTotalAmt}>GHS {total.toLocaleString()}</span>
          </div>

          <p className={styles.summaryNote}>
            Shipping and taxes calculated at checkout.
          </p>

          <Link href="/checkout" className={styles.checkoutBtn}>
            Proceed to checkout →
          </Link>

          <div className={styles.impactNote}>
            <span className={styles.impactIcon}>✦</span>
            Your purchase supports trained artisans and funds future livelihoods.
          </div>
        </div>
      </div>
    </div>
  );
}
