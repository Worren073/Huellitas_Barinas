'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import CenterInfoModal from '@/components/CenterInfoModal';
import Icon from '@/components/Icon';
import type { Center } from '@/lib/types';
import api from '@/lib/api';
import { normalizeImageUrl } from '@/lib/utils';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';

function useLeafletIcon() {
  useEffect(() => {
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });
    });
  }, []);
}

interface CenterWithPets extends Center {
  pets_count?: number;
}

export default function CentrosPage() {
  useLeafletIcon();
  const [centers, setCenters] = useState<CenterWithPets[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<CenterWithPets | null>(null);
  const [erroredLogos, setErroredLogos] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await api.get('/centers/');
        const data = res.data.results || res.data;
        setCenters(Array.isArray(data) ? data : []);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  const mapCenters = centers.filter((c) => c.latitude && c.longitude);
  const barinasCenter: [number, number] = [8.615, -70.207];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-stack-lg">
          <ScrollAnimation variant="slideUp">
            <h1 className="font-montserrat text-headline-xl text-on-surface mb-2">Centros de Adopción</h1>
          </ScrollAnimation>
          <ScrollAnimation variant="slideUp">
            <p className="font-body-lg text-on-surface-variant mb-stack-md">
              Encuentra el centro de adopción más cercano en Barinas.
            </p>
          </ScrollAnimation>
        </div>

        {loading ? (
          <div className="max-w-container-max mx-auto px-4 md:px-8">
            <div className="h-[400px] bg-surface-container-low rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="max-w-container-max mx-auto px-4 md:px-8 pb-stack-lg">
            <div className="h-[500px] rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm relative z-0">
              <MapContainer center={barinasCenter} zoom={12} className="w-full h-full" scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapCenters.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
                    <p className="font-body-md text-on-surface-variant">No hay centros con ubicación disponible</p>
                  </div>
                ) : (
                  mapCenters.map((center) => (
                    <Marker
                      key={center.id}
                      position={[center.latitude!, center.longitude!]}
                      eventHandlers={{}}
                    >
                      <Popup>
                        <div className="text-center min-w-[180px]">
                          <h3 className="font-bold text-sm mb-1">{center.name}</h3>
                          <p className="text-xs text-gray-500 mb-1">{center.address}</p>
                          {center.phone && <p className="text-xs text-gray-500 mb-1">{center.phone}</p>}
                          <p className="text-xs text-primary font-semibold">
                            {center.pets_count || 0} mascotas disponibles
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))
                )}
              </MapContainer>
            </div>
          </div>
        )}

        <div className="max-w-container-max mx-auto px-4 md:px-8 pb-stack-lg">
          <ScrollAnimation variant="slideUp">
            <h2 className="font-headline-sm text-on-surface mb-4">Lista de Centros</h2>
          </ScrollAnimation>
          {centers.length === 0 && !loading ? (
            <p className="font-body-md text-on-surface-variant">No hay centros registrados aún.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {centers.map((center, index) => (
                <ScrollAnimation key={center.id} variant="slideUp" delay={index * 0.05}>
                <div
                  className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCenter(center)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                      {center.logo && !erroredLogos.has(center.id) ? (
                        <Image src={normalizeImageUrl(center.logo)} alt={center.name} fill className="object-cover" onError={() => setErroredLogos(prev => new Set(prev).add(center.id))} />
                      ) : (
                        <Icon name="location" className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline-sm text-on-surface truncate">{center.name}</h3>
                      <p className="font-body-xs text-on-surface-variant/60 truncate">{center.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Icon name="pets" className="w-4 h-4" />
                      {center.pets_count || 0}
                    </span>
                    {center.phone && (
                      <span className="flex items-center gap-1">
                        <Icon name="call" className="w-4 h-4" />
                        {center.phone}
                      </span>
                    )}
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedCenter && (
        <CenterInfoModal center={selectedCenter} onClose={() => setSelectedCenter(null)} />
      )}
      <Footer />
    </div>
  );
}
