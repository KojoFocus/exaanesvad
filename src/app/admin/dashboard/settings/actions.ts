'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function updateSettings(formData: FormData) {
  const data = {
    siteName:   formData.get('siteName')   as string,
    tagline:    formData.get('tagline')    as string,
    email:      formData.get('email')      as string,
    phone:      formData.get('phone')      as string,
    address:    formData.get('address')    as string,
    footerText: formData.get('footerText') as string,
    socialLinks: JSON.stringify({
      facebook:  formData.get('facebook')  ?? '',
      instagram: formData.get('instagram') ?? '',
      twitter:   formData.get('twitter')   ?? '',
      youtube:   formData.get('youtube')   ?? '',
    }),
  };

  await prisma.siteSettings.upsert({
    where:  { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard/settings');
}
