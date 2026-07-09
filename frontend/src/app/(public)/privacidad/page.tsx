import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';

export const metadata: Metadata = {
  title: 'Política de Privacidad - Huellitas de Venezuela',
  description: 'Política de privacidad y protección de datos de Huellitas de Venezuela.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-container-max mx-auto px-4 md:px-8 py-stack-lg">
        <ScrollAnimation variant="slideUp">
          <h1 className="font-montserrat text-headline-xl text-on-surface mb-stack-md">Política de Privacidad</h1>
        </ScrollAnimation>
        <ScrollAnimation variant="slideUp">
        <div className="prose max-w-none font-body-md text-on-surface-variant space-y-4">
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">1. Información que Recopilamos</h2>
            <p>Recopilamos información personal como nombre, correo electrónico, número de teléfono y dirección cuando te registras en la plataforma. También recopilamos información sobre tus preferencias de adopción.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">2. Uso de la Información</h2>
            <p>Utilizamos tu información para facilitar el proceso de adopción, mejorar nuestros servicios, y comunicarnos contigo sobre el estado de tus solicitudes.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">3. Protección de Datos</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, pérdida o alteración.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">4. Tus Derechos</h2>
            <p>Tienes derecho a acceder, rectificar y solicitar la eliminación de tus datos personales. Puedes ejercer estos derechos desde la sección &ldquo;Mis Solicitudes&rdquo; en tu cuenta o contactándonos a través de nuestro correo electrónico.</p>
            <h3 className="font-label-md text-on-surface mt-4 mb-1">Eliminación de Cuenta</h3>
            <p>Al solicitar la eliminación de tu cuenta:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tu cuenta será desactivada inmediatamente y no podrás acceder a la plataforma.</li>
              <li>Las solicitudes de adopción activas (pendientes o en revisión) serán canceladas.</li>
              <li>Las adopciones completadas se conservarán en nuestros registros por razones legales y de trazabilidad animal.</li>
              <li>Tienes un período de gracia de 30 días durante el cual un administrador puede restaurar tu cuenta.</li>
              <li>Pasados los 30 días, tus datos personales (nombre, correo electrónico, usuario) serán anonimizados irreversiblemente.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">5. Contacto</h2>
            <p>Para cualquier consulta sobre nuestra política de privacidad, escríbenos a: huellitasvnz@gmail.com</p>
          </section>
        </div>
        </ScrollAnimation>
      </main>
      <Footer />
    </div>
  );
}
