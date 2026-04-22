'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { createOrderWithPayment } from './actions';
import styles from './page.module.css';

// ─── Returning-user profile stored in localStorage ───────────────────────────
const PROFILE_KEY = 'exa-customer-profile';

interface SavedProfile {
  phone: string;
  address: string;
  notes?: string;
}

function loadProfile(): SavedProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(p: SavedProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
}

// ─── Ghanaian phone normaliser ────────────────────────────────────────────────
// Accepts: 0241234567 | +233241234567 | 233241234567
// Returns: +233XXXXXXXXX  or the original string if it can't be parsed
function normaliseGhPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('233') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+233${digits.slice(1)}`;
  if (digits.length === 9) return `+233${digits}`;
  return raw.trim();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [savedProfile, setSavedProfile] = useState<SavedProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  // Load saved profile on mount (client-only)
  useEffect(() => {
    const p = loadProfile();
    setSavedProfile(p);
    setProfileLoaded(true);
  }, []);

  // Auto-fill fields when profile loads
  useEffect(() => {
    if (!profileLoaded || !savedProfile) return;
    if (phoneRef.current && !phoneRef.current.value) {
      phoneRef.current.value = savedProfile.phone;
    }
    if (addressRef.current && !addressRef.current.value) {
      addressRef.current.value = savedProfile.address;
    }
  }, [profileLoaded, savedProfile]);

  function validatePhone(value: string): boolean {
    const digits = value.replace(/\D/g, '');
    // Must be 9–12 digits (Ghanaian numbers)
    if (digits.length < 9 || digits.length > 12) {
      setPhoneError('Enter a valid Ghanaian phone number (e.g. 0241234567)');
      return false;
    }
    setPhoneError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const fd = new FormData(e.currentTarget);
    const phone = (fd.get('customerPhone') as string) || '';

    if (!validatePhone(phone)) {
      phoneRef.current?.focus();
      return;
    }

    // Normalise phone before sending
    fd.set('customerPhone', normaliseGhPhone(phone));

    startTransition(async () => {
      const result = await createOrderWithPayment(
        items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        fd
      );

      if (result.success && result.authorizationUrl) {
        // Persist profile for next visit
        saveProfile({
          phone: normaliseGhPhone(phone),
          address: (fd.get('address') as string) || '',
          notes:   (fd.get('notes')   as string) || '',
        });
        // Clear cart then redirect to Paystack
        clearCart();
        window.location.href = result.authorizationUrl;
      } else if (!result.success) {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  const isReturning = profileLoaded && !!savedProfile && !dismissedBanner;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>

      {/* ── Returning-user banner ── */}
      {isReturning && (
        <div className={styles.returningBanner} role="status">
          <span className={styles.returningIcon}>👋</span>
          <span>
            Welcome back! We've pre-filled your details from your last order.{' '}
            <button
              type="button"
              className={styles.returningEdit}
              onClick={() => setDismissedBanner(true)}
            >
              Edit
            </button>
          </span>
          <button
            type="button"
            className={styles.returningClose}
            aria-label="Dismiss"
            onClick={() => setDismissedBanner(true)}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className={styles.errorBanner} role="alert" aria-live="assertive">
          <strong>Something went wrong:</strong> {error}
        </div>
      )}

      {/* ── Single step: Phone + Delivery ── */}
      <div className={styles.section}>
        <h2 className={styles.secTitle}>Your details</h2>

        {/* Phone */}
        <div className={styles.fg}>
          <label htmlFor="checkout-phone" className={styles.label}>
            Phone number <span className={styles.req}>*</span>
          </label>
          <div className={styles.phoneWrap}>
            <span className={styles.phonePrefix}>🇬🇭 +233</span>
            <input
              ref={phoneRef}
              id="checkout-phone"
              name="customerPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              className={`${styles.input} ${styles.phoneInput} ${phoneError ? styles.inputError : ''}`}
              placeholder="024 123 4567"
              aria-describedby={phoneError ? 'phone-error' : 'phone-hint'}
              onBlur={e => validatePhone(e.target.value)}
              onChange={() => phoneError && setPhoneError('')}
            />
          </div>
          {phoneError
            ? <span id="phone-error" className={styles.fieldError} role="alert">{phoneError}</span>
            : <span id="phone-hint" className={styles.fieldHint}>We'll call or WhatsApp you to confirm delivery</span>
          }
        </div>

        {/* Delivery address */}
        <div className={styles.fg}>
          <label htmlFor="checkout-address" className={styles.label}>
            Delivery location <span className={styles.req}>*</span>
          </label>
          <textarea
            ref={addressRef}
            id="checkout-address"
            name="address"
            required
            minLength={5}
            className={styles.textarea}
            placeholder="e.g. Madina Market, near Total filling station, Accra"
            aria-describedby="address-hint"
          />
          <span id="address-hint" className={styles.fieldHint}>
            Landmark, street, area, city — the more detail, the faster we deliver
          </span>
        </div>

        {/* Notes (optional, collapsed by default on mobile) */}
        <details className={styles.notesDetails}>
          <summary className={styles.notesSummary}>
            Add special instructions <span className={styles.opt}>(optional)</span>
          </summary>
          <div className={styles.fg} style={{ marginTop: 10 }}>
            <textarea
              id="checkout-notes"
              name="notes"
              className={styles.textarea}
              placeholder="Preferred delivery time, gate colour, contact person, etc."
              rows={3}
            />
          </div>
        </details>
      </div>

      {/* ── Payment method hint ── */}
      <div className={styles.paymentHint}>
        <span className={styles.paymentHintIcon}>🔒</span>
        <span>
          Pay securely with <strong>card</strong> or <strong>mobile money</strong> (MTN, Vodafone, AirtelTigo)
        </span>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isPending || items.length === 0}
        aria-busy={isPending}
      >
        {isPending
          ? <><span className={styles.spinner} aria-hidden="true" /> Processing…</>
          : `Pay GHS ${total.toLocaleString()} →`
        }
      </button>

      <p className={styles.terms}>
        By placing this order you agree to our terms. You'll be redirected to Paystack's
        secure payment page. Your phone and delivery details are saved only for your convenience.
      </p>

      {/* SR live region */}
      <p className={styles.srLive} aria-live="polite" aria-atomic="true">
        {isPending ? 'Processing your order, please wait.' : ''}
      </p>
    </form>
  );
}
