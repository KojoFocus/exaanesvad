import { Metadata } from 'next';
import CheckoutForm from './CheckoutForm';
import CheckoutSummary from './CheckoutSummary';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Checkout' };

export default function CheckoutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Checkout</h1>
        <p className={styles.sub}>Complete your order below.</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.formCol}>
          <CheckoutForm />
        </div>
        <div className={styles.summaryCol}>
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}
