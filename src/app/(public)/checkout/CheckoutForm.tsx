'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { createOrderWithPayment } from './actions';
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
      const result = await createOrderWithPayment(
        items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        fd
      );

      if (result.success && result.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = result.authorizationUrl;
      } else if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && (
        <div className={styles.errorBanner} role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.secTitle}>Customer details</h2>
        <div className={styles.row2}>
          <div className={styles.fg}>
            <label htmlFor="checkout-customer-name" className={styles.label}>Full name <span className={styles.req}>*</span></label>
            <input 
              id="checkout-customer-name" 
              name="customerName" 
              required 
              className={styles.input} 
              placeholder="e.g., Kwame Mensah" 
            />
          </div>
          <div className={styles.fg}>
            <label htmlFor="checkout-customer-phone" className={styles.label}>Phone number <span className={styles.req}>*</span></label>
            <input 
              id="checkout-customer-phone" 
              name="customerPhone" 
              type="tel" 
              required 
              className={styles.input} 
              placeholder="+233 XX XXX XXXX" 
            />
          </div>
        </div>
        <div className={styles.fg}>
          <label htmlFor="checkout-customer-email" className={styles.label}>Email address <span className={styles.opt}>(optional)</span></label>
          <input 
            id="checkout-customer-email" 
            name="customerEmail" 
            type="email" 
            className={styles.input} 
            placeholder="your@email.com" 
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.secTitle}>Delivery information</h2>
        <div className={styles.fg}>
          <label htmlFor="checkout-address" className={styles.label}>Delivery address <span className={styles.req}>*</span></label>
          <textarea 
            id="checkout-address" 
            name="address" 
            required 
            className={styles.textarea} 
            placeholder="House number, street, district, city, region" 
          />
        </div>
        <div className={styles.fg}>
          <label htmlFor="checkout-notes" className={styles.label}>Special instructions <span className={styles.opt}>(optional)</span></label>
          <textarea 
            id="checkout-notes" 
            name="notes" 
            className={styles.textarea} 
            placeholder="Delivery time preferences, contact person, etc." 
          />
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isPending || items.length === 0}>
        {isPending ? 'Processing payment…' : `Complete order · GHS ${total.toLocaleString()}`}
      </button>

      <p className={styles.terms}>
        Your order will be processed securely. After clicking "Complete order", you'll be redirected to our payment partner to finalize the transaction.
      </p>

      <p className={styles.srLive} aria-live="polite" aria-atomic="true">
        {isPending ? 'Processing payment.' : ''}
      </p>
    </form>
  );
}
