'use client';

import { useState, useTransition } from 'react';
import styles from './page.module.css';

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const fd = new FormData(e.currentTarget);
    const name    = fd.get('name')    as string;
    const email   = fd.get('email')   as string;
    const subject = fd.get('subject') as string;
    const message = fd.get('message') as string;

    if (!name || !email || !message) {
      setError('Please fill in all required fields.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        });
        if (!res.ok) throw new Error('Send failed');
        setSent(true);
      } catch {
        setError('Something went wrong. Please email us directly at info@exa-anesvad.org');
      }
    });
  }

  if (sent) {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>✓</div>
        <h2 className={styles.successTitle}>Message sent</h2>
        <p className={styles.successText}>Thank you for reaching out. We'll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.row2}>
        <div className={styles.fg}>
          <label className={styles.label}>Name <span className={styles.req}>*</span></label>
          <input name="name" required className={styles.input} placeholder="Your full name" />
        </div>
        <div className={styles.fg}>
          <label className={styles.label}>Email <span className={styles.req}>*</span></label>
          <input name="email" type="email" required className={styles.input} placeholder="you@example.com" />
        </div>
      </div>

      <div className={styles.fg}>
        <label className={styles.label}>Subject</label>
        <input name="subject" className={styles.input} placeholder="e.g. Product inquiry, Partnership, Programme info…" />
      </div>

      <div className={styles.fg}>
        <label className={styles.label}>Message <span className={styles.req}>*</span></label>
        <textarea name="message" required className={styles.textarea} placeholder="How can we help?" />
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isPending}>
        {isPending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
