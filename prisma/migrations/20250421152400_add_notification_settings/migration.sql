-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "enableEmailNotification" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "enableSmsNotification" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "enableWhatsAppNotification" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "notificationEmails" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "SiteSettings" ADD COLUMN "notificationPhones" JSONB NOT NULL DEFAULT '[]';