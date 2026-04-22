'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { initializePayment } from '@/lib/paystack';
import { sendOrderNotifications } from '@/lib/notifications';

// ─── Validation schema ────────────────────────────────────────────────────────
// Email is NOT collected from the user — we auto-generate it from the phone number.
// Name is NOT required — we use "Customer" as a fallback for Paystack metadata.
const OrderSchema = z.object({
  customerPhone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^\+?[\d\s\-]+$/, 'Phone contains invalid characters'),
  address: z.string().min(5).max(500),
  notes:   z.string().max(1000).optional(),
});

interface CartItemInput {
  id:       string;
  name:     string;
  price:    number;
  quantity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Deterministic, URL-safe reference: EXA-<timestamp>-<random6> */
function generateReference(): string {
  const ts  = Date.now().toString(36).toUpperCase();          // base-36 timestamp
  const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EXA-${ts}-${rnd}`;
}

/**
 * Derive a synthetic email from the phone number so Paystack's required
 * email field is always satisfied without asking the user for one.
 * e.g. +233241234567 → 233241234567@orders.exaanesvad.com
 */
function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const domain = process.env.ORDER_EMAIL_DOMAIN || 'orders.exaanesvad.com';
  return `${digits}@${domain}`;
}

function getBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://exaanesvad.com' : 'http://localhost:3003')
  );
}

// ─── createOrderWithPayment ───────────────────────────────────────────────────
export async function createOrderWithPayment(
  cartItems: CartItemInput[],
  formData: FormData
): Promise<
  | { success: true;  authorizationUrl: string; orderId: string }
  | { success: false; error: string }
> {
  try {
    // 1. Validate form data
    const raw  = Object.fromEntries(formData.entries());
    const data = OrderSchema.parse(raw);

    if (!cartItems.length) {
      return { success: false, error: 'Your cart is empty.' };
    }

    // 2. Compute totals
    const total     = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    // 3. Generate reference + synthetic email
    const reference    = generateReference();
    const syntheticEmail = phoneToEmail(data.customerPhone);
    const baseUrl      = getBaseUrl();
    const callbackUrl  = `${baseUrl}/checkout/confirmation?ref=${reference}`;

    // 4. Persist order (status = pending)
    const order = await prisma.order.create({
      data: {
        customerName:     'Customer',          // no name collected — fulfillment uses phone
        customerEmail:    syntheticEmail,
        customerPhone:    data.customerPhone,
        address:          data.address,
        notes:            data.notes ?? null,
        totalAmount:      total,
        paymentStatus:    'pending',
        paymentReference: reference,
        items: {
          create: cartItems.map(item => ({
            productId:   item.id,
            productName: item.name,
            quantity:    item.quantity,
            unitPrice:   item.price,
          })),
        },
      },
    });

    // Notifications are NOT sent here — they are sent *only* when payment succeeds
    // Triggered from Paystack webhook: /api/webhooks/paystack

    // 6. Test-mode shortcut
    const isTestMode = process.env.PAYSTACK_TEST_MODE === 'true';
    if (isTestMode) {
      console.log('🧪 TEST MODE — skipping Paystack, order:', order.id);
      return {
        success: true,
        authorizationUrl: `${baseUrl}/checkout/confirmation?ref=${reference}&orderId=${order.id}&test=true`,
        orderId: order.id,
      };
    }

    // 7. Initialise Paystack payment
    const paymentResult = await initializePayment({
      email:       syntheticEmail,
      amount:      total,
      reference,
      callbackUrl,
      channels:    ['card', 'mobile_money'],   // card + MoMo for Ghana
      metadata: {
        order_id:      order.id,
        customer_phone: data.customerPhone,
        delivery_address: data.address,
        custom_fields: [
          {
            display_name:  'Order ID',
            variable_name: 'order_id',
            value:         order.id,
          },
          {
            display_name:  'Phone',
            variable_name: 'customer_phone',
            value:         data.customerPhone,
          },
          {
            display_name:  'Delivery',
            variable_name: 'delivery_address',
            value:         data.address.substring(0, 100),
          },
        ],
      },
    });

    if (paymentResult.success && paymentResult.authorizationUrl) {
      return {
        success: true,
        authorizationUrl: paymentResult.authorizationUrl,
        orderId: order.id,
      };
    }

    // 8. Payment init failed — mark order as failed
    await prisma.order.update({
      where: { id: order.id },
      data:  { paymentStatus: 'failed' },
    });

    return {
      success: false,
      error: paymentResult.error || 'Failed to initialise payment. Please try again.',
    };

  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0].message };
    }
    console.error('createOrderWithPayment error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// ─── verifyPayment ────────────────────────────────────────────────────────────
/**
 * Called from the confirmation page after Paystack redirects back.
 * Also called by the webhook route for server-side verification.
 */
export async function verifyPayment(
  reference: string
): Promise<
  | { success: true;  orderId: string; alreadyProcessed?: boolean }
  | { success: false; error: string }
> {
  try {
    if (!reference || typeof reference !== 'string' || reference.length > 100) {
      return { success: false, error: 'Invalid payment reference.' };
    }

    // Test-mode: find order by reference and mark paid
    const isTestMode = process.env.PAYSTACK_TEST_MODE === 'true';
    if (isTestMode) {
      const order = await prisma.order.findFirst({ where: { paymentReference: reference } });
      if (!order) return { success: false, error: 'Order not found.' };
      if (order.paymentStatus === 'paid') return { success: true, orderId: order.id, alreadyProcessed: true };
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'paid' } });
      return { success: true, orderId: order.id };
    }

    // Live mode: verify with Paystack API
    const { verifyTransaction } = await import('@/lib/paystack');
    const result = await verifyTransaction(reference);

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Payment verification failed.' };
    }

    const paymentData = result.data;

    // Find order
    const order = await prisma.order.findFirst({ where: { paymentReference: reference } });
    if (!order) {
      console.warn(`verifyPayment: no order for reference ${reference}`);
      return { success: false, error: 'Order not found.' };
    }

    // Idempotency guard — already processed
    if (order.paymentStatus === 'paid') {
      return { success: true, orderId: order.id, alreadyProcessed: true };
    }
    if (order.paymentStatus === 'failed' || order.paymentStatus === 'cancelled') {
      return { success: false, error: `Payment was ${order.paymentStatus}.` };
    }

    if (paymentData.status === 'success') {
      // Amount integrity check (allow ±1 pesewa rounding)
      const paidGhs = paymentData.amount / 100;
      if (Math.abs(paidGhs - order.totalAmount) > 0.01) {
        console.error(
          `Amount mismatch — order ${order.id}: expected GHS ${order.totalAmount}, got GHS ${paidGhs}`
        );
        await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'failed' } });
        return { success: false, error: 'Payment amount does not match order total.' };
      }

      // Fetch items for notification
      const fullOrder = await prisma.order.findUnique({
        where:   { id: order.id },
        include: { items: true },
      });

      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'paid' } });

      // Send notifications (fire-and-forget — never block the response)
      if (fullOrder) {
        const itemCount = fullOrder.items.reduce((sum, i) => sum + i.quantity, 0);
        sendOrderNotifications({
          orderId:       fullOrder.id,
          customerName:  fullOrder.customerPhone,
          customerPhone: fullOrder.customerPhone,
          totalAmount:   fullOrder.totalAmount,
          itemCount,
          address:       fullOrder.address,
          items:         fullOrder.items.map(i => ({
            productName: i.productName,
            quantity:    i.quantity,
            unitPrice:   i.unitPrice,
          })),
        }).catch(err => console.error('Notification error (non-fatal):', err));
      }

      return { success: true, orderId: order.id };

    } else if (paymentData.status === 'abandoned') {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'cancelled' } });
      return { success: false, error: 'Payment was abandoned. You can try again.' };

    } else {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'failed' } });
      return { success: false, error: 'Payment was not successful. Please try again.' };
    }

  } catch (err) {
    console.error('verifyPayment error:', err);
    return { success: false, error: 'Payment verification failed. Please contact support.' };
  }
}

// ─── getOrderForConfirmation ──────────────────────────────────────────────────
/** Returns the data needed to render the confirmation page. */
export async function getOrderForConfirmation(reference: string): Promise<{
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
} | null> {
  try {
    const order = await prisma.order.findFirst({
      where:   { paymentReference: reference },
      include: { items: true },
    });
    return order;
  } catch (err) {
    console.error('getOrderForConfirmation error:', err);
    return null;
  }
}

// ─── retryPayment ─────────────────────────────────────────────────────────────
/**
 * Re-initialises a Paystack payment for a failed/abandoned order.
 * Generates a fresh reference so the old one doesn't block retries.
 */
export async function retryPayment(
  orderId: string
): Promise<
  | { success: true;  authorizationUrl: string }
  | { success: false; error: string }
> {
  try {
    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { items: true },
    });

    if (!order) return { success: false, error: 'Order not found.' };
    if (order.paymentStatus === 'paid') return { success: false, error: 'Order is already paid.' };

    const newReference = generateReference();
    const baseUrl      = getBaseUrl();
    const callbackUrl  = `${baseUrl}/checkout/confirmation?ref=${newReference}`;

    // Update order with new reference
    await prisma.order.update({
      where: { id: orderId },
      data:  { paymentReference: newReference, paymentStatus: 'pending' },
    });

    const paymentResult = await initializePayment({
      email:      phoneToEmail(order.customerPhone),
      amount:     order.totalAmount,
      reference:  newReference,
      callbackUrl,
      channels:   ['card', 'mobile_money'],
      metadata: {
        order_id:         order.id,
        customer_phone:   order.customerPhone,
        delivery_address: order.address,
        custom_fields: [
          { display_name: 'Order ID',  variable_name: 'order_id',         value: order.id },
          { display_name: 'Phone',     variable_name: 'customer_phone',   value: order.customerPhone },
          { display_name: 'Delivery',  variable_name: 'delivery_address', value: order.address.substring(0, 100) },
        ],
      },
    });

    if (paymentResult.success && paymentResult.authorizationUrl) {
      return { success: true, authorizationUrl: paymentResult.authorizationUrl };
    }

    return { success: false, error: paymentResult.error || 'Failed to initialise payment.' };

  } catch (err) {
    console.error('retryPayment error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// ─── Legacy helpers (kept for backward compatibility) ─────────────────────────
export async function getOrderWithItems(orderId: string) {
  try {
    return await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  } catch { return null; }
}

export async function markOrderAsPaid(orderId: string): Promise<{ success: boolean }> {
  try {
    await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'paid' } });
    return { success: true };
  } catch { return { success: false }; }
}
