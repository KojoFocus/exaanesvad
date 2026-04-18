import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata = { title: 'About' };

const PILLARS = [
  {
    n: '01',
    title: 'Assessment & enrolment',
    body: 'Community surveys, psychosocial assessments, and beneficiary enrolment across Nima, Ashaiman, Ningo-Prampram, and Ho — identifying high-need individuals for targeted support.',
  },
  {
    n: '02',
    title: 'Skills & enterprise training',
    body: 'Structured vocational programmes in crafts, food processing, textiles, and soap-making — paired with financial literacy, business planning, and micro-enterprise setup.',
  },
  {
    n: '03',
    title: 'Market access & livelihoods',
    body: 'This platform connects trained producers directly to buyers, turning community work into measurable economic impact and sustained dignified income.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className={styles.heroWrap} id="mission">
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Our mission</p>
            <h1 className={styles.h1}>
              Empowering people through skills, <em>dignity</em>, and community.
            </h1>
            <p className={styles.sub}>
              EXA Ventures &amp; Anesvad lifts marginalised individuals — people living with NTDs,
              persons with disabilities, caregivers, and vulnerable women — through assessment,
              skills training, and enterprise development across Nima, Ashaiman, Ningo-Prampram, and Ho.
            </p>
          </div>
          <div className={styles.aside}>
            <div className={styles.asideTitle}>Delivered by</div>
            <div className={styles.partnerBlock}>
              <div className={styles.pLogoGreen}>Divine EXA Ventures</div>
              <div className={styles.pDesc}>Ghanaian enterprise development and community empowerment</div>
            </div>
            <div className={styles.partnerBlock}>
              <div className={styles.pLogoGold}>anesvad Foundation</div>
              <div className={styles.pDesc}>Spanish NGO · 50+ years of global health and rights work</div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem band */}
      <div className={styles.problemBand}>
        <div className={styles.problemImg}>
          <Image
            src="/hero/A1.2_Photo_Nima_2026-02-28_02.jpeg"
            alt="EXA-ANESVAD field activity — NTD care"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
          />
          <div className={styles.problemImgOverlay} />
        </div>
        <div className={styles.problemInner}>
          <div>
            <p className={styles.problemLabel}>The challenge</p>
            <h2 className={styles.problemHeadline}>
              Marginalised communities have <em>talent without pathways</em> to economic dignity.
            </h2>
          </div>
          <div className={styles.problemStats}>
            <div className={styles.problemStat}>
              <div className={styles.problemStatNum}>110</div>
              <div className={styles.problemStatLbl}>Beneficiaries enrolled across 4 communities in Ghana</div>
            </div>
            <div className={styles.problemStat}>
              <div className={styles.problemStatNum}>50+</div>
              <div className={styles.problemStatLbl}>Communities surveyed and mapped during assessment phase</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <section className={styles.pillarsSection}>
        <p className={styles.secLabel}>Programme pillars</p>
        <h2 className={styles.secTitle}>Three pillars. One mission.</h2>
        <div className={styles.pillars}>
          {PILLARS.map(p => (
            <div key={p.title} className={styles.pillar}>
              <div className={styles.pillarNum}>{p.n}</div>
              <div className={styles.pillarTitle}>{p.title}</div>
              <p className={styles.pillarBody}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <div className={styles.quoteSection}>
        <p className={styles.quoteText}>
          &ldquo;Every product you purchase supports a livelihood — and the dignity of someone who built it with their own hands.&rdquo;
        </p>
        <p className={styles.quoteCite}>EXA Ventures &amp; Anesvad Programme</p>
      </div>

      {/* Partnership */}
      <section className={styles.partnerSection} id="impact">
        <div className={styles.partnerLeft}>
          <p className={styles.secLabel}>Our partners</p>
          <h2 className={styles.secTitle}>Ghanaian initiative. Global backing.</h2>
          <p style={{ fontSize: '14px', color: '#777', lineHeight: '1.85', marginBottom: '24px' }}>
            EXA Ventures &amp; Anesvad is built on the complementary strengths of two organisations — local
            enterprise expertise from Divine EXA Ventures and 50 years of international development
            credibility from Anesvad Foundation.
          </p>
          <Link href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--sans)', fontSize: '11.5px', fontWeight: 600,
            color: 'var(--green)', textDecoration: 'none',
            borderBottom: '1px solid rgba(28,74,28,0.3)', paddingBottom: '2px',
          }}>
            Get in touch →
          </Link>
        </div>
        <div className={styles.partnerRight}>
          <div className={styles.partnerCard}>
            <div className={styles.partnerCardName}>Divine EXA Ventures</div>
            <div className={styles.partnerCardRole}>Lead implementer · Ghana</div>
            <p className={styles.partnerCardDesc}>
              A Ghanaian enterprise development company specialised in community empowerment, vocational training,
              and artisan commerce across West Africa.
            </p>
          </div>
          <div className={styles.partnerCard}>
            <div className={`${styles.partnerCardName} ${styles.gold}`}>anesvad Foundation</div>
            <div className={styles.partnerCardRole}>Strategic partner · Spain</div>
            <p className={styles.partnerCardDesc}>
              A Spanish NGO with over 50 years of work in global health, community rights, and sustainable
              development across more than 40 countries.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
