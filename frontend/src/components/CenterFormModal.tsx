'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/Icon';
import LoadingButton from '@/components/LoadingButton';
import api from '@/lib/api';
import { normalizeImageUrl, VENEZUELAN_STATES } from '@/lib/utils';

interface Center {
  id: number;
  name: string;
  description: string;
  address: string;
  state: string;
  phone: string;
  email: string;
  status: string;
  max_capacity: number;
  current_capacity: number;
  pets_count: number;
  is_full: boolean;
  logo?: string | null;
  cover_image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface CenterAdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  center: number | null;
}

interface CenterFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  center?: Center;
  userRole: string;
}

export default function CenterFormModal({ open, onClose, onSaved, center, userRole }: CenterFormModalProps) {
  const isEdit = !!center;
  const [centerAdmins, setCenterAdmins] = useState<CenterAdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedAdmin, setSelectedAdmin] = useState<number | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', address: '', state: 'Barinas',
    phone: '', email: '', max_capacity: 50, latitude: '', longitude: '',
  });

  const fetchCenterAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const r = await api.get<{ results: CenterAdminUser[] }>('/users/?role=center_admin');
      const availableAdmins = (r.data.results || r.data || []).filter(u => !u.center);
      setCenterAdmins(availableAdmins);
    } catch { setCenterAdmins([]) }
    finally { setLoadingAdmins(false) }
  };

  useEffect(() => {
    if (!open) return;
    if (!isEdit && userRole === 'superadmin') {
      fetchCenterAdmins();
    }
    if (center) {
      setForm({
        name: center.name,
        description: center.description,
        address: center.address,
        state: center.state,
        phone: center.phone,
        email: center.email,
        max_capacity: center.max_capacity,
        latitude: center.latitude ? String(center.latitude) : '',
        longitude: center.longitude ? String(center.longitude) : '',
      });
      setLogoPreview(null);
      setCoverPreview(null);
      setLogoFile(null);
      setCoverFile(null);
    } else {
      setForm({
        name: '', description: '', address: '', state: 'Barinas',
        phone: '', email: '', max_capacity: 50, latitude: '', longitude: '',
      });
      setLogoPreview(null);
      setCoverPreview(null);
      setLogoFile(null);
      setCoverFile(null);
      setSelectedAdmin(null);
    }
    setError('');
    setFieldErrors({});
  }, [center, open, isEdit, userRole]);

  const clearField = (field: string) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const inputClass = (field: string = '') =>
    `w-full bg-surface-container-lowest border rounded-lg font-body-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all ${
      field && fieldErrors[field] ? 'border-red-400' : 'border-outline-variant focus:border-primary-container'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});

    if (!isEdit && userRole === 'superadmin' && !selectedAdmin) {
      setError('Debe seleccionar un administrador para el centro');
      setSubmitting(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('address', form.address);
      fd.append('state', form.state);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('max_capacity', String(form.max_capacity));
      if (form.latitude) fd.append('latitude', form.latitude);
      if (form.longitude) fd.append('longitude', form.longitude);
      if (logoFile) fd.append('logo', logoFile);
      if (coverFile) fd.append('cover_image', coverFile);

      if (isEdit && center) {
        await api.patch(`/centers/${center.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const { data: createdCenter } = await api.post('/centers/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (selectedAdmin && userRole === 'superadmin') {
          await api.patch(`/users/${selectedAdmin}/`, {
            role: 'center_admin',
            center: createdCenter.id,
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
          if (msg) mapped[key] = msg;
        }
        if (Object.keys(mapped).length > 0) setFieldErrors(mapped);
        else setError(Object.values(detail).flat().join('. '));
      } else {
        setError(`Error al ${isEdit ? 'actualizar' : 'crear'} el centro`);
      }
    } finally { setSubmitting(false) }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={() => { onClose(); setLogoFile(null); setCoverFile(null); setLogoPreview(null); setCoverPreview(null); }}>
      <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}>
        <div className="p-stack-md border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-surface rounded-t-2xl">
          <h3 className="font-headline-sm text-on-surface">
            {isEdit ? 'Editar Centro' : 'Nuevo Centro'}
          </h3>
          <button onClick={() => { onClose(); setLogoFile(null); setCoverFile(null); setLogoPreview(null); setCoverPreview(null); }}
            className="text-on-surface-variant hover:text-on-surface">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-stack-md space-y-stack-md">
          {error && <div className="bg-status-error/10 text-status-error font-body-sm p-3 rounded-lg">{error}</div>}
          <div>
            <label className="font-label-md text-on-surface mb-1.5 block">Nombre</label>
            <input className={inputClass('name')} value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); clearField('name'); }} required />
            {fieldErrors.name && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="font-label-md text-on-surface mb-1.5 block">Descripción</label>
            <textarea rows={3} className={`${inputClass('description')} resize-none`} value={form.description}
              onChange={e => { setForm(f => ({ ...f, description: e.target.value })); clearField('description'); }} required />
            {fieldErrors.description && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.description}</p>}
          </div>
          <div>
            <label className="font-label-md text-on-surface mb-1.5 block">Dirección</label>
            <input className={inputClass('address')} value={form.address}
              onChange={e => { setForm(f => ({ ...f, address: e.target.value })); clearField('address'); }} />
          </div>
          <div>
            <label className="font-label-md text-on-surface mb-1.5 block">Estado</label>
            <select className={inputClass('state')} value={form.state}
              onChange={e => { setForm(f => ({ ...f, state: e.target.value })); clearField('state'); }}>
              {VENEZUELAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Teléfono</label>
              <input type="tel" inputMode="numeric" className={inputClass('phone')} value={form.phone}
                onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); clearField('phone'); }} required />
              {fieldErrors.phone && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.phone}</p>}
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Email</label>
              <input type="email" className={inputClass('email')} value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); clearField('email'); }} required />
              {fieldErrors.email && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.email}</p>}
            </div>
          </div>
          <div>
            <label className="font-label-md text-on-surface mb-1.5 block">Capacidad Máxima</label>
            <input type="number" min={1} className={inputClass('max_capacity')} value={form.max_capacity || ''}
              onChange={e => {
                setForm(f => ({ ...f, max_capacity: e.target.value === '' ? 0 : Number(e.target.value) }));
                clearField('max_capacity');
              }} />
            {fieldErrors.max_capacity && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.max_capacity}</p>}
          </div>

          <div>
            <label className="font-label-md text-on-surface mb-1.5 block">Logo del Centro</label>
            <div className="flex items-center gap-4">
              {(logoPreview || (isEdit && center?.logo && !logoFile)) ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant">
                  <Image src={logoPreview || normalizeImageUrl(center!.logo!)} alt="" fill className="object-cover" />
                  <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center">
                    <Icon name="close" className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center text-outline">
                  <Icon name="photo_library" className="w-6 h-6" />
                </div>
              )}
              <label className="cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-label-sm text-on-surface hover:bg-surface-gray transition-colors">
                Seleccionar archivo
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            </div>
          </div>
          <div>
            <label className="font-label-md text-on-surface mb-1.5 block">Imagen de Portada</label>
            <div className="flex items-center gap-4">
              {(coverPreview || (isEdit && center?.cover_image && !coverFile)) ? (
                <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-outline-variant">
                  <Image src={coverPreview || normalizeImageUrl(center!.cover_image!)} alt="" fill className="object-cover" />
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center">
                    <Icon name="close" className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-28 h-16 rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center text-outline">
                  <Icon name="photo_library" className="w-6 h-6" />
                </div>
              )}
              <label className="cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-label-sm text-on-surface hover:bg-surface-gray transition-colors">
                Seleccionar archivo
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Latitud</label>
              <input type="number" step="any" className={inputClass('latitude')} placeholder="8.615"
                value={form.latitude}
                onChange={e => { setForm(f => ({ ...f, latitude: e.target.value })); clearField('latitude'); }} />
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Longitud</label>
              <input type="number" step="any" className={inputClass('longitude')} placeholder="-70.207"
                value={form.longitude}
                onChange={e => { setForm(f => ({ ...f, longitude: e.target.value })); clearField('longitude'); }} />
            </div>
          </div>

          {!isEdit && userRole === 'superadmin' && (
            <div>
              <label className="font-label-md text-on-surface mb-1.5 block">Administrador del Centro</label>
              {loadingAdmins ? (
                <div className="flex items-center justify-center py-3">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : centerAdmins.length === 0 ? (
                <div className="p-3 bg-surface-container-low rounded-lg text-center">
                  <p className="font-body-sm text-on-surface-variant">No hay administradores de centro disponibles</p>
                </div>
              ) : (
                <select className={inputClass('admin')} value={selectedAdmin || ''}
                  onChange={e => { setSelectedAdmin(e.target.value ? parseInt(e.target.value) : null); clearField('admin'); }}>
                  <option value="">Selecciona un administrador</option>
                  {centerAdmins.map(admin => (
                    <option key={admin.id} value={admin.id}>
                      {admin.first_name} {admin.last_name} ({admin.email})
                    </option>
                  ))}
                </select>
              )}
              <p className="font-label-sm text-on-surface-variant mt-1.5">Solo se muestran usuarios sin centro asignado</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { onClose(); setLogoFile(null); setCoverFile(null); setLogoPreview(null); setCoverPreview(null); }}
              className="flex-1 px-4 py-3 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-all">
              Cancelar
            </button>
            <LoadingButton type="submit" loading={submitting} className="flex-1 py-3" variant="primary">
              {isEdit ? 'Guardar Cambios' : 'Crear Centro'}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
