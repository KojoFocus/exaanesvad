import { Metadata } from 'next';
import ContactForm from './ContactForm';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Contact' };

const DETAILS = [
  { label: 'Email',   value: 'info@exa-anesvad.org',  href: 'mailto:info@exa-anesvad.org' },
  { label: 'Phone',   value: '+233 XX XXX XXXX',       href: 'tel:+233XXXXXXXXX'            },
  { label: 'Address', value: 'Accra, Ghana',            href: null                           },
];

export default function ContactPage() {
  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>Get in touch</p>
        <h1 className={styles.h1}>Contact us</h1>
        <p className={styles.sub}>Have a question about our products, programmes, or partnerships? We'd love to hear from you.</p>
      </div>

      <div className={styles.layout}>
        {/* Form */}
        <div className={styles.formCol}>
          <ContactForm />
        </div>

        {/* Details */}
        <aside className={styles.aside}>
          <div className={styles.detailsCard}>
            <p className={styles.detailsLabel}>Contact details</p>
            {DETAILS.map(({ label, value, href }) => (
              <div key={label} className={styles.detailItem}>
                <span className={styles.detailKey}>{label}</span>
                {href ? (
                  <a href={href} className={styles.detailVal}>{value}</a>
                ) : (
                  <span className={styles.detailVal}>{value}</span>
                )}
              </div>
            ))}
          </div>

          <div className={styles.impactCard}>
            <p className={styles.impactText}>
              EXA-ANESVAD is a socio-economic empowerment programme training communities in Ghana through vocational skills, enterprise development, and direct market access.
            </p>
            <p className={styles.impactSub}>In partnership with Anesvad Foundation.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
