'use client';

import { useState, type FormEvent } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import Icon from '@/components/Icon';
import api from '@/lib/api';

export default function ContactoPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearField = (field: string) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setStatus('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      first_name: formData.get('first_name') as string,
      email: formData.get('email') as string,
      description: formData.get('description') as string,
    };

    try {
      await api.post('/help-requests/', data);
      setStatus('sent');
      form.reset();
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData && typeof errData === 'object') {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(errData)) {
          const msg = Array.isArray(msgs) ? msgs[0] : typeof msgs === 'string' ? msgs : null;
          if (msg) mapped[key] = msg;
        }
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
          setStatus('idle');
          return;
        }
      }
      setStatus('error');
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 rounded-lg border bg-surface focus:outline-none focus:border-primary transition-all ${
      fieldErrors[field] ? 'border-red-400' : 'border-outline-variant/30'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-container-max mx-auto px-4 md:px-8 py-stack-lg">
        <ScrollAnimation variant="slideUp">
          <h1 className="font-montserrat text-headline-xl text-on-surface mb-stack-md">Contacto</h1>
        </ScrollAnimation>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ScrollAnimation variant="slideLeft">
            <div className="flex flex-col gap-6">
            <p className="font-body-lg text-on-surface-variant">
              Estamos aquí para ayudarte. Si tienes preguntas sobre el proceso de adopción,
              deseas ser voluntario, o necesitas más información, no dudes en contactarnos.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: 'email', label: 'Correo Electrónico', value: 'huellitasvnz@gmail.com' },
                { icon: 'location', label: 'Dirección', value: 'Barinas, Venezuela' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                    <Icon name={item.icon} className="w-5 h-5 text-primary" solid />
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant">{item.label}</p>
                    <p className="font-body-md text-on-surface">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </ScrollAnimation>
          <ScrollAnimation variant="slideRight">
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20">
              <h2 className="font-headline-sm text-on-surface mb-4">Envíanos un mensaje</h2>
              {status === 'sent' && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg font-body-md">
                  Mensaje enviado con éxito. Te responderemos pronto.
                </div>
              )}
              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg font-body-md">
                  Error al enviar el mensaje. Intenta de nuevo más tarde.
                </div>
              )}
              <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="contact-name" className="font-label-sm text-on-surface-variant block mb-1">Nombre</label>
                  <input
                    id="contact-name"
                    name="first_name"
                    type="text"
                    required
                    pattern="[a-zA-ZáéíóúñÑ\s]+"
                    title="Solo letras"
                    className={inputClass('first_name')}
                    onChange={() => clearField('first_name')}
                  />
                  {fieldErrors.first_name && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.first_name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="font-label-sm text-on-surface-variant block mb-1">Correo Electrónico</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    className={inputClass('email')}
                    onChange={() => clearField('email')}
                  />
                  {fieldErrors.email && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="contact-message" className="font-label-sm text-on-surface-variant block mb-1">Mensaje</label>
                  <textarea
                    id="contact-message"
                    name="description"
                    rows={4}
                    required
                    className={`${inputClass('description')} resize-none`}
                    onChange={() => clearField('description')}
                  />
                  {fieldErrors.description && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.description}</p>}
                </div>
                <button type="submit" disabled={status === 'sending'} className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-lg hover:opacity-90 transition-opacity self-start disabled:opacity-50">
                  {status === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>
          </ScrollAnimation>
        </div>
      </main>
      <Footer />
    </div>
  );
}