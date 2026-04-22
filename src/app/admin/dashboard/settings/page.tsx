import { prisma } from '@/lib/prisma';
import { updateSettings } from './actions';
import styles from '../products/new/page.module.css';
import pageStyles from './page.module.css';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });

  let social: Record<string, string> = {};
  let notificationPhones: string[] = [];
  let notificationEmails: string[] = [];
  
  try {
    social = settings?.socialLinks ? JSON.parse(settings.socialLinks as string) : {};
  } catch {}
  
  try {
    notificationPhones = settings?.notificationPhones ? JSON.parse(settings.notificationPhones as string) : [];
  } catch {}
  
  try {
    notificationEmails = settings?.notificationEmails ? JSON.parse(settings.notificationEmails as string) : [];
  } catch {}

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Site settings</h1>
          <p className={styles.sub}>Global configuration for EXA-ANESVAD</p>
        </div>
      </div>

      <form action={updateSettings} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Site identity</h2>

          <div className={styles.fg}>
            <label className={styles.label}>Site name</label>
            <input name="siteName" className={styles.input} defaultValue={settings?.siteName ?? 'EXA-ANESVAD'} />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Tagline</label>
            <input name="tagline" className={styles.input} defaultValue={settings?.tagline ?? ''} placeholder="Skills. Dignity. Community Transformation." />
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Footer text</label>
            <input name="footerText" className={styles.input} defaultValue={settings?.footerText ?? ''} placeholder="© 2025 EXA-ANESVAD. All rights reserved." />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Contact information</h2>

          <div className={styles.fg}>
            <label className={styles.label}>Email</label>
            <input name="email" type="email" className={styles.input} defaultValue={settings?.email ?? ''} placeholder="info@exa-anesvad.org" />
          </div>

          <div className={styles.row}>
            <div className={styles.fg}>
              <label className={styles.label}>Phone</label>
              <input name="phone" className={styles.input} defaultValue={settings?.phone ?? ''} placeholder="+233 XX XXX XXXX" />
            </div>
            <div className={styles.fg}>
              <label className={styles.label}>Address</label>
              <input name="address" className={styles.input} defaultValue={settings?.address ?? ''} placeholder="Accra, Ghana" />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Order Notification Settings</h2>
          <p className={pageStyles.sectionNote}>Configure who receives notifications when a new order is placed.</p>

          <div className={styles.fg}>
            <label className={styles.label}>Phone Numbers (comma-separated)</label>
            <input 
              name="notificationPhones" 
              className={styles.input} 
              defaultValue={notificationPhones.join(', ')} 
              placeholder="+233246114671"
            />
            <p className={pageStyles.helpText}>Enter phone numbers that should receive SMS notifications for new orders.</p>
          </div>

          <div className={styles.fg}>
            <label className={styles.label}>Email Addresses (comma-separated)</label>
            <input 
              name="notificationEmails" 
              className={styles.input} 
              defaultValue={notificationEmails.join(', ')} 
              placeholder="exaanesvad@gmail.com, admin@exa-anesvad.org" 
            />
            <p className={pageStyles.helpText}>Enter email addresses that should receive email notifications for new orders.</p>
          </div>

          <div className={styles.fg}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                name="enableSmsNotification" 
                defaultChecked={settings?.enableSmsNotification !== false} 
              />
              <span>Enable SMS Notifications</span>
            </label>
          </div>

          <div className={styles.fg}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                name="enableEmailNotification" 
                defaultChecked={settings?.enableEmailNotification !== false} 
              />
              <span>Enable Email Notifications</span>
            </label>
          </div>

          <div className={styles.fg}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                name="enableWhatsAppNotification" 
                defaultChecked={settings?.enableWhatsAppNotification !== false} 
              />
              <span>Enable WhatsApp Notifications</span>
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.secTitle}>Social links</h2>
          <p className={pageStyles.sectionNote}>Enter full URLs (e.g. https://facebook.com/your-page)</p>

          {[
            { name: 'facebook',  label: 'Facebook'  },
            { name: 'instagram', label: 'Instagram' },
            { name: 'twitter',   label: 'X / Twitter' },
            { name: 'youtube',   label: 'YouTube'   },
          ].map(({ name, label }) => (
            <div key={name} className={styles.fg}>
              <label className={styles.label}>{label}</label>
              <input name={name} type="url" className={styles.input} defaultValue={social[name] ?? ''} placeholder={`https://...`} />
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary">Save settings</button>
        </div>
      </form>
    </div>
  );
}
