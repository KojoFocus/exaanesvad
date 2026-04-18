'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const OrderSchema = z.object({
  customerName:  z.string().min(2),
  customerEmail: z.string().optional().transform(v => v ?? ''),
  customerPhone: z.string().min(7),
  address:       z.string().min(5),
  notes:         z.string().optional(),
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
