'use client';

import { useSiteMode } from '@/contexts/SiteModeContext';
import ShopHome from './ShopHome';
import ImpactHome from './ImpactHome';
import type { HomeData } from './HomePageClient.types';

export default function HomePageClient(props: HomeData) {
  const { mode } = useSiteMode();
  return mode === 'shop'
    ? <ShopHome {...props} />
    : <ImpactHome recentActivities={props.recentActivities} announcement={props.announcement} />;
}
