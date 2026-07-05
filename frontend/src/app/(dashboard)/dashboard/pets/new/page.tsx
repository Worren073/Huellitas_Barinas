'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import Icon from '@/components/Icon';
import api from '@/lib/api';

interface Center {
  id: number;
  name: string;
}

export default function NewPetPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', species: 'dog', breed: '', size: 'medium',
    gender: 'M', weight_kg: 10, description: '', health_notes: '',
    is_sterilized: false, is_vaccinated: false, is_dewormed: false, status: 'available', center: '',
  });
  const [ageValue, setAgeValue] = useState(1);
  const [ageUnit, setAgeUnit] = useState('months');

  const clearField = (field: string) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  useEffect(() => {
    api.get<{ results: Center[] }>('/centers/')
      .then(r => setCenters(r.data.results || r.data || []))
      .catch(() => {});
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(f => f.filter((_, i) => i !== index));
    setImagePreviews(p => p.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ageToMonths = (value: number, unit: string): number => {
    if (unit === 'days') return Math.round(value / 30);
    if (unit === 'years') return value * 12;
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!form.center) { setFieldErrors({ center: 'Selecciona un centro' }); return; }
    if (!ageValue || ageValue < 1) { setFieldErrors({ age: 'Indica una edad válida' }); return; }

    setSubmitting(true);
    try {
      const { data: pet } = await api.post<any>('/pets/', {
        ...form,
        age_months: ageToMonths(ageValue, ageUnit),
        center: Number(form.center),
      });
      const petId = pet.id;

      for (const file of imageFiles) {
        const fd = new FormData();
        fd.append('image', file);
        await api.post(`/pets/${petId}/images/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      router.push('/dashboard/pets');
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
        setError('Error al crear la mascota');
      }
    } finally { setSubmitting(false) }
  };

  const baseInputClass = 'w-full bg-surface-container-lowest border rounded-lg font-body-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all';
  const inputClass = (field: string) =>
    `${baseInputClass} ${fieldErrors[field] ? 'border-red-400' : 'border-outline-variant focus:border-primary-container'}`;
  const labelClass = 'font-label-md text-on-surface mb-1.5 block';

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1 font-label-md text-primary hover:underline mb-stack-md">
          <Icon name="chevron_left" className="w-4 h-4" /> Volver
        </button>

        <div className="bg-surface rounded-2xl p-stack-lg ambient-shadow border border-outline-variant">
          <h1 className="font-montserrat text-headline-md text-on-surface mb-stack-lg">Nueva Mascota</h1>

          {error && <div className="mb-stack-md bg-status-error/10 text-status-error font-body-sm px-4 py-3 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-stack-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  className={inputClass('name')}
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); clearField('name'); }}
                  required
                />
                {fieldErrors.name && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>Especie</label>
                <select className={inputClass('species')} value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))}>
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
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
                  <input
                    type="number"
                    min={1}
                    className={`${baseInputClass} w-24 text-center ${fieldErrors.age ? 'border-red-400' : 'border-outline-variant focus:border-primary-container'}`}
                    value={ageValue || ''}
                    onChange={e => { setAgeValue(e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 1)); clearField('age'); }}
                  />
                  <select
                    className={`${baseInputClass} flex-1 ${fieldErrors.age ? 'border-red-400' : 'border-outline-variant focus:border-primary-container'}`}
                    value={ageUnit}
                    onChange={e => setAgeUnit(e.target.value)}
                  >
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
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  className={inputClass('weight_kg')}
                  value={form.weight_kg || ''}
                  onChange={e => { setForm(f => ({ ...f, weight_kg: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })); clearField('weight_kg'); }}
                />
                {fieldErrors.weight_kg && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.weight_kg}</p>}
              </div>
              <div>
                <label className={labelClass}>Centro</label>
                <select className={inputClass('center')} value={form.center} onChange={e => { setForm(f => ({ ...f, center: e.target.value })); clearField('center'); }} required>
                  <option value="">Seleccionar...</option>
                  {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {fieldErrors.center && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.center}</p>}
              </div>
              <div>
                <label className={labelClass}>Notas de Salud</label>
                <textarea rows={2} className={`${baseInputClass} resize-none border-outline-variant focus:border-primary-container`} value={form.health_notes} onChange={e => setForm(f => ({ ...f, health_notes: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select className={inputClass('status')} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="available">En Adopción</option>
                  <option value="in_process">En Proceso</option>
                  <option value="adopted">Adoptado</option>
                  <option value="removed">Removido</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Descripción</label>
              <textarea rows={4} className={`${baseInputClass} resize-none border-outline-variant focus:border-primary-container`} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div>
              <label className={labelClass}>Fotos de la Mascota</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant group">
                    <Image src={preview} alt="" fill className="object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
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

            <button type="submit" disabled={submitting}
              className="w-full bg-primary text-on-primary font-label-md py-4 rounded-lg shadow-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? 'Creando...' : 'Crear Mascota'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}