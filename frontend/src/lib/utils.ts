/**
 * Normalize image URLs for frontend use.
 * Converts internal Docker API URLs (e.g., http://api:8000/media/...)
 * to relative paths (/media/...) so Next.js rewrites handle proxying.
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  // Strip internal Docker hostname so the browser uses the same-origin rewrite
  if (url.startsWith('http://api:8000/') || url.startsWith('https://api:8000/')) {
    return url.replace(/^https?:\/\/api:8000\//, '/');
  }
  return url;
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
