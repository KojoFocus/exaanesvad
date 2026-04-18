import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KEEP = [
  { name: 'Body Care',           slug: 'body-care'         },
  { name: 'Health & Protection', slug: 'health-protection' },
  { name: 'Home Care',           slug: 'home-care'         },
];

// Map old category names → new slug
const REMAP: Record<string, string> = {
  'body care':           'body-care',
  'health & protection': 'health-protection',
  'home care':           'home-care',
  'food & wellness':     'body-care',
  'home décor':          'home-care',
  'jewellery':           'body-care',
  'leather & bags':      'body-care',
  'pottery & ceramics':  'body-care',
  'textiles & weaving':  'body-care',
};

async function main() {
  // Upsert the three correct categories
  for (const cat of KEEP) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    console.log(`✓ Upserted: ${cat.name}`);
  }

  // Reassign all products to correct categories
  const allCats = await prisma.category.findMany();
  const catMap = Object.fromEntries(allCats.map(c => [c.slug, c.id]));

  const products = await prisma.product.findMany({ include: { category: true } });
  for (const p of products) {
    const newSlug = REMAP[p.category.name.toLowerCase()] ?? 'body-care';
    const newId = catMap[newSlug];
    if (newId && newId !== p.categoryId) {
      await prisma.product.update({ where: { id: p.id }, data: { categoryId: newId } });
      console.log(`  → Moved "${p.name}" to ${newSlug}`);
    }
  }

  // Now delete everything not in KEEP
  await prisma.category.deleteMany({
    where: { slug: { notIn: KEEP.map(c => c.slug) } },
  });
  console.log('✓ Removed unused categories');
}

main().catch(console.error).finally(() => prisma.$disconnect());
