import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Redes Sociales - Huellitas Barinas',
  description: 'Sigue a Huellitas Barinas en todas nuestras redes sociales.',
};

const socialLinks = [
  { name: 'Instagram', icon: 'instagram' as const, handle: '@huellitasbarinas', url: 'https://instagram.com/huellitasbarinas' },
  { name: 'Facebook', icon: 'facebook' as const, handle: 'Huellitas Barinas', url: 'https://facebook.com/huellitasbarinas' },
  { name: 'Twitter / X', icon: 'twitter' as const, handle: '@huellitasbarinas', url: 'https://twitter.com/huellitasbarinas' },
  { name: 'WhatsApp', icon: 'whatsapp' as const, handle: '+58 412-1234567', url: 'https://wa.me/584121234567' },
];

export default function RedesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-container-max mx-auto px-4 md:px-8 py-stack-lg">
        <ScrollAnimation variant="slideUp">
          <h1 className="font-montserrat text-headline-xl text-on-surface mb-stack-md">Redes Sociales</h1>
        </ScrollAnimation>
        <ScrollAnimation variant="slideUp">
          <p className="font-body-lg text-on-surface-variant mb-stack-lg">
            Síguenos en nuestras redes sociales para estar al día con las últimas mascotas rescatadas,
            eventos y noticias sobre adopción en Barinas.
          </p>
        </ScrollAnimation>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {socialLinks.map((social, index) => (
            <ScrollAnimation key={social.name} variant="slideUp" delay={index * 0.1}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon name={social.icon} className="w-6 h-6 text-primary" solid />
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface">{social.name}</h3>
                  <p className="font-body-md text-on-surface-variant">{social.handle}</p>
                </div>
              </a>
            </ScrollAnimation>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
