'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { sileo } from 'sileo';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import LoadingButton from '@/components/LoadingButton';
import api from '@/lib/api';
import { auth } from '@/lib/auth';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age_months?: number;
  center: number;
  center_name?: string;
  status: string;
  images?: { id: number; image: string; is_primary: boolean }[];
  is_vaccinated?: boolean;
  is_sterilized?: boolean;
}

interface FormData {
  motivation: string;
  experience: string;
  home_type: string;
  has_yard: boolean;
  has_other_pets: boolean;
  other_pets_details: string;
  family_members: number;
}

interface FormErrors {
  [key: string]: string;
}

export default function AdoptarPage() {
  const params = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    motivation: '',
    experience: '',
    home_type: 'house',
    has_yard: false,
    has_other_pets: false,
    other_pets_details: '',
    family_members: 1,
  });

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push(`/login?redirect=/adoptar/${params.id}`);
      return;
    }
    api.get(`/pets/${params.id}/`)
      .then(res => {
        const data = res.data;
        if (data.status !== 'available') {
          setError('Esta mascota no está disponible para adopción');
        }
        setPet(data);
      })
      .catch(() => setError('No se pudo cargar la información de la mascota'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.motivation.trim()) errors.motivation = 'La motivación es requerida';
    if (!formData.home_type) errors.home_type = 'Selecciona un tipo de vivienda';
    if (formData.family_members < 1) errors.family_members = 'Debe haber al menos 1 miembro';
    if (formData.has_other_pets && !formData.other_pets_details.trim()) {
      errors.other_pets_details = 'Describe las otras mascotas';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !pet) return;

    setSubmitting(true);
    setError('');

    try {
      await api.post('/adoptions/', {
        pet: pet.id,
        center: pet.center,
        ...formData,
      });
      sileo.success({
        title: '¡Solicitud enviada!',
        description: `Tu postulación para ${pet.name} ha sido enviada correctamente.`,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: Record<string, any> } };
      const detail = apiError?.response?.data;
      if (detail) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(detail)) {
          const msg = Array.isArray(msgs) ? msgs[0] : typeof msgs === 'string' ? msgs : null;
          if (msg) mapped[key] = msg;
        }
        if (Object.keys(mapped).length > 0) {
          setFormErrors(mapped);
        } else {
          setError('Error al enviar la solicitud');
        }
      } else {
        setError('Error al enviar la solicitud');
        sileo.error({ title: 'Error', description: 'Error al enviar la solicitud' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors(prev => { const { [key]: _, ...rest } = prev; return rest; });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-20 h-20 rounded-full bg-primary-container/30 flex items-center justify-center">
            <Icon name="check_circle_solid" className="w-10 h-10 text-primary-container" />
          </div>
          <h1 className="font-montserrat text-headline-lg text-on-surface text-center">Solicitud Enviada</h1>
          <p className="font-body-md text-on-surface-variant text-center max-w-md">
            Hemos recibido tu solicitud de adopción para <strong>{pet?.name}</strong>. 
            El centro de adopción se pondrá en contacto contigo pronto.
          </p>
          <div className="flex gap-4">
            <Link href="/mascotas" className="bg-primary-container text-on-primary-container font-label-md px-6 py-3 rounded-lg">
              Ver más mascotas
            </Link>
            <Link href="/" className="border border-outline-variant text-on-surface font-label-md px-6 py-3 rounded-lg">
              Ir al inicio
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <Icon name="pets" className="w-16 h-16 text-outline" />
          <p className="font-headline-sm text-on-surface">{error || 'Mascota no encontrada'}</p>
          <Link href="/mascotas" className="text-primary hover:underline font-label-md">Volver a mascotas</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const inputClass = 'w-full bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm px-4 py-3 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all';
  const labelClass = 'font-label-md text-on-surface mb-1.5';
  const errorClass = 'font-label-sm text-status-error mt-1';
  const fieldClass = 'flex flex-col gap-1';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-8 py-stack-lg">
        <Link href={`/pets/${pet.id}`} className="flex items-center gap-1 font-label-md text-primary hover:underline mb-stack-md">
          <Icon name="chevron_left" className="w-4 h-4" />
          Volver a {pet.name}
        </Link>

        <div className="bg-surface rounded-2xl p-stack-lg ambient-shadow border border-outline-variant">
          <div className="flex items-center gap-4 mb-stack-lg pb-stack-lg border-b border-outline-variant">
            <div className="w-16 h-16 rounded-xl bg-primary-container/20 flex items-center justify-center">
              <Icon name="pets" className="w-8 h-8 text-primary-container" />
            </div>
            <div>
              <h1 className="font-montserrat text-headline-md text-on-surface">Solicitud de Adopción</h1>
              <p className="font-body-sm text-on-surface-variant">
                Para {pet.name} - {pet.center_name || 'Centro de adopción'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-stack-md bg-status-error/10 text-status-error font-body-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <Icon name="error" className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
            <div className={fieldClass}>
              <label className={labelClass} htmlFor="motivation">Motivación</label>
              <textarea
                id="motivation"
                rows={4}
                placeholder="Cuéntanos por qué quieres adoptar a esta mascota..."
                className={`${inputClass} resize-none`}
                value={formData.motivation}
                onChange={e => updateField('motivation', e.target.value)}
              />
              {formErrors.motivation && <p className={errorClass}>{formErrors.motivation}</p>}
            </div>

            <div className={fieldClass}>
              <label className={labelClass} htmlFor="experience">Experiencia con mascotas</label>
              <textarea
                id="experience"
                rows={3}
                placeholder="¿Has tenido mascotas antes? Cuéntanos tu experiencia..."
                className={`${inputClass} resize-none`}
                value={formData.experience}
                onChange={e => updateField('experience', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <div className={fieldClass}>
                <label className={labelClass} htmlFor="home_type">Tipo de vivienda</label>
                <select
                  id="home_type"
                  className={inputClass}
                  value={formData.home_type}
                  onChange={e => updateField('home_type', e.target.value)}
                >
                  <option value="house">Casa</option>
                  <option value="apartment">Apartamento</option>
                  <option value="other">Otro</option>
                </select>
                {formErrors.home_type && <p className={errorClass}>{formErrors.home_type}</p>}
              </div>

              <div className={fieldClass}>
                <label className={labelClass} htmlFor="family_members">Miembros de la familia</label>
                <input
                  id="family_members"
                  type="number"
                  min={1}
                  className={inputClass}
                  value={formData.family_members || ''}
                  onChange={e => updateField('family_members', e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 1))}
                />
                {formErrors.family_members && <p className={errorClass}>{formErrors.family_members}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-outline-variant text-primary-container focus:ring-primary-container"
                  checked={formData.has_yard}
                  onChange={e => updateField('has_yard', e.target.checked)}
                />
                <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">Tengo patio</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-outline-variant text-primary-container focus:ring-primary-container"
                  checked={formData.has_other_pets}
                  onChange={e => updateField('has_other_pets', e.target.checked)}
                />
                <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">Tengo otras mascotas</span>
              </label>
            </div>

            {formData.has_other_pets && (
              <div className={fieldClass}>
                <label className={labelClass} htmlFor="other_pets_details">Detalles de otras mascotas</label>
                <textarea
                  id="other_pets_details"
                  rows={2}
                  placeholder="¿Qué mascotas tienes? Edad, especie, temperamento..."
                  className={`${inputClass} resize-none`}
                  value={formData.other_pets_details}
                  onChange={e => updateField('other_pets_details', e.target.value)}
                />
                {formErrors.other_pets_details && <p className={errorClass}>{formErrors.other_pets_details}</p>}
              </div>
            )}

            <LoadingButton
              type="submit"
              loading={submitting}
              className="w-full py-4 mt-stack-sm"
              variant="primary"
              icon="favorite"
            >
              Enviar Solicitud
            </LoadingButton>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
