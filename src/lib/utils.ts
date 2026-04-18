import slugify from 'slugify';

/** Format GHS price */
export function formatPrice(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format date for display */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GH', options ?? {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });
}

/** Relative time ("3 days ago") */
export function timeAgo(date: string | Date): string {
  const d    = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return formatDate(d, { month: 'short', day: 'numeric' });
}

/** Create a slug from a string */
export function toSlug(str: string): string {
  return slugify(str, { lower: true, strict: true });
}

/** Truncate text */
export function truncate(text: string, length: number = 120): string {
  return text.length <= length ? text : text.slice(0, length).trimEnd() + '…';
}

/** Order status label and colour mapping */
export const ORDER_STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'badge-warning'  },
  confirmed:  { label: 'Confirmed',  className: 'badge-info'     },
  processing: { label: 'Processing', className: 'badge-info'     },
  delivered:  { label: 'Delivered',  className: 'badge-success'  },
  cancelled:  { label: 'Cancelled',  className: 'badge-danger'   },
};

/** Generate order ID display string */
export function orderDisplayId(id: string): string {
  return `#EA-${id.slice(-4).toUpperCase()}`;
}

/** Safe JSON parse with fallback */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try { return JSON.parse(str) as T; }
  catch { return fallback; }
}
