import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-surface-dim mt-stack-lg">
      <div className="w-full py-stack-lg px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-container-max mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/Huellitas png.png"
              alt="Huellitas Barinas"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-montserrat font-headline-sm text-on-surface">Huellitas Barinas</span>
          </div>
          <p className="font-body-sm text-secondary">
            {new Date().getFullYear()} Huellitas Barinas. Compasion en cada adopcion.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2 md:items-end justify-center">
          <nav className="flex flex-wrap gap-4 md:gap-8">
            <Link href="/contacto" className="font-label-sm text-on-surface-variant hover:text-primary transition-colors">
              Contacto
            </Link>
            <Link href="/terminos" className="font-label-sm text-on-surface-variant hover:text-primary transition-colors">
              Terminos
            </Link>
            <Link href="/privacidad" className="font-label-sm text-on-surface-variant hover:text-primary transition-colors">
              Privacidad
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
