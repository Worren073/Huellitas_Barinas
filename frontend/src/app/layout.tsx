import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import TokenCleanup from '@/components/TokenCleanup';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Huellitas Barinas',
  description: 'Plataforma de adopcion de mascotas en Barinas, Venezuela',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-inter text-on-surface bg-surface-off-white antialiased">
        <TokenCleanup />
        {children}
      </body>
    </html>
  );
}
