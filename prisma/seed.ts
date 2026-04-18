/**
 * prisma/seed.ts
 * Run with: npx ts-node prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@exa-anesvad.org';
  const adminPass  = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const hash       = await bcrypt.hash(adminPass, 12);

  await prisma.adminUser.upsert({
    where:  { email: adminEmail },
    update: {},
    create: { name: 'Admin', email: adminEmail, password: hash, role: 'admin' },
  });
  console.log('✅ Admin user:', adminEmail);

  // ── Categories ──────────────────────────────────────────────────────────────
  const catDefs = [
    { name: 'Body Care',           slug: 'body-care'           },
    { name: 'Health & Protection', slug: 'health-protection'   },
    { name: 'Home Care',           slug: 'home-care'           },
    { name: 'Food & Wellness',     slug: 'food-wellness'       },
    { name: 'Textiles & Weaving',  slug: 'textiles-weaving'    },
    { name: 'Jewellery',           slug: 'jewellery'           },
  ];

  const categories: Record<string, string> = {};
  for (const c of catDefs) {
    const cat = await prisma.category.upsert({
      where:  { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    });
    categories[c.slug] = cat.id;
  }
  console.log('✅ Categories seeded');

  // ── Products ────────────────────────────────────────────────────────────────
  const products = [
    {
      name:             'Divine Eco-Black Soap',
      slug:             'divine-eco-black-soap',
      shortDescription: '100% nature-inspired. Argan oil & glycerin formula.',
      description:      'Feel refreshed with our Divine Eco-Black Soap — a plant-powered formula enriched with argan oil and glycerin. Made by trained beneficiaries of the EXA-ANESVAD programme, this soap is gentle, moisturising, and free from harsh chemicals. Every jar supports a livelihood.',
      price:            45,
      stock:            30,
      categoryId:       categories['body-care'],
      featured:         true,
      published:        true,
      images:           ['/hero/eco-blacksoap.png'],
    },
    {
      name:             'Divine Mosquito Repellent Lotion',
      slug:             'divine-mosquito-repellent-lotion',
      shortDescription: 'Long-lasting protection. Plant-powered. 30ml.',
      description:      'Our Divine Mosquito Repellent Lotion offers long-lasting protection against mosquitoes and other insects. Plant-powered and skin-safe, it is ideal for everyday use by the whole family. Produced by EXA-ANESVAD programme trainees as part of our health product vocational track.',
      price:            35,
      stock:            50,
      categoryId:       categories['health-protection'],
      featured:         true,
      published:        true,
      images:           ['/hero/repellent-lotion.png'],
    },
    {
      name:             'Divine Mosquito & Insects Repellent Balm',
      slug:             'divine-mosquito-repellent-balm',
      shortDescription: 'Plant powered. Family safe. 1oz / 30g stick.',
      description:      'The Divine Repellent Balm is a convenient stick-format insect repellent made from plant-derived ingredients. Safe for the whole family, easy to carry, and effective against mosquitoes and insects. Crafted by vocational trainees in the EXA-ANESVAD NTD empowerment programme.',
      price:            30,
      stock:            60,
      categoryId:       categories['health-protection'],
      featured:         true,
      published:        true,
      images:           ['/hero/repellent-balm.png'],
    },
    {
      name:             'Divine Wash Washing Powder',
      slug:             'divine-wash-washing-powder',
      shortDescription: 'Tough on dirt. Safe on hands. 500g.',
      description:      'Divine Wash is a powerful yet hand-safe washing powder that tackles tough stains without harsh chemicals. 100% detergent-grade quality at 500g. Produced through the EXA-ANESVAD home care vocational track, supporting families across Ghana with both clean clothes and clean livelihoods.',
      price:            25,
      stock:            80,
      categoryId:       categories['home-care'],
      featured:         false,
      published:        true,
      images:           ['/hero/washing-powder.png'],
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where:  { slug: p.slug },
      update: {
        name:             p.name,
        shortDescription: p.shortDescription,
        description:      p.description,
        price:            p.price,
        stock:            p.stock,
        categoryId:       p.categoryId,
        featured:         p.featured,
        published:        p.published,
        images:           p.images,
      },
      create: p,
    });
  }
  console.log('✅ Products seeded');

  // ── Activities ──────────────────────────────────────────────────────────────
  const activities = [
    {
      title:        'NTD Community Screening — Nima',
      slug:         'ntd-community-screening-nima',
      summary:      'Health workers conducted NTD screening and care sessions for 48 beneficiaries across Nima, Accra.',
      content:      'Health workers conducted NTD screening and care sessions for 48 beneficiaries across Nima, Accra. Participants received wound care, counselling, and were enrolled into the socio-economic empowerment programme to begin vocational skills training.',
      activityDate: new Date('2026-02-28'),
      location:     'Nima, Greater Accra',
      category:     'Outreach',
      published:    true,
      featuredImage: '/hero/A1.2_Photo_Nima_2026-02-28_01.jpeg',
    },
    {
      title:        'NTD Community Outreach — Ningo Prampram',
      slug:         'ntd-community-outreach-ningo-prampram',
      summary:      'Group session with caregivers and PWDs in Ningo Prampram — skills assessment and programme enrolment.',
      content:      'A group outreach session was held in Ningo Prampram with caregivers of NTD patients, persons with disabilities, and vulnerable women. Participants were assessed for vocational skills entry, received information on the EXA-ANESVAD programme benefits, and were enrolled into appropriate training tracks.',
      activityDate: new Date('2026-02-23'),
      location:     'Ningo Prampram, Greater Accra',
      category:     'Outreach',
      published:    true,
      featuredImage: '/hero/A1.2_Photo_NingoPrampram_2026-02-23_02.jpeg',
    },
    {
      title:        'Soap-Making Training: Batch 7',
      slug:         'soap-making-training-batch-7',
      summary:      '32 women from Ashiaman completed the 4-week soap production and packaging programme.',
      content:      'This cohort of 32 women from Ashiaman successfully completed our flagship soap-making and packaging programme. Graduates now produce the Divine Eco-Black Soap line sold on this platform.',
      activityDate: new Date('2025-03-14'),
      location:     'Ashiaman, Greater Accra',
      category:     'Training',
      published:    true,
    },
  ];

  for (const a of activities) {
    await prisma.activity.upsert({
      where:  { slug: a.slug },
      update: {},
      create: a,
    });
  }
  console.log('✅ Activities seeded');

  // ── Announcements ───────────────────────────────────────────────────────────
  await prisma.announcement.upsert({
    where:  { slug: 'batch-8-applications-open' },
    update: {},
    create: {
      title:     'Batch 8 Applications Now Open',
      slug:      'batch-8-applications-open',
      summary:   'Applications are open for our next soap-making and repellent production cohort. People living with NTDs, caregivers, PWDs, and vulnerable women are encouraged to apply.',
      content:   'We are pleased to announce that applications for Batch 8 of the EXA-ANESVAD livelihood training programme are now open. This cohort will focus on soap-making and repellent production. Priority is given to people living with NTDs, their caregivers, persons with disabilities, and vulnerable women. Contact us to apply.',
      featured:  true,
      published: true,
    },
  });
  console.log('✅ Announcements seeded');

  // ── Site Settings ───────────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where:  { id: 'singleton' },
    update: {},
    create: {
      siteName:    'EXA-ANESVAD',
      tagline:     'Skills. Dignity. Community Transformation.',
      email:       'info@exa-anesvad.org',
      phone:       '+233 XX XXX XXXX',
      address:     'Accra, Ghana',
      socialLinks: {},
      footerText:  'In partnership with Anesvad Foundation.',
    },
  });
  console.log('✅ Site settings seeded');

  console.log('\n🎉 Seeding complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
