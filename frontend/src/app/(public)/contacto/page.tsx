import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Contacto - Huellitas Barinas',
  description: 'Ponte en contacto con Huellitas Barinas para más información sobre adopción de mascotas.',
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-container-max mx-auto px-4 md:px-8 py-stack-lg">
        <ScrollAnimation variant="slideUp">
          <h1 className="font-montserrat text-headline-xl text-on-surface mb-stack-md">Contacto</h1>
        </ScrollAnimation>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ScrollAnimation variant="slideLeft">
            <div className="flex flex-col gap-6">
            <p className="font-body-lg text-on-surface-variant">
              Estamos aquí para ayudarte. Si tienes preguntas sobre el proceso de adopción,
              deseas ser voluntario, o necesitas más información, no dudes en contactarnos.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: 'email', label: 'Correo Electrónico', value: 'info@huellitasbarinas.org' },
                { icon: 'phone', label: 'Teléfono', value: '+58 412-1234567' },
                { icon: 'location', label: 'Dirección', value: 'Barinas, Venezuela' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                    <Icon name={item.icon} className="w-5 h-5 text-primary" solid />
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant">{item.label}</p>
                    <p className="font-body-md text-on-surface">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </ScrollAnimation>
          <ScrollAnimation variant="slideRight">
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20">
              <h2 className="font-headline-sm text-on-surface mb-4">Envíanos un mensaje</h2>
              <form className="flex flex-col gap-4">
                <div>
                  <label className="font-label-sm text-on-surface-variant block mb-1">Nombre</label>
                  <input type="text" className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="font-label-sm text-on-surface-variant block mb-1">Correo Electrónico</label>
                  <input type="email" className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="font-label-sm text-on-surface-variant block mb-1">Mensaje</label>
                  <textarea rows={4} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface focus:outline-none focus:border-primary resize-none" />
                </div>
                <button type="submit" className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-lg hover:opacity-90 transition-opacity self-start">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </ScrollAnimation>
        </div>
      </main>
      <Footer />
    </div>
  );
}
