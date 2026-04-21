'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function updateSettings(formData: FormData) {
  // Parse notification phones and emails from comma-separated strings
  const notificationPhonesRaw = (formData.get('notificationPhones') as string) || '';
  const notificationEmailsRaw = (formData.get('notificationEmails') as string) || '';
  
  const notificationPhones = notificationPhonesRaw
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  const notificationEmails = notificationEmailsRaw
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0);

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
    notificationPhones: JSON.stringify(notificationPhones),
    notificationEmails: JSON.stringify(notificationEmails),
    enableSmsNotification: formData.get('enableSmsNotification') === 'on',
    enableEmailNotification: formData.get('enableEmailNotification') === 'on',
    enableWhatsAppNotification: formData.get('enableWhatsAppNotification') === 'on',
  };

  await prisma.siteSettings.upsert({
    where:  { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard/settings');
}
