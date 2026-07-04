/**
 * Normalize image URLs for frontend use.
 * Converts absolute URLs (from Docker or localhost) to relative paths
 * so Next.js Image optimization works server-side.
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  return url.replace(/^https?:\/\/[^/]+\//, '/');
}

/**
 * Format a number as currency (VES).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
  }).format(amount);
}

/**
 * Format a date string to localized Spanish.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
