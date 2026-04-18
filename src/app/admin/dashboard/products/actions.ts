'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';
import { z } from 'zod';

const ProductSchema = z.object({
  name:             z.string().min(2),
  shortDescription: z.string().min(2),
  description:      z.string().min(10),
  price:            z.coerce.number().min(0),
  stock:            z.coerce.number().int().min(0),
  categoryId:       z.string().min(1),
  featured:         z.coerce.boolean().optional().default(false),
  published:        z.coerce.boolean().optional().default(false),
});

export async function createProduct(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const data = ProductSchema.parse({
    ...raw,
    featured:  formData.get('featured') === 'on',
    published: formData.get('published') === 'on',
  });

  const slug = slugify(data.name, { lower: true, strict: true });
  const images = formData.getAll('images').map(String).filter(Boolean);

  await prisma.product.create({
    data: {
      ...data,
      slug,
      images,
    },
  });

  revalidatePath('/admin/dashboard/products');
  revalidatePath('/shop');
  redirect('/admin/dashboard/products');
}

export async function updateProduct(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const data = ProductSchema.parse({
    ...raw,
    featured:  formData.get('featured') === 'on',
    published: formData.get('published') === 'on',
  });

  const slug = slugify(data.name, { lower: true, strict: true });
  const images = formData.getAll('images').map(String).filter(Boolean);

  await prisma.product.update({
    where: { id },
    data: { ...data, slug, images },
  });

  revalidatePath('/admin/dashboard/products');
  revalidatePath('/shop');
  redirect('/admin/dashboard/products');
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/dashboard/products');
  revalidatePath('/shop');
}

export async function togglePublish(id: string, published: boolean) {
  await prisma.product.update({ where: { id }, data: { published } });
  revalidatePath('/admin/dashboard/products');
  revalidatePath('/shop');
}
