'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { createOrder } from './actions';
import styles from './page.module.css';

export default function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createOrder(
        items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        fd
      );

      if (result.success) {
        clearCart();
        router.push(`/checkout/confirmation?order=${result.orderId}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.section}>
        <h2 className={styles.secTitle}>Contact information</h2>
        <div className={styles.fg}>
          <label className={styles.label}>Full name <span className={styles.req}>*</span></label>
          <input name="customerName" required className={styles.input} placeholder="Kwame Mensah" />
        </div>
        <div className={styles.fg}>
          <label className={styles.label}>Phone number <span className={styles.req}>*</span></label>
          <input name="customerPhone" type="tel" required className={styles.input} placeholder="+233 XX XXX XXXX" />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.secTitle}>Delivery address</h2>
        <div className={styles.fg}>
          <label className={styles.label}>Full address <span className={styles.req}>*</span></label>
          <textarea name="address" required className={styles.textarea} placeholder="Street, district, city, region…" />
        </div>
        <div className={styles.fg}>
          <label className={styles.label}>Order notes <span className={styles.opt}>(optional)</span></label>
          <textarea name="notes" className={styles.textarea} placeholder="Any special delivery instructions?" />
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isPending || items.length === 0}>
        {isPending ? 'Placing order…' : `Place order · GHS ${total.toLocaleString()}`}
      </button>

      <p className={styles.terms}>
        By placing this order you agree to our terms. We will contact you to confirm delivery details.
      </p>
    </form>
  );
}
