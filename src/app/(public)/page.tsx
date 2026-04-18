import { prisma } from '@/lib/prisma';
import HomePageClient from '@/components/HomePageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [allFeatured, recentActivities, announcement] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, featured: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activity.findMany({
      where: { published: true },
      take: 4,
      orderBy: { activityDate: 'desc' },
    }),
    prisma.announcement.findFirst({
      where: { published: true, featured: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const hasImage = (p: { images: unknown }) =>
    Array.isArray(p.images) && (p.images as string[]).some(img => typeof img === 'string' && img.trim() !== '');

  const featuredProducts = allFeatured.filter(hasImage);

  return (
    <HomePageClient
      featuredProducts={featuredProducts}
      recentActivities={recentActivities}
      announcement={announcement}
    />
  );
}
