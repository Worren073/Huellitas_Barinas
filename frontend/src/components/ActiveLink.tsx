'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ActiveLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function ActiveLink({ href, children }: ActiveLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`font-label-md transition-colors ${
        isActive
          ? 'text-primary border-b-2 border-primary font-bold'
          : 'text-on-surface-variant hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
}
