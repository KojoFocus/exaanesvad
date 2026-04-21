'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { initializePayment } from '@/lib/paystack';
import { sendOrderNotifications } from '@/lib/notifications';
// Enhanced schema with stricter validation
const OrderSchema = z.object({
  customerName:  z.string().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  customerEmail: z.string().email('Invalid email format').optional().transform(v => v ?? ''),
  customerPhone: z.string().min(7).max(20).regex(/^[\d\+\-\s]+$/, 'Phone contains invalid characters'),
  address:       z.string().min(5).max(500),
  notes:         z.string().max(1000).optional(),
});

interface CartItemInput {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function createOrder(
  cartItems: CartItemInput[],
  formData: FormData
): Promise<{ success: true; orderId: string } | { success: false; error: string }> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const data = OrderSchema.parse(raw);

    if (!cartItems.length) return { success: false, error: 'Cart is empty' };

    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        customerName:  data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        address:       data.address,
        notes:         data.notes ?? null,
        totalAmount:   total,
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

    return { success: true, orderId: order.id };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0].message };
    }
    console.error('createOrder error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function createOrderWithPayment(
  cartItems: CartItemInput[],
  formData: FormData
): Promise<{ success: true; authorizationUrl?: string; orderId?: string } | { success: false; error: string }> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const data = OrderSchema.parse(raw);

    if (!cartItems.length) return { success: false, error: 'Cart is empty' };

    // Test mode helper — read at call time so env vars are available
    const isTestMode = process.env.PAYSTACK_TEST_MODE === 'true';

    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const reference = `EXA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const baseUrl = process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3003');
    const callbackUrl = `${baseUrl}/checkout/confirmation?order=reference&ref=${reference}`;

    // Create order with pending payment
    const order = await prisma.order.create({
      data: {
        customerName:  data.customerName,
        customerEmail: data.customerEmail || '',
        customerPhone: data.customerPhone,
        address:       data.address,
        notes:         data.notes ?? null,
        totalAmount:   total,
        paymentStatus: 'pending',
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

    // Send notification to +233246114671 about new order
    try {
      await sendOrderNotifications({
        orderId: order.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        totalAmount: total,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    } catch (notificationError) {
      console.error('Failed to send order notification:', notificationError);
      // Don't throw error to prevent order creation failure
    }

    // Initialize Paystack payment (or simulate in test mode)
    let paymentResult;
    
    if (isTestMode) {
      console.log('🧪 TEST MODE: Simulating successful payment for order', order.id);
      paymentResult = {
        success: true,
        authorizationUrl: `${baseUrl}/checkout/confirmation?order=${order.id}&ref=${reference}&test=true`
      };
    } else {
      paymentResult = await initializePayment({
        email: data.customerEmail || `${data.customerName.replace(/\s+/g, '.').toLowerCase()}@example.com`,
        amount: total,
        reference: reference,
        callbackUrl: callbackUrl,
        metadata: {
          custom_fields: [
            {
              display_name: 'Order ID',
              variable_name: 'order_id',
              value: order.id,
            },
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: data.customerName,
            },
          ],
        },
      });
    }

    if (paymentResult.success && paymentResult.authorizationUrl) {
      return { success: true, authorizationUrl: paymentResult.authorizationUrl, orderId: order.id };
    }

    // If payment initialization failed, update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'failed' },
    });

    return { success: false, error: paymentResult.error || 'Failed to initialize payment' };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0].message };
    }
    console.error('createOrderWithPayment error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function clearCartAfterPayment(orderId: string): Promise<void> {
  try {
    // Clear cart from localStorage (client-side)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('exa-cart');
    }
    
    // If you have a cart table in your database, you could clear it like this:
    // await prisma.cartItem.deleteMany({ where: { orderId: null } });
    
    console.log('✅ Cart cleared after successful payment for order:', orderId);
  } catch (err) {
    console.error('Error clearing cart:', err);
  }
}

export async function getOrderWithItems(orderId: string): Promise<{
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
} | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    return order;
  } catch (error) {
    console.error('getOrderWithItems error:', error);
    return null;
  }
}

export async function markOrderAsPaid(orderId: string): Promise<{ success: boolean }> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'paid' },
    });
    return { success: true };
  } catch (error) {
    console.error('markOrderAsPaid error:', error);
    return { success: false };
  }
}

export async function verifyPayment(reference: string): Promise<{ success: true; orderId?: string } | { success: false; error: string }> {
  try {
    // Validate reference format before making API call
    if (!reference || typeof reference !== 'string' || reference.length > 100) {
      return { success: false, error: 'Invalid payment reference' };
    }

    const { verifyTransaction } = await import('@/lib/paystack');
    
    const result = await verifyTransaction(reference);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Payment verification failed' };
    }

    const paymentData = result.data;
    
    // Find order by payment reference
    const order = await prisma.order.findFirst({
      where: { paymentReference: reference },
    });

    if (!order) {
      console.warn(`Order not found for reference: ${reference}`);
      return { success: false, error: 'Order not found' };
    }

    // Prevent double-payment: only process if still pending
    if (order.paymentStatus !== 'pending') {
      console.warn(`Order ${order.id} already processed with status: ${order.paymentStatus}`);
      return { success: false, error: 'Payment already processed' };
    }

    if (paymentData.status === 'success') {
      // Verify amount matches (allow small rounding differences)
      const paidAmount = paymentData.amount / 100; // Convert from kobo
      const amountDifference = Math.abs(paidAmount - order.totalAmount);
      
      if (amountDifference > 0.01) {
        console.error(`Amount mismatch for order ${order.id}: expected ${order.totalAmount}, got ${paidAmount}`);
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'failed' },
        });
        return { success: false, error: 'Payment amount does not match order total' };
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'paid' },
      });
      return { success: true, orderId: order.id };
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'failed' },
      });
      return { success: false, error: 'Payment was not successful' };
    }
  } catch (err) {
    console.error('verifyPayment error:', err);
    return { success: false, error: 'Payment verification failed' };
  }
}
