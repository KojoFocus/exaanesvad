'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function deleteOrder(id: string) {
  await prisma.order.delete({ where: { id } });
  revalidatePath('/admin/dashboard/orders');
}

export async function updateOrderStatus(id: string, formData: FormData) {
  const status = formData.get('status') as string;
  await prisma.order.update({ where: { id }, data: { status: status as any } });
  revalidatePath('/admin/dashboard/orders');
}
