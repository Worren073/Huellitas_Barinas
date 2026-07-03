import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';

export const metadata: Metadata = {
  title: 'Términos y Condiciones - Huellitas Barinas',
  description: 'Términos y condiciones de uso de la plataforma Huellitas Barinas.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-container-max mx-auto px-4 md:px-8 py-stack-lg">
        <ScrollAnimation variant="slideUp">
          <h1 className="font-montserrat text-headline-xl text-on-surface mb-stack-md">Términos y Condiciones</h1>
        </ScrollAnimation>
        <ScrollAnimation variant="slideUp">
        <div className="prose max-w-none font-body-md text-on-surface-variant space-y-4">
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar la plataforma Huellitas Barinas, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo, no debes usar este sitio.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">2. Propósito de la Plataforma</h2>
            <p>Huellitas Barinas es una plataforma que conecta centros de adopción con personas interesadas en adoptar mascotas en Barinas, Venezuela. Facilitamos el proceso de adopción pero no somos responsables directos de las adopciones realizadas.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">3. Responsabilidades del Usuario</h2>
            <p>Los usuarios se comprometen a proporcionar información veraz y actualizada. Los centros de adopción son responsables de verificar la idoneidad de los adoptantes y del bienestar de los animales.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">4. Privacidad de Datos</h2>
            <p>Protegemos tus datos personales según nuestra política de privacidad. No compartimos tu información con terceros sin tu consentimiento explícito.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">5. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán comunicados a través de la plataforma.</p>
          </section>
        </div>
        </ScrollAnimation>
      </main>
      <Footer />
    </div>
  );
}
