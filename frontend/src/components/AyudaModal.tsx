'use client';

import { useState, useEffect } from 'react';
import { sileo } from 'sileo';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/Icon';
import { auth } from '@/lib/auth';
import api from '@/lib/api';

interface AyudaModalProps {
  open: boolean;
  onClose: () => void;
}

const VENEZUELAN_STATES = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
  'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
  'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'La Guaira', 'Yaracuy', 'Zulia',
];

export default function AyudaModal({ open, onClose }: AyudaModalProps) {
  const [step, setStep] = useState<'select' | 'donate' | 'volunteer' | 'become_center'>('select');
  const [selectedState, setSelectedState] = useState('Todas');
  const [centers, setCenters] = useState<any[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    state: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      setIsLoggedIn(true);
      auth.getProfile().then((profile: any) => {
        setForm((f) => ({
          ...f,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
        }));
      }).catch(() => {});
    }
  }, [open]);

  const handleClose = () => {
    setStep('select');
    setSelectedState('Todas');
    setCenters([]);
    setForm({ first_name: '', last_name: '', email: '', phone: '', state: '', description: '' });
    onClose();
  };

  const fetchCentersByState = async (state: string) => {
    setLoadingCenters(true);
    try {
      const params = state === 'Todas' ? {} : { state };
      const r = await api.get('/centers/', { params });
      setCenters(r.data.results || r.data || []);
    } catch {
      setCenters([]);
    } finally {
      setLoadingCenters(false);
    }
  };

  const handleStateFilter = (state: string) => {
    setSelectedState(state);
    fetchCentersByState(state);
  };

  const handleSubmit = async (type: 'volunteer' | 'become_center') => {
    setSubmitting(true);
    try {
      await api.post('/help-requests/', {
        request_type: type,
        ...form,
      });
      sileo.success({
        title: 'Solicitud enviada',
        description: 'Recibiremos tu solicitud y te contactaremos pronto.',
      });
      handleClose();
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo enviar la solicitud.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm px-4 py-3 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all';

  const selectBtn = (label: string, selected: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-label-sm transition-all ${
        selected
          ? 'bg-primary text-on-primary shadow-sm'
          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal open={open} onClose={handleClose} title="¿Cómo quieres ayudar?" maxWidth="md">
      {step === 'select' && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => { setStep('donate'); fetchCentersByState('Todas'); }}
            className="flex items-start gap-4 bg-surface-container-low rounded-2xl p-6 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center shrink-0">
              <Icon name="favorite" className="w-5 h-5" solid />
            </div>
            <div>
              <h4 className="font-headline-sm text-on-surface mb-1">Donar a un centro</h4>
              <p className="font-body-sm text-on-surface-variant">
                Apoya económicamente o con insumos a los centros de adopción en Venezuela.
              </p>
            </div>
          </button>
          <button
            onClick={() => setStep('volunteer')}
            className="flex items-start gap-4 bg-surface-container-low rounded-2xl p-6 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center shrink-0">
              <Icon name="volunteer_activism" className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-headline-sm text-on-surface mb-1">Ser voluntario</h4>
              <p className="font-body-sm text-on-surface-variant">
                Únete como voluntario en los centros de adopción y ayuda a los animalitos.
              </p>
            </div>
          </button>
          <button
            onClick={() => setStep('become_center')}
            className="flex items-start gap-4 bg-surface-container-low rounded-2xl p-6 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center shrink-0">
              <Icon name="add_circle" className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-headline-sm text-on-surface mb-1">Registrar mi centro</h4>
              <p className="font-body-sm text-on-surface-variant">
                ¿Tienes un centro de adopción? Regístrate para aparecer en nuestra plataforma.
              </p>
            </div>
          </button>
        </div>
      )}

      {step === 'donate' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {['Todas', ...VENEZUELAN_STATES].map((s) => selectBtn(s, selectedState === s, () => handleStateFilter(s)))}
          </div>
          {loadingCenters ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : centers.length === 0 ? (
            <p className="text-center text-on-surface-variant font-body-md py-8">No hay centros disponibles en esta región.</p>
          ) : (
            <div className="grid gap-3">
              {centers.map((c: any) => (
                <div key={c.id} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
                  <h4 className="font-headline-sm text-on-surface mb-1">{c.name}</h4>
                  <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5 mb-1">
                    <Icon name="location" className="w-4 h-4" />
                    {c.address || c.state}
                  </p>
                  {c.phone && (
                    <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5">
                      <Icon name="call" className="w-4 h-4" />
                      {c.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setStep('select')} className="font-label-md text-primary mt-4 hover:underline">
            Volver
          </button>
        </div>
      )}

      {(step === 'volunteer' || step === 'become_center') && (
        <div className="space-y-4">
          {!isLoggedIn && (
            <p className="font-body-sm text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
              Inicia sesión para autocompletar tus datos.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Nombre</label>
              <input
                className={inputClass}
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Apellido</label>
              <input
                className={inputClass}
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Email</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Teléfono</label>
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>
          {step === 'become_center' && (
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Estado</label>
              <select
                className={inputClass}
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              >
                <option value="">Selecciona un estado</option>
                {VENEZUELAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="font-label-md text-on-surface mb-1.5 block">
              {step === 'volunteer' ? '¿Por qué quieres ser voluntario?' : 'Describe tu centro'}
            </label>
            <textarea
              rows={4}
              className={`${inputClass} resize-none`}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={
                step === 'volunteer'
                  ? 'Cuéntanos sobre ti y por qué te gustaría ayudar...'
                  : 'Nombre del centro, misión, tipo de animales que atienden...'
              }
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep('select')}
              className="px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-colors"
            >
              Volver
            </button>
            <button
              onClick={() => handleSubmit(step)}
              disabled={submitting || !form.first_name || !form.last_name || !form.email}
              className="flex-1 bg-primary text-on-primary font-label-md py-2.5 rounded-lg hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
              Enviar Solicitud
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
