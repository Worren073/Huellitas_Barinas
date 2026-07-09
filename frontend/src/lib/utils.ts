export const VENEZUELAN_STATES = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
  'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
  'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'La Guaira', 'Yaracuy',
  'Zulia',
];

/**
 * Normalize image URLs for frontend use.
 * Strips the API base URL so Next.js Image optimization uses the
 * rewrite proxy (/media/* -> API) instead of fetching externally.
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  if (url.startsWith(apiUrl)) {
    return url.replace(apiUrl, '');
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
