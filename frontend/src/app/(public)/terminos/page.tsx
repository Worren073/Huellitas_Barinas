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
            <p>Protegemos tus datos personales según nuestra política de privacidad. No compartimos tu información con terceros sin tu consentimiento explícito. Puedes solicitar la eliminación de tu cuenta en cualquier momento; las adopciones completadas se conservarán en nuestros registros.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">5. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán comunicados a través de la plataforma.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">6. Uso de la Plataforma</h2>
            <p>El usuario se compromete a usar la plataforma únicamente para fines legales y de acuerdo con estos términos. No está permitido publicar información falsa, realizar actividades fraudulentas, o utilizar la plataforma para cualquier propósito ilegal.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">7. Registro de Cuenta y Eliminación</h2>
            <p>Al registrarte, eres responsable de mantener la confidencialidad de tus credenciales. Debes notificar inmediatamente cualquier uso no autorizado de tu cuenta. Puedes solicitar la eliminación de tu cuenta desde la sección "Mis Solicitudes". Al hacerlo, tu cuenta se desactivará inmediatamente y tus datos serán anonimizados después de 30 días. Las adopciones completadas se conservarán en nuestros registros. Durante el período de gracia de 30 días, un administrador puede restaurar tu cuenta.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">8. Proceso de Adopción</h2>
            <p>Huellitas Barinas actúa como intermediario entre centros de adopción y adoptantes. Cada centro de adopción establece sus propios requisitos y procesos de adopción. No garantizamos la aprobación de ninguna solicitud de adopción.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">9. Limitación de Responsabilidad</h2>
            <p>Huellitas Barinas no se hace responsable por daños directos o indirectos derivados del uso de la plataforma, incluyendo pero no limitado a adopciones fallidas, información incorrecta proporcionada por centros o usuarios, o disputas entre centros y adoptantes.</p>
          </section>
          <section>
            <h2 className="font-headline-sm text-on-surface mt-6 mb-2">10. Contacto</h2>
            <p>Para cualquier consulta sobre estos términos, puedes contactarnos a través de nuestro formulario de contacto en la plataforma o mediante correo electrónico a huellitasvnz@gmail.com.</p>
          </section>
        </div>
        </ScrollAnimation>
      </main>
      <Footer />
    </div>
  );
}
