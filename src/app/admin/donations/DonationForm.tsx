'use client';

import { donationSchema } from '@/lib/schemas';
import type { Donation } from '@/lib/types';
import { useState } from 'react';

export default function DonationForm({
  value, onCancel, onSaved
}: { value: Donation; onCancel: () => void; onSaved: () => void; }) {

  const [data, setData] = useState<Donation>(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = !data.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // valida con zod (permite id vacío si es nuevo)
    const candidate = {
      ...data,
      id: data.id || 'tmp',              // para pasar el schema; el backend generará id
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const parsed = donationSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues.map(i => i.message).join(' · '));
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const { id, createdAt, updatedAt, ...payload } = candidate;
        await fetch('/api/admin/donations', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/admin/donations/${data.id}`, {
          method:'PUT',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify(candidate),
        });
      }
      onSaved();
    } catch (err:any) {
      setError(err?.message ?? 'Error guardando');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <h3>{isNew ? 'Crear donación' : 'Editar donación'}</h3>
      {error && <div className="we-warning">{error}</div>}

      <div className="grid md:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span>Nombre (ES)</span>
          <input className="input" value={data.name.es}
            onChange={e => setData({ ...data, name: { ...data.name, es: e.target.value } })} />
        </label>
        <label className="grid gap-1">
          <span>Name (EN)</span>
          <input className="input" value={data.name.en}
            onChange={e => setData({ ...data, name: { ...data.name, en: e.target.value } })} />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span>Descripción (ES)</span>
          <textarea className="input" rows={3} value={data.description?.es ?? ''}
            onChange={e => setData({
              ...data,
              description: { ...(data.description ?? { es:'', en:'' }), es: e.target.value }
            })} />
        </label>
        <label className="grid gap-1">
          <span>Description (EN)</span>
          <textarea className="input" rows={3} value={data.description?.en ?? ''}
            onChange={e => setData({
              ...data,
              description: { ...(data.description ?? { es:'', en:'' }), en: e.target.value }
            })} />
        </label>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span>Slug</span>
          <input className="input" value={data.slug}
            onChange={e => setData({ ...data, slug: e.target.value })} />
        </label>

        <label className="grid gap-1">
          <span>Categoría</span>
          <select className="input" value={data.category}
            onChange={e => setData({ ...data, category: e.target.value as any })}>
            <option value="item">item</option>
            <option value="special_item">special_item</option>
            <option value="stat_boost">stat_boost</option>
            <option value="land_mine">land_mine</option>
            <option value="land_house">land_house</option>
            <option value="currency_ne">currency_ne</option>
            <option value="currency_ne_fake">currency_ne_fake</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span>Ámbito</span>
          <select className="input" value={data.scope}
            onChange={e => setData({ ...data, scope: e.target.value as any })}>
            <option value="personal">personal</option>
            <option value="clan">clan</option>
            <option value="both">both</option>
          </select>
        </label>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span>Precio EUR</span>
          <input type="number" min={0} step="0.01" className="input" value={data.price.eur}
            onChange={e => setData({ ...data, price: { ...data.price, eur: Number(e.target.value) } })} />
        </label>
        <label className="grid gap-1">
          <span>Monedas NE (opcional)</span>
          <input type="number" min={0} step="1" className="input" value={data.price.ne ?? ''}
            onChange={e => setData({
              ...data,
              price: { ...data.price, ne: e.target.value === '' ? undefined : Number(e.target.value) }
            })} />
        </label>
        <label className="grid gap-1">
          <span>Monedas NE Falsificadas (opcional)</span>
          <input type="number" min={0} step="1" className="input" value={data.price.neFake ?? ''}
            onChange={e => setData({
              ...data,
              price: { ...data.price, neFake: e.target.value === '' ? undefined : Number(e.target.value) }
            })} />
        </label>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span>Icon (URL o /images/...)</span>
          <input className="input" value={data.icon ?? ''}
            onChange={e => setData({ ...data, icon: e.target.value || undefined })} />
        </label>
        <label className="grid gap-1">
          <span>Destacado</span>
          <select className="input" value={String(!!data.featured)}
            onChange={e => setData({ ...data, featured: e.target.value === 'true' })}>
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </label>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span>Límite por cuenta</span>
          <input type="number" min={0} className="input" value={data.limits?.perAccount ?? ''}
            onChange={e => setData({
              ...data,
              limits: { ...(data.limits ?? {}), perAccount: e.target.value === '' ? undefined : Number(e.target.value) }
            })} />
        </label>
        <label className="grid gap-1">
          <span>Límite por clan</span>
          <input type="number" min={0} className="input" value={data.limits?.perClan ?? ''}
            onChange={e => setData({
              ...data,
              limits: { ...(data.limits ?? {}), perClan: e.target.value === '' ? undefined : Number(e.target.value) }
            })} />
        </label>
        <label className="grid gap-1">
          <span>Cooldown (días)</span>
          <input type="number" min={0} className="input" value={data.limits?.cooldownDays ?? ''}
            onChange={e => setData({
              ...data,
              limits: { ...(data.limits ?? {}), cooldownDays: e.target.value === '' ? undefined : Number(e.target.value) }
            })} />
        </label>
      </div>

      <label className="grid gap-1">
        <span>Metadata (JSON opcional)</span>
        <textarea className="input" rows={4}
          value={data.metadata ? JSON.stringify(data.metadata, null, 2) : ''}
          onChange={e => {
            const v = e.target.value.trim();
            try {
              const parsed = v ? JSON.parse(v) : undefined;
              setData({ ...data, metadata: parsed });
              setError(null);
            } catch {
              setError('Metadata debe ser JSON válido');
            }
          }} />
      </label>

      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : (isNew ? 'Crear' : 'Guardar')}
        </button>
      </div>
    </form>
  );
}
