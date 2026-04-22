import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderNotifications } from '@/lib/notifications';

/**
 * Test endpoint to simulate a successful Paystack payment
 * ─────────────────────────────────────────────────────────────────────────────
 * Use this to test notifications without needing a real Paystack webhook.
 * This runs EXACTLY the same code path as the real webhook:
 *   1. Looks up order by ID
 *   2. Marks it as paid
 *   3. Triggers all notifications (SMS, WhatsApp, email)
 *
 * Usage:
 *   POST /api/test/simulate-payment?id=clxyz123...
 *
 * Remove this endpoint when you have a real Paystack webhook set up.
 */

export async function POST(req: NextRequest) {
  // Optional: uncomment to restrict to localhost only
  // const ip = req.ip ?? '::1';
  // if (ip !== '::1' && ip !== '127.0.0.1') {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID parameter' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Don't double-process already paid orders
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        status:  'ok',
        message: 'Order already marked as paid',
        orderId: order.id,
      });
    }

    // Mark as paid — EXACT same code as real webhook
    await prisma.order.update({
      where: { id: order.id },
      data:  { paymentStatus: 'paid' },
    });

    console.log(`✅ Test: order ${order.id} marked as paid`);

    // Trigger ALL notifications — EXACT same code as real webhook
    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
    await sendOrderNotifications({
      orderId:       order.id,
      customerName:  order.customerPhone,
      customerPhone: order.customerPhone,
      totalAmount:   order.totalAmount,
      itemCount,
      address:       order.address,
    });

    console.log(`✅ Test: notifications sent for order ${order.id}`);

    return NextResponse.json({
      status:  'ok',
      message: 'Simulated payment successful. Notifications sent.',
      orderId: order.id,
    });

  } catch (err) {
    console.error('Test simulate payment error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
