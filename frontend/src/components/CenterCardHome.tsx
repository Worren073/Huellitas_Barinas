'use client';

import { useState } from 'react';
import Image from 'next/image';
import CenterInfoModal from '@/components/CenterInfoModal';
import Icon from '@/components/Icon';
import ScrollAnimation from '@/components/ScrollAnimation';
import { normalizeImageUrl } from '@/lib/utils';
import api from '@/lib/api';

interface HomeCenter {
  id: number;
  name: string;
  address?: string;
  logo?: string;
  pets_count?: number;
}

interface CenterCardHomeProps {
  center: HomeCenter;
}

export default function CenterCardHome({ center }: CenterCardHomeProps) {
  const [selectedCenter, setSelectedCenter] = useState<any>(null);

  const handleClick = async () => {
    try {
      const res = await api.get(`/centers/${center.id}/`);
      setSelectedCenter(res.data);
    } catch {
      setSelectedCenter(null);
    }
  };

  return (
    <>
      <ScrollAnimation variant="slideUp">
        <div
          className="bg-surface rounded-2xl p-6 flex items-center gap-6 shadow-sm border border-surface-container-high hover:border-primary-container transition-colors cursor-pointer snap-start shrink-0 w-[80vw] md:w-auto"
          onClick={handleClick}
        >
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex-shrink-0 overflow-hidden relative">
            {center.logo ? (
              <Image src={normalizeImageUrl(center.logo)} alt={center.name} fill className="object-cover" />
            ) : (
              <Icon name="location" className="w-8 h-8 text-primary m-6" />
            )}
          </div>
          <div>
            <h3 className="font-headline-sm text-on-surface mb-1">{center.name}</h3>
            <p className="font-body-sm text-on-surface-variant mb-2">{center.address || 'Barinas, Venezuela'}</p>
            <div className="flex items-center gap-2 text-primary font-label-sm">
              <Icon name="pets" className="w-4 h-4" />
              {center.pets_count || 0} Mascotas disponibles
            </div>
          </div>
        </div>
      </ScrollAnimation>

      {selectedCenter && (
        <CenterInfoModal center={selectedCenter} onClose={() => setSelectedCenter(null)} />
      )}
    </>
  );
}
