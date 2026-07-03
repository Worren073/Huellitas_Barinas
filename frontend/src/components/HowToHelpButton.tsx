'use client';

import { useState } from 'react';
import AyudaModal from './AyudaModal';

export default function HowToHelpButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-transparent border border-primary text-primary font-label-md px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors"
      >
        Cómo Ayudar
      </button>
      <AyudaModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
