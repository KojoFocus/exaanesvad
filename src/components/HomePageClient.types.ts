import type { Product, Category, Activity, Announcement } from '@prisma/client';

export type ProductWithCategory = Product & { category: Category };

export type HomeData = {
  featuredProducts: ProductWithCategory[];
  recentActivities: Activity[];
  announcement: Announcement | null;
};

export type ImpactData = {
  recentActivities: Activity[];
  announcement: Announcement | null;
};
