'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function createAnnouncement(formData: FormData) {
  const title     = formData.get('title') as string;
  const content   = formData.get('content') as string;
  const featured  = formData.get('featured') === 'on';
  const published = formData.get('published') === 'on';
  const slug      = slugify(title, { lower: true, strict: true });
  const summary   = title;

  await prisma.announcement.create({ data: { title, slug, summary, content, featured, published } });
  revalidatePath('/admin/dashboard/announcements');
  revalidatePath('/announcements');
  redirect('/admin/dashboard/announcements');
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const title     = formData.get('title') as string;
  const content   = formData.get('content') as string;
  const featured  = formData.get('featured') === 'on';
  const published = formData.get('published') === 'on';
  const slug      = slugify(title, { lower: true, strict: true });
  const summary   = title;

  await prisma.announcement.update({ where: { id }, data: { title, slug, summary, content, featured, published } });
  revalidatePath('/admin/dashboard/announcements');
  revalidatePath('/announcements');
  redirect('/admin/dashboard/announcements');
}

export async function deleteAnnouncement(id: string) {
  await prisma.announcement.delete({ where: { id } });
  revalidatePath('/admin/dashboard/announcements');
  revalidatePath('/announcements');
}
