'use client';

import { updateOrderStatus } from './actions';
import styles from './page.module.css';

const STATUSES = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];

export default function StatusSelect({ orderId, current }: { orderId: string; current: string }) {
  return (
    <form action={updateOrderStatus.bind(null, orderId)}>
      <select
        name="status"
        defaultValue={current}
        className={styles.statusSelect}
        onChange={e => (e.target.form as HTMLFormElement).requestSubmit()}
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
    </form>
  );
}
