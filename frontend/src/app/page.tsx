import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PetCard from '@/components/PetCard';
import CenterCardHome from '@/components/CenterCardHome';
import ScrollAnimation from '@/components/ScrollAnimation';
import Icon from '@/components/Icon';
import HowToHelpButton from '@/components/HowToHelpButton';
import { serverApi } from '@/lib/server';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age_months?: number;
  gender?: string;
  status: string;
  images?: { id: number; image: string; is_primary: boolean }[];
  center_name?: string;
  center_state?: string;
}

interface Center {
  id: number;
  name: string;
  address?: string;
  logo?: string;
  pets_count?: number;
}

export default async function HomePage() {
  let pets: Pet[] = [];
  let centers: Center[] = [];

  try {
    const petsRes = await serverApi<any>('/pets/?page_size=4');
    const centersRes = await serverApi<any>('/centers/');
    
    // Handle paginated response
    pets = petsRes.results ? petsRes.results : Array.isArray(petsRes) ? petsRes : [];
    centers = centersRes.results ? centersRes.results : Array.isArray(centersRes) ? centersRes : [];
  } catch (error) {
    console.error('Error fetching data:', error);
    // Silent fail - page renders with empty state
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-container-max mx-auto px-4 md:px-8 py-stack-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollAnimation variant="slideLeft">
              <div className="flex flex-col gap-stack-md">
                <h1 className="font-montserrat text-headline-xl md:text-[56px] md:leading-[64px] font-bold text-on-surface">
                  Adopta a tu próximo
                  <span className="text-primary"> compañero</span> de vida
                </h1>
                <p className="font-body-lg text-on-surface-variant max-w-lg">
                  Miles de mascotas en Barinas esperan un hogar. Explora nuestros centros de adopción y dales el amor que merecen.
                </p>
                <div className="flex flex-wrap gap-4 mt-2">
                  <Link
                    href="/mascotas"
                    className="bg-primary-container text-on-primary-container font-label-md px-6 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
                  >
                    <Icon name="pets" className="w-5 h-5" solid />
                    Ver Mascotas
                  </Link>
                  <HowToHelpButton />
                </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation variant="slideRight">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary-container/20 rounded-3xl blur-3xl"></div>
                <div className="relative rounded-2xl shadow-card w-full h-[400px] bg-surface-container-high flex items-center justify-center overflow-hidden">
                  <Image src="/perrito.webp" alt="Perrito disponible para adopción" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        <section id="quienes-somos" className="bg-surface-gray py-stack-lg">
          <div className="max-w-container-max mx-auto px-4 md:px-8">
            <ScrollAnimation variant="slideUp">
              <h2 className="font-montserrat text-headline-lg text-on-surface text-center mb-stack-md">
                Quiénes Somos
              </h2>
              <p className="font-body-lg text-on-surface-variant max-w-3xl mx-auto text-center mb-stack-lg">
                Huellitas de Venezuela es un proyecto sin fines de lucro que centraliza información de animales que buscan adopción en Venezuela. Nuestra misión es formar alianzas con centros de adopción para ofrecer toda la información y procesos adecuados para la adopción de nuevos integrantes a la familia.
              </p>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'volunteer_activism', title: 'Sin fines de lucro', desc: 'Trabajamos por el bienestar animal sin ningún interés económico, impulsados por la pasión de ayudar.' },
                { icon: 'handshake', title: 'Alianzas con centros', desc: 'Colaboramos con centros de adopción en toda Venezuela para centralizar y dar visibilidad a sus animales.' },
                { icon: 'home_heart', title: 'Información centralizada', desc: 'Unificamos datos de mascotas en adopción, requisitos y procesos para facilitar la adopción responsable.' },
              ].map((item, index) => (
                <ScrollAnimation key={item.title} variant="slideUp" delay={index * 0.1}>
                  <div className="bg-surface p-8 rounded-2xl shadow-sm border border-surface-container-high text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon name={item.icon} className="w-6 h-6" solid />
                    </div>
                    <h3 className="font-headline-sm text-on-surface mb-3">{item.title}</h3>
                    <p className="font-body-md text-on-surface-variant">{item.desc}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-stack-lg">
          <div className="max-w-container-max mx-auto px-4 md:px-8">
            <ScrollAnimation variant="slideUp">
              <h2 className="font-montserrat text-headline-lg text-on-surface text-center mb-stack-lg">
                Cómo Funciona
              </h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Explora', icon: 'search', desc: 'Busca entre cientos de mascotas disponibles en centros aliados de toda Venezuela.' },
                { step: '2', title: 'Conecta', icon: 'favorite', desc: 'Elige a tu favorito y envía tu solicitud de adopción al centro encargado.' },
                { step: '3', title: 'Adopta', icon: 'celebration', desc: 'El centro evalúa tu solicitud y pronto tendrás un nuevo miembro en la familia.' },
              ].map((item, index) => (
                <ScrollAnimation key={item.step} variant="slideUp" delay={index * 0.1}>
                  <div className="bg-surface p-8 rounded-2xl shadow-sm border border-surface-container-high hover:shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 rounded-bl-full group-hover:bg-primary-container/30 transition-colors"></div>
                    <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-6 relative z-10">
                      <Icon name={item.icon} className="w-6 h-6" solid />
                    </div>
                    <h3 className="font-headline-sm text-on-surface mb-3 relative z-10">{item.step}. {item.title}</h3>
                    <p className="font-body-md text-on-surface-variant relative z-10">{item.desc}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        <section className="py-stack-lg">
          <div className="max-w-container-max mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-stack-md">
              <ScrollAnimation variant="slideLeft">
                <h2 className="font-montserrat text-headline-lg text-on-surface">Últimos Rescatados</h2>
              </ScrollAnimation>
              <Link href="/mascotas" className="font-label-md text-primary hover:underline flex items-center gap-1">
                Ver todos <Icon name="arrow_forward" className="w-[18px] h-[18px]" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pets.length > 0 ? (
                pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} variant="full" />
                ))
              ) : (
                <p className="col-span-full text-center text-on-surface-variant font-body-md py-8">
                  Cargando mascotas...
                </p>
              )}
            </div>
          </div>
        </section>

        <section id="centros" className="bg-surface-gray py-stack-lg">
          <div className="max-w-container-max mx-auto px-4 md:px-8">
            <ScrollAnimation variant="slideUp">
              <h2 className="font-montserrat text-headline-lg text-on-surface text-center mb-stack-lg">
                Centros Aliados
              </h2>
            </ScrollAnimation>
            <div className="flex overflow-x-auto gap-6 md:grid md:grid-cols-2 snap-x snap-mandatory scrollbar-thin pb-2 md:pb-0">
              {centers.length > 0 ? (
                centers.map((center) => (
                  <CenterCardHome key={center.id} center={center} />
                ))
              ) : (
                <p className="col-span-full text-center text-on-surface-variant font-body-md py-8">
                  Cargando centros...
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
