import ConfirmationClient from './ConfirmationClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order Confirmed' };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string; ref?: string; test?: string }> }) {
  const resolvedSearchParams = await searchParams;
  return <ConfirmationClient searchParams={resolvedSearchParams} />;
}
