'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/Icon';
import LoadingButton from '@/components/LoadingButton';
import api from '@/lib/api';
import { normalizeImageUrl } from '@/lib/utils';
import { auth } from '@/lib/auth';

interface Center {
  id: number;
  name: string;
}

interface PetImage {
  id: number;
  image: string;
  is_primary: boolean;
  order: number;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  size: string;
  gender: string;
  weight_kg: number;
  description: string;
  health_notes: string;
  is_sterilized: boolean;
  is_vaccinated: boolean;
  is_dewormed: boolean;
  status: string;
  center: number;
  center_name: string;
  images: PetImage[];
  age_months: number;
}

interface PetFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  pet?: Pet;
}

function ageFromMonths(totalMonths: number): { value: number; unit: string } {
  if (totalMonths < 1) return { value: 1, unit: 'months' };
  if (totalMonths >= 24) return { value: Math.round(totalMonths / 12), unit: 'years' };
  if (totalMonths <= 1) return { value: totalMonths * 30, unit: 'days' };
  return { value: totalMonths, unit: 'months' };
}

function ageToMonths(value: number, unit: string): number {
  if (unit === 'days') return Math.round(value / 30);
  if (unit === 'years') return value * 12;
  return value;
}

export default function PetFormModal({ open, onClose, onSaved, pet }: PetFormModalProps) {
  const isEdit = !!pet;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const [centers, setCenters] = useState<Center[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [existingImages, setExistingImages] = useState<PetImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCenterId, setUserCenterId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '', species: 'dog', breed: '', size: 'medium',
    gender: 'M', weight_kg: 10, description: '', health_notes: '',
    is_sterilized: false, is_vaccinated: false, is_dewormed: false, status: 'available', center: '',
  });

  const initialAge = pet ? ageFromMonths(pet.age_months) : { value: 1, unit: 'months' };
  const [ageValue, setAgeValue] = useState(initialAge.value);
  const [ageUnit, setAgeUnit] = useState(initialAge.unit);

  const clearField = (field: string) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  useEffect(() => {
    auth.getProfile().then(p => {
      setUserRole(p.role);
      if (p.role === 'center_admin' && p.center) {
        setUserCenterId(p.center.id);
      }
    });
    api.get<{ results: Center[] }>('/centers/')
      .then(r => setCenters(r.data.results || r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        size: pet.size,
        gender: pet.gender,
        weight_kg: pet.weight_kg,
        description: pet.description || '',
        health_notes: pet.health_notes || '',
        is_sterilized: pet.is_sterilized,
        is_vaccinated: pet.is_vaccinated,
        is_dewormed: pet.is_dewormed,
        status: pet.status,
        center: String(pet.center),
      });
      setExistingImages(pet.images || []);
      const a = ageFromMonths(pet.age_months);
      setAgeValue(a.value);
      setAgeUnit(a.unit);
      setRemovedImageIds([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    } else {
      setForm({
        name: '', species: 'dog', breed: '', size: 'medium',
        gender: 'M', weight_kg: 10, description: '', health_notes: '',
        is_sterilized: false, is_vaccinated: false, is_dewormed: false, status: 'available', center: '',
      });
      setExistingImages([]);
      setRemovedImageIds([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setAgeValue(1);
      setAgeUnit('months');
    }
    setError('');
    setFieldErrors({});
  }, [pet, open]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles(f => [...f, ...files]);
    setNewImagePreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(f => f.filter((_, i) => i !== index));
    setNewImagePreviews(p => p.filter((_, i) => i !== index));
  };

  const removeExistingImage = (img: PetImage) => {
    setRemovedImageIds(ids => [...ids, img.id]);
    setExistingImages(imgs => imgs.filter(i => i.id !== img.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!form.center && !isEdit) { setFieldErrors({ center: 'Selecciona un centro' }); return; }
    if (!ageValue || ageValue < 1) { setFieldErrors({ age: 'Indica una edad válida' }); return; }

    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      const payload: Record<string, any> = {
        ...form,
        age_months: ageToMonths(ageValue, ageUnit),
        center: Number(form.center),
      };

      let petId: number;

      if (isEdit && pet) {
        const { data } = await api.patch<any>(`/pets/${pet.id}/`, payload);
        petId = pet.id;

        for (const imgId of removedImageIds) {
          try { await api.delete(`/pets/${petId}/images/${imgId}/`); } catch {}
        }

        for (const file of newImageFiles) {
          const fd = new FormData();
          fd.append('image', file);
          await api.post(`/pets/${petId}/images/`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        const { data } = await api.post<any>('/pets/', payload);
        petId = data.id;

        for (const file of newImageFiles) {
          const fd = new FormData();
          fd.append('image', file);
          await api.post(`/pets/${petId}/images/`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: Record<string, any> } };
      const detail = apiErr?.response?.data;
      if (detail) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(detail)) {
          const msg = Array.isArray(msgs) ? msgs[0] : typeof msgs === 'string' ? msgs : null;
          if (msg) mapped[key === 'age_months' ? 'age' : key] = msg;
        }
        if (Object.keys(mapped).length > 0) setFieldErrors(mapped);
        else setError(Object.values(detail).flat().join('. '));
      } else {
        setError(`Error al ${isEdit ? 'actualizar' : 'crear'} la mascota`);
      }
    } finally { submittingRef.current = false; setSubmitting(false) }
  };

  const baseInputClass = 'w-full bg-surface-container-lowest border rounded-lg font-body-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all';
  const inputClass = (field: string) =>
    `${baseInputClass} ${fieldErrors[field] ? 'border-red-400' : 'border-outline-variant focus:border-primary-container'}`;
  const labelClass = 'font-label-md text-on-surface mb-1.5 block';

  const centerSelectValue = userRole === 'center_admin' && userCenterId ? String(userCenterId) : form.center;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Mascota' : 'Nueva Mascota'} subtitle={isEdit ? pet?.name : undefined} maxWidth="lg">
      {error && <div className="mb-stack-md bg-status-error/10 text-status-error font-body-sm px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-stack-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          <div>
            <label className={labelClass}>Nombre</label>
            <input className={inputClass('name')} value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); clearField('name'); }} required />
            {fieldErrors.name && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Especie</label>
            <select className={inputClass('species')} value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))}>
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
              <option value="rabbit">Conejo</option>
              <option value="other">Otro</option>
            </select>
            {fieldErrors.species && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.species}</p>}
          </div>
          <div>
            <label className={labelClass}>Raza</label>
            <input className={inputClass('breed')} value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Edad</label>
            <div className="flex gap-2 items-center">
              <input type="number" min={1}
                className={`${baseInputClass} flex-1 text-center ${fieldErrors.age ? 'border-red-400' : 'border-outline-variant focus:border-primary-container'}`}
                value={ageValue || ''}
                onChange={e => { setAgeValue(e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 1)); clearField('age'); }} />
              <select className={`${baseInputClass} flex-1 ${fieldErrors.age ? 'border-red-400' : 'border-outline-variant focus:border-primary-container'}`}
                value={ageUnit} onChange={e => setAgeUnit(e.target.value)}>
                <option value="days">Días</option>
                <option value="months">Meses</option>
                <option value="years">Años</option>
              </select>
            </div>
            {fieldErrors.age && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.age}</p>}
          </div>
          <div>
            <label className={labelClass}>Tamaño</label>
            <select className={inputClass('size')} value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}>
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Género</label>
            <select className={inputClass('gender')} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              <option value="M">Macho</option>
              <option value="F">Hembra</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Peso (kg)</label>
            <input type="number" step="0.1" min={0.1} className={inputClass('weight_kg')}
              value={form.weight_kg || ''}
              onChange={e => { setForm(f => ({ ...f, weight_kg: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })); clearField('weight_kg'); }} />
            {fieldErrors.weight_kg && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.weight_kg}</p>}
          </div>
          <div>
            <label className={labelClass}>Centro</label>
            {userRole === 'center_admin' ? (
              <input className={`${baseInputClass} opacity-60`} value={centers.find(c => c.id === userCenterId)?.name || ''} disabled />
            ) : (
              <select className={inputClass('center')} value={form.center} onChange={e => { setForm(f => ({ ...f, center: e.target.value })); clearField('center'); }} required>
                <option value="">Seleccionar...</option>
                {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            {fieldErrors.center && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.center}</p>}
          </div>
          <div>
            <label className={labelClass}>Notas de Salud</label>
            <textarea rows={2} className={`${baseInputClass} resize-none`} value={form.health_notes} onChange={e => setForm(f => ({ ...f, health_notes: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select className={inputClass('status')} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="available">En Adopción</option>
              <option value="in_process">En Proceso</option>
              <option value="adopted">Adoptado</option>
              <option value="not_available">No Disponible</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea rows={4} className={`${baseInputClass} resize-none`} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div>
          <label className={labelClass}>Fotos de la Mascota</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map(img => (
              <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant group">
                <Image src={normalizeImageUrl(img.image)} alt="" fill className="object-cover" />
                <button type="button" onClick={() => removeExistingImage(img)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="close" className="w-3 h-3" />
                </button>
              </div>
            ))}
            {newImagePreviews.map((preview, i) => (
              <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant group">
                <Image src={preview} alt="" fill className="object-cover" />
                <button type="button" onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="close" className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-outline hover:border-primary hover:text-primary transition-colors cursor-pointer">
              <Icon name="add_a_photo" className="w-6 h-6" />
              <span className="font-label-sm">Agregar</span>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_vaccinated} onChange={e => setForm(f => ({ ...f, is_vaccinated: e.target.checked }))}
              className="w-5 h-5 rounded border-outline-variant text-primary-container focus:ring-primary-container" />
            <span className="font-body-md text-on-surface">Vacunado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_sterilized} onChange={e => setForm(f => ({ ...f, is_sterilized: e.target.checked }))}
              className="w-5 h-5 rounded border-outline-variant text-primary-container focus:ring-primary-container" />
            <span className="font-body-md text-on-surface">Esterilizado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_dewormed} onChange={e => setForm(f => ({ ...f, is_dewormed: e.target.checked }))}
              className="w-5 h-5 rounded border-outline-variant text-primary-container focus:ring-primary-container" />
            <span className="font-body-md text-on-surface">Desparasitado</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-all">
            Cancelar
          </button>
          <LoadingButton type="submit" loading={submitting} className="flex-1 py-3" variant="primary">
            {isEdit ? 'Guardar Cambios' : 'Crear Mascota'}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
