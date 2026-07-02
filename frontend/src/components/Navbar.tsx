import Link from 'next/link';
import Icon from './Icon';
import ActiveLink from './ActiveLink';

interface NavbarProps {
  variant?: 'public' | 'catalog' | 'detail';
}

export default function Navbar({ variant = 'public' }: NavbarProps) {
  const navLinks = [
    { href: '/mascotas', label: 'Mascotas' },
    { href: '/#centros', label: 'Centros' },
    { href: '/#sobre-nosotros', label: 'Sobre Nosotros' },
  ];

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center px-4 md:px-8 max-w-container-max mx-auto h-20">
        <Link href="/" className="flex items-center gap-3">
          <Icon name="pets" className="w-7 h-7 text-primary" solid />
          <span className="font-montserrat text-headline-md font-bold text-primary hidden sm:block">
            Huellitas Barinas
          </span>
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <ActiveLink key={link.href} href={link.href}>
              {link.label}
            </ActiveLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="font-label-md text-primary px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors"
          >
            Iniciar Sesion
          </Link>
          <Link
            href="/register"
            className="bg-primary-container text-on-primary-container font-label-md px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            Registro
          </Link>
        </div>
      </div>
    </header>
  );
}
