'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { verifyPayment, getOrderForConfirmation, retryPayment } from '../actions';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderData = {
  id:            string;
  customerPhone: string;
  address:       string;
  totalAmount:   number;
  paymentStatus: string;
  items: Array<{
    id:          string;
    productName: string;
    quantity:    number;
    unitPrice:   number;
  }>;
};

type PageState =
  | { status: 'loading' }
  | { status: 'success'; order: OrderData; alreadyProcessed?: boolean }
  | { status: 'failed';  error: string; orderId?: string }
  | { status: 'pending'; message: string };

// ─── Component ────────────────────────────────────────────────────────────────
export default function ConfirmationClient({
  searchParams,
}: {
  searchParams: { ref?: string; orderId?: string; test?: string };
}) {
  const { ref: paymentRef, test: isTestParam } = searchParams;
  const { clearCart } = useCart();
  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });
  const [retrying, setRetrying] = useState(false);
  // Track whether we've already run verification to prevent re-runs
  const hasVerified = useRef(false);

  useEffect(() => {
    // Guard: only run once per mount, even if clearCart reference changes
    if (hasVerified.current) return;
    hasVerified.current = true;

    async function handleVerification() {
      // ── No reference at all ────────────────────────────────────────────────
      if (!paymentRef) {
        setPageState({
          status: 'failed',
          error:  'No payment reference found. If you completed a payment, please contact us.',
        });
        return;
      }

      try {
        // ── Test mode shortcut ─────────────────────────────────────────────
        if (isTestParam === 'true') {
          const order = await getOrderForConfirmation(paymentRef);
          if (order) {
            clearCart();
            setPageState({ status: 'success', order });
          } else {
            setPageState({ status: 'failed', error: 'Order not found in test mode.' });
          }
          return;
        }

        // ── Live verification ──────────────────────────────────────────────
        const result = await verifyPayment(paymentRef);

        if (result.success) {
          clearCart();
          const order = await getOrderForConfirmation(paymentRef);
          if (order) {
            setPageState({
              status: 'success',
              order,
              alreadyProcessed: result.alreadyProcessed,
            });

            // Auto-open WhatsApp with order details (only on first confirmation, not repeat visits)
            if (!result.alreadyProcessed) {
              const shortId = order.id.slice(-8).toUpperCase();
              const itemLines = order.items.length > 0
                ? order.items
                    .map(i => `  • ${i.productName} × ${i.quantity} — GHS ${(i.unitPrice * i.quantity).toLocaleString()}`)
                    .join('\n')
                : '  (see order details)';
              const waMsg = encodeURIComponent(
                `Hi! I just placed an order on EXA-ANESVAD.\n\n` +
                `📦 Order: #${shortId}\n` +
                `📱 Phone: ${order.customerPhone}\n` +
                (order.address ? `📍 Delivery: ${order.address}\n` : '') +
                `\n🛒 Items:\n${itemLines}\n\n` +
                `💰 Total paid: GHS ${order.totalAmount.toLocaleString()}\n\n` +
                `Please confirm my delivery. Thank you!`
              );
              // Small delay so the page renders first, then WhatsApp opens
              setTimeout(() => {
                window.open(`https://wa.me/233246114671?text=${waMsg}`, '_blank');
              }, 1200);
            }
          } else {
            setPageState({
              status: 'success',
              order: {
                id:            result.orderId,
                customerPhone: '',
                address:       '',
                totalAmount:   0,
                paymentStatus: 'paid',
                items:         [],
              },
            });
          }
        } else {
          let failedOrderId: string | undefined;
          const failedOrder = await getOrderForConfirmation(paymentRef);
          failedOrderId = failedOrder?.id;
          setPageState({
            status:  'failed',
            error:   result.error,
            orderId: failedOrderId,
          });
        }
      } catch (err) {
        console.error('ConfirmationClient error:', err);
        setPageState({
          status: 'failed',
          error:  'An unexpected error occurred. Please contact us if you were charged.',
        });
      }
    }

    handleVerification();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps — intentionally run once on mount only

  // ── Retry handler ──────────────────────────────────────────────────────────
  async function handleRetry(failedOrderId: string) {
    setRetrying(true);
    try {
      const result = await retryPayment(failedOrderId);
      if (result.success) {
        window.location.href = result.authorizationUrl;
      } else {
        setPageState({
          status:  'failed',
          error:   result.error || 'Could not restart payment. Please go back to checkout.',
          orderId: failedOrderId,
        });
      }
    } catch {
      setPageState({
        status:  'failed',
        error:   'Could not restart payment. Please go back to checkout.',
        orderId: failedOrderId,
      });
    } finally {
      setRetrying(false);
    }
  }

  // ─── Render: loading ───────────────────────────────────────────────────────
  if (pageState.status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap} aria-live="polite" aria-busy="true">
          <span className={styles.loadingSpinner} aria-hidden="true" />
          <p className={styles.loadingText}>Confirming your payment…</p>
          <p className={styles.loadingSubtext}>Please don't close this page.</p>
        </div>
      </div>
    );
  }

  // ─── Render: failed ────────────────────────────────────────────────────────
  if (pageState.status === 'failed') {
    return (
      <div className={styles.page}>
        <div className={styles.failIcon} aria-hidden="true">✕</div>
        <h1 className={styles.title}>Payment not completed</h1>
        <p className={styles.sub}>{pageState.error}</p>

        <div className={styles.failCard}>
          <p className={styles.failCardText}>
            <strong>No charge was made</strong> unless you see a deduction on your account.
            If you were charged but see this page, please contact us with your phone number.
          </p>
        </div>

        <div className={styles.actions}>
          {pageState.orderId && (
            <button
              className={styles.retryBtn}
              onClick={() => handleRetry(pageState.orderId!)}
              disabled={retrying}
              aria-busy={retrying}
            >
              {retrying ? 'Redirecting…' : 'Try payment again →'}
            </button>
          )}
          <Link href="/checkout" className={styles.shopBtn}>
            Back to checkout
          </Link>
          <Link href="/shop" className={styles.homeLink}>
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── Render: success ───────────────────────────────────────────────────────
  if (pageState.status !== 'success') return null;
  const { order, alreadyProcessed } = pageState;
  const shortId = order.id.slice(-8).toUpperCase();

  // Build pre-filled WhatsApp message sent TO the shop number
  // Includes full product list so you know exactly what was ordered
  const itemLines = order.items.length > 0
    ? order.items
        .map(i => `  • ${i.productName} × ${i.quantity} — GHS ${(i.unitPrice * i.quantity).toLocaleString()}`)
        .join('\n')
    : '  (see order details)';

  const waMessage = encodeURIComponent(
    `Hi! I just placed an order on EXA-ANESVAD.\n\n` +
    `📦 Order: #${shortId}\n` +
    `📱 Phone: ${order.customerPhone}\n` +
    (order.address ? `📍 Delivery: ${order.address}\n` : '') +
    `\n🛒 Items:\n${itemLines}\n\n` +
    `💰 Total paid: GHS ${order.totalAmount.toLocaleString()}\n\n` +
    `Please confirm my delivery. Thank you!`
  );
  // Opens WhatsApp with a pre-filled message to the shop number
  const waUrl = `https://wa.me/233246114671?text=${waMessage}`;

  return (
    <div className={styles.page}>
      <div className={styles.icon} aria-hidden="true">✓</div>

      <h1 className={styles.title}>
        {alreadyProcessed ? 'Order already confirmed' : 'Thank you for your order!'}
      </h1>

      <p className={styles.sub}>
        Your order has been received. Tap the button below to confirm your delivery on WhatsApp.
      </p>

      {/* ── WhatsApp notification button ── */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.waBtn}
      >
        <span aria-hidden="true">💬</span> Confirm order on WhatsApp
      </a>

      {/* ── Order summary card ── */}
      {order.items.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardLabel}>Order confirmation</span>
            <span className={styles.cardId}>#{shortId}</span>
          </div>

          <div className={styles.items}>
            {order.items.map(item => (
              <div key={item.id} className={styles.item}>
                <span className={styles.itemName}>{item.productName}</span>
                <span className={styles.itemQty}>× {item.quantity}</span>
                <span className={styles.itemPrice}>
                  GHS {(item.unitPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.total}>
            <span>Order total</span>
            <span className={styles.totalAmt}>GHS {order.totalAmount.toLocaleString()}</span>
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className={styles.deliveryRow}>
              <span className={styles.deliveryLabel}>Delivering to</span>
              <span className={styles.deliveryValue}>{order.address}</span>
            </div>
          )}
        </div>
      )}

      {/* ── What happens next ── */}
      <div className={styles.nextSteps}>
        <p className={styles.nextStepsTitle}>What happens next</p>
        <ol className={styles.nextStepsList}>
          <li>We'll call or WhatsApp you within <strong>24 hours</strong> to confirm your delivery.</li>
          <li>Delivery is arranged directly with you — no guessing.</li>
          <li>Keep your phone on. We'll reach out on <strong>{order.customerPhone || 'the number you provided'}</strong>.</li>
        </ol>
      </div>

      {/* ── Impact note ── */}
      <div className={styles.impactNote}>
        <span className={styles.impactIcon} aria-hidden="true">✦</span>
        Your purchase supports people living with NTDs, vulnerable women, and persons with
        disabilities through our skills training programmes.
      </div>

      <div className={styles.actions}>
        <Link href="/shop" className={styles.shopBtn}>Continue shopping</Link>
        <Link href="/" className={styles.homeLink}>← Back to home</Link>
      </div>
    </div>
  );
}
