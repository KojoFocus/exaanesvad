/**
 * Paystack Webhook Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Paystack POSTs signed events to this endpoint whenever a transaction status
 * changes. This is the *authoritative* way to mark orders as paid — the
 * confirmation-page redirect is just a UX shortcut that can fail if the user
 * closes the browser early.
 *
 * Setup in Paystack dashboard:
 *   Settings → API Keys & Webhooks → Webhook URL
 *   → https://yourdomain.com/api/webhooks/paystack
 *
 * Events handled:
 *   charge.success   — mark order paid
 *   charge.failed    — mark order failed
 *   transfer.*       — ignored (not used here)
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// ─── Signature verification ───────────────────────────────────────────────────
function verifySignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
  return hash === signature;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    console.error('Webhook: PAYSTACK_SECRET_KEY not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  // 1. Read raw body (needed for HMAC verification)
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  // 2. Verify signature — reject anything that doesn't match
  if (!verifySignature(rawBody, signature, PAYSTACK_SECRET_KEY)) {
    console.warn('Webhook: invalid signature — possible spoofed request');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 3. Parse event
  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event: eventType, data } = event;
  const reference = (data?.reference as string) ?? '';

  console.log(`Webhook received: ${eventType} | ref: ${reference}`);

  // 4. Handle charge.success
  if (eventType === 'charge.success') {
    try {
      const order = await prisma.order.findFirst({
        where:   { paymentReference: reference },
        include: { items: true },  // needed for item count calculation
      });

      if (!order) {
        // Could be a transaction not created through this app — log and return 200
        // (Paystack retries on non-2xx, so always return 200 for known-ignorable events)
        console.warn(`Webhook: no order found for reference ${reference}`);
        return NextResponse.json({ received: true });
      }

      // Idempotency — don't double-process
      if (order.paymentStatus === 'paid') {
        console.log(`Webhook: order ${order.id} already paid — skipping`);
        return NextResponse.json({ received: true });
      }

      // Amount integrity check
      const paidPesewas = (data?.amount as number) ?? 0;
      const paidGhs     = paidPesewas / 100;
      if (Math.abs(paidGhs - order.totalAmount) > 0.01) {
        console.error(
          `Webhook: amount mismatch for order ${order.id} — expected GHS ${order.totalAmount}, got GHS ${paidGhs}`
        );
        await prisma.order.update({
          where: { id: order.id },
          data:  { paymentStatus: 'failed' },
        });
        return NextResponse.json({ received: true });
      }

      await prisma.order.update({
        where: { id: order.id },
        data:  { paymentStatus: 'paid' },
      });

      console.log(`✅ Webhook: order ${order.id} marked as paid`);

      // Send notifications to delivery team ONLY when payment actually succeeds
      // This is the only place notifications are triggered
      try {
        const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
        const { sendOrderNotifications } = await import('@/lib/notifications');
        await sendOrderNotifications({
          orderId:       order.id,
          customerName:  order.customerPhone,
          customerPhone: order.customerPhone,
          totalAmount:   order.totalAmount,
          itemCount,
          address:       order.address,
          items:         order.items.map(i => ({
            productName: i.productName,
            quantity:    i.quantity,
            unitPrice:   i.unitPrice,
          })),
        });
        console.log(`✅ Notifications sent for order ${order.id}`);
      } catch (notificationError) {
        console.error('Failed to send order notifications:', notificationError);
      }
    } catch (err) {
      console.error('Webhook: error processing charge.success:', err);
      // Return 500 so Paystack retries
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
  }

  // 5. Handle charge.failed / abandoned
  if (eventType === 'charge.failed') {
    try {
      const order = await prisma.order.findFirst({
        where: { paymentReference: reference },
      });

      if (order && order.paymentStatus === 'pending') {
        await prisma.order.update({
          where: { id: order.id },
          data:  { paymentStatus: 'failed' },
        });
        console.log(`Webhook: order ${order.id} marked as failed`);
      }
    } catch (err) {
      console.error('Webhook: error processing charge.failed:', err);
    }
  }

  // Always return 200 so Paystack doesn't retry unnecessarily
  return NextResponse.json({ received: true });
}

// Paystack only sends POST — reject everything else
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
