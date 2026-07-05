'use client';

import { normalizeImageUrl } from '@/lib/utils';
import Icon from '@/components/Icon';
import Image from 'next/image';

interface CenterData {
  id: number;
  name: string;
  description?: string;
  address?: string;
  state?: string;
  phone?: string;
  email?: string;
  logo?: string | null;
  cover_image?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  website?: string;
  pets_count?: number;
}

interface CenterInfoModalProps {
  center: CenterData;
  onClose: () => void;
}

export default function CenterInfoModal({ center, onClose }: CenterInfoModalProps) {
  const hasCoords = center.latitude != null && center.longitude != null;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`
    : null;

  const coverSrc = center.cover_image ? normalizeImageUrl(center.cover_image) : null;
  const logoSrc = center.logo ? normalizeImageUrl(center.logo) : null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          {coverSrc ? (
            <div className="h-40 w-full relative">
              <Image src={coverSrc} alt="" fill className="object-cover rounded-t-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl" />
            </div>
          ) : (
            <div className="h-32 w-full bg-primary-container rounded-t-2xl flex items-center justify-center">
              <Icon name="location" className="w-10 h-10 text-primary" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>

          <div className="absolute -bottom-10 left-stack-md">
            <div className="w-20 h-20 rounded-full border-4 border-surface bg-surface-container-high flex items-center justify-center overflow-hidden shadow-md">
              {logoSrc ? (
                <Image src={logoSrc} alt={center.name} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <Icon name="location" className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>
        </div>

        <div className="pt-14 p-stack-md">
          <h2 className="font-headline-sm text-on-surface">{center.name}</h2>

          {center.description && (
            <p className="font-body-md text-on-surface-variant mt-2 leading-relaxed">
              {center.description}
            </p>
          )}

          <div className="space-y-3 mt-5">
            {center.address && (
              <div className="flex items-start gap-3">
                <Icon name="location" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-label-sm text-on-surface-variant">Dirección</p>
                  <p className="font-body-md text-on-surface">{center.address}</p>
                  {center.state && (
                    <p className="font-body-sm text-on-surface-variant">{center.state}</p>
                  )}
                </div>
              </div>
            )}

            {center.phone && (
              <div className="flex items-start gap-3">
                <Icon name="call" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-label-sm text-on-surface-variant">Teléfono</p>
                  <a
                    href={`tel:${center.phone}`}
                    className="font-body-md text-primary hover:underline"
                  >
                    {center.phone}
                  </a>
                </div>
              </div>
            )}

            {center.email && (
              <div className="flex items-start gap-3">
                <Icon name="email" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-label-sm text-on-surface-variant">Correo Electrónico</p>
                  <a
                    href={`mailto:${center.email}`}
                    className="font-body-md text-primary hover:underline break-all"
                  >
                    {center.email}
                  </a>
                </div>
              </div>
            )}

            {center.pets_count !== undefined && (
              <div className="flex items-start gap-3">
                <Icon name="pets" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-label-sm text-on-surface-variant">Mascotas</p>
                  <p className="font-body-md text-on-surface">{center.pets_count} mascotas en adopción</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/30">
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md py-3 rounded-lg hover:brightness-105 transition-all"
              >
                <Icon name="location" className="w-5 h-5" />
                Llegar al centro
              </a>
            ) : (
              <p className="font-body-sm text-on-surface-variant text-center">
                Ubicación no disponible
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
