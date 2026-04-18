'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const VideoSchema = z.object({
  title:       z.string().min(2),
  description: z.string().optional(),
  thumbnail:   z.string().url().optional().or(z.literal('')),
  videoUrl:    z.string().url(),
  embedUrl:    z.string().optional(),
  category:    z.string().optional(),
  published:   z.coerce.boolean().optional().default(false),
});

export async function createVideo(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const data = VideoSchema.parse({
    ...raw,
    published: formData.get('published') === 'on',
    thumbnail: raw.thumbnail || undefined,
    embedUrl:  raw.embedUrl  || undefined,
  });

  await prisma.video.create({ data: {
    title:       data.title,
    description: data.description ?? null,
    thumbnail:   data.thumbnail ?? '',
    videoUrl:    data.videoUrl,
    embedUrl:    data.embedUrl ?? '',
    category:    data.category ?? 'General',
    published:   data.published,
  }});

  revalidatePath('/admin/dashboard/videos');
  revalidatePath('/videos');
  redirect('/admin/dashboard/videos');
}

export async function updateVideo(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const data = VideoSchema.parse({
    ...raw,
    published: formData.get('published') === 'on',
    thumbnail: raw.thumbnail || undefined,
    embedUrl:  raw.embedUrl  || undefined,
  });

  await prisma.video.update({ where: { id }, data: {
    title:       data.title,
    description: data.description ?? null,
    thumbnail:   data.thumbnail ?? '',
    videoUrl:    data.videoUrl,
    embedUrl:    data.embedUrl ?? '',
    category:    data.category ?? 'General',
    published:   data.published,
  }});

  revalidatePath('/admin/dashboard/videos');
  revalidatePath('/videos');
  redirect('/admin/dashboard/videos');
}

export async function deleteVideo(id: string) {
  await prisma.video.delete({ where: { id } });
  revalidatePath('/admin/dashboard/videos');
  revalidatePath('/videos');
}

export async function toggleVideoPublish(id: string, published: boolean) {
  await prisma.video.update({ where: { id }, data: { published } });
  revalidatePath('/admin/dashboard/videos');
  revalidatePath('/videos');
}
