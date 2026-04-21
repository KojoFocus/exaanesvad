import { prisma } from '../src/lib/prisma';

async function checkSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' }
    });
    
    if (settings) {
      console.log('✅ SiteSettings record exists:', settings.id);
      console.log('Notification phones:', settings.notificationPhones);
      console.log('Notification emails:', settings.notificationEmails);
      console.log('SMS enabled:', settings.enableSmsNotification);
      console.log('Email enabled:', settings.enableEmailNotification);
      console.log('WhatsApp enabled:', settings.enableWhatsAppNotification);
    } else {
      console.log('❌ No SiteSettings record found. Creating default...');
      
      const newSettings = await prisma.siteSettings.create({
        data: {
          id: 'singleton',
          siteName: 'EXA-ANESVAD',
          tagline: 'Skills. Dignity. Community Transformation.',
          email: '',
          phone: '',
          address: '',
          socialLinks: '{}',
          footerText: '',
          notificationPhones: JSON.stringify(['+233540484052', '+233246114671']),
          notificationEmails: JSON.stringify(['exaanesvad@gmail.com']),
          enableSmsNotification: true,
          enableEmailNotification: true,
          enableWhatsAppNotification: true
        }
      });
      
      console.log('✅ Created default SiteSettings:', newSettings.id);
    }
  } catch (error) {
    console.error('Error checking settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSettings();