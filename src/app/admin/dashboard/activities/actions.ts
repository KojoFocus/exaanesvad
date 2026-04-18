'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function createActivity(formData: FormData) {
  const title        = formData.get('title') as string;
  const summary      = formData.get('summary') as string;
  const content      = formData.get('content') as string;
  const location     = formData.get('location') as string;
  const category     = formData.get('category') as string;
  const activityDate = new Date(formData.get('activityDate') as string);
  const published    = formData.get('published') === 'on';
  const slug         = slugify(title, { lower: true, strict: true });

  await prisma.activity.create({
    data: { title, slug, summary, content, location, category, activityDate, published },
  });

  revalidatePath('/admin/dashboard/activities');
  revalidatePath('/activities');
  redirect('/admin/dashboard/activities');
}

export async function updateActivity(id: string, formData: FormData) {
  const title        = formData.get('title') as string;
  const summary      = formData.get('summary') as string;
  const content      = formData.get('content') as string;
  const location     = formData.get('location') as string;
  const category     = formData.get('category') as string;
  const activityDate = new Date(formData.get('activityDate') as string);
  const published    = formData.get('published') === 'on';
  const slug         = slugify(title, { lower: true, strict: true });

  await prisma.activity.update({
    where: { id },
    data: { title, slug, summary, content, location, category, activityDate, published },
  });

  revalidatePath('/admin/dashboard/activities');
  revalidatePath('/activities');
  redirect('/admin/dashboard/activities');
}

export async function deleteActivity(id: string) {
  await prisma.activity.delete({ where: { id } });
  revalidatePath('/admin/dashboard/activities');
  revalidatePath('/activities');
}

export async function toggleActivityPublish(id: string, published: boolean) {
  await prisma.activity.update({ where: { id }, data: { published } });
  revalidatePath('/admin/dashboard/activities');
}
