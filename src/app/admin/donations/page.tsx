'use client';

import { useEffect, useMemo, useState } from 'react';
import DonationForm from './DonationForm';
import type { Donation, DonationCategory, DonationScope } from '@/lib/types';

export default function AdminDonationsPage() {
  const [items, setItems] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<DonationCategory | ''>('');
  const [scope, setScope] = useState<DonationScope | ''>('');
  const [editing, setEditing] = useState<Donation | null>(null);

  const reload = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/donations', { cache: 'no-store' });
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    return items.filter(d => {
      if (category && d.category !== category) return false;
      if (scope && !(d.scope === scope || d.scope === 'both')) return false;
      if (q) {
        const t = q.toLowerCase();
        const hit =
          d.name.es.toLowerCase().includes(t) ||
          d.name.en.toLowerCase().includes(t) ||
          (d.description?.es?.toLowerCase().includes(t) ?? false) ||
          (d.description?.en?.toLowerCase().includes(t) ?? false);
        if (!hit) return false;
      }
      return true;
    });
  }, [items, q, category, scope]);

  return (
    <div className="container py-8">
      <h1 className="section-title">Admin · Donaciones</h1>

      <div className="tile mt-4">
        <div className="tile-cta">
          <div className="flex gap-2 flex-wrap">
            <input className="input" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} />
            <select className="input" value={category} onChange={e => setCategory(e.target.value as any)}>
              <option value="">Categoría</option>
              <option value="item">item</option>
              <option value="special_item">special_item</option>
              <option value="stat_boost">stat_boost</option>
              <option value="land_mine">land_mine</option>
              <option value="land_house">land_house</option>
              <option value="currency_ne">currency_ne</option>
              <option value="currency_ne_fake">currency_ne_fake</option>
            </select>
            <select className="input" value={scope} onChange={e => setScope(e.target.value as any)}>
              <option value="">Ámbito</option>
              <option value="personal">personal</option>
              <option value="clan">clan</option>
              <option value="both">both</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={() => setEditing({
            id: '', slug: '', name: { es: '', en: '' }, category: 'item',
            scope: 'personal', price: { eur: 0 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          } as Donation)}>
            Nuevo
          </button>
        </div>

        {loading ? <div className="note mt-2">Cargando…</div> : (
          <div className="mt-2 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ textAlign:'left', color:'var(--muted)' }}>
                  <th>Nombre (ES)</th>
                  <th>Nombre (EN)</th>
                  <th>Categoría</th>
                  <th>Ámbito</th>
                  <th>EUR</th>
                  <th>NE</th>
                  <th>NEF</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>{d.name.es}</td>
                    <td>{d.name.en}</td>
                    <td>{d.category}</td>
                    <td>{d.scope}</td>
                    <td>{d.price.eur}</td>
                    <td>{d.price.ne ?? '—'}</td>
                    <td>{d.price.neFake ?? '—'}</td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="btn btn-ghost" onClick={() => setEditing(d)}>Editar</button>
                        <button className="btn btn-ghost" onClick={async () => {
                          if (!confirm('¿Eliminar donación?')) return;
                          await fetch(`/api/admin/donations/${d.id}`, { method:'DELETE' });
                          reload();
                        }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ color:'var(--muted)', padding:'8px 0' }}>Sin resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="tile mt-4">
          <DonationForm
            value={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload(); }}
          />
        </div>
      )}
    </div>
  );
}
