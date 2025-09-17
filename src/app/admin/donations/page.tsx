'use client';

import { useEffect, useState } from 'react';
import { donationListSchema } from '@/lib/schemas';
import type { Donation } from '@/lib/types';

export default function AdminDonations() {
  const [items, setItems] = useState<Donation[]>([]);

  useEffect(() => {
    (async () => {
      const raw = (await import('@/mocks/donations.json')).default;
      setItems(donationListSchema.parse(raw));
    })();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Donaciones</h2>
        <p className="note mt-1">Modo mock: lectura desde JSON local.</p>

        <div className="grid gap-3 mt-4">
          {items.map(d => (
            <div key={d.id} className="tile">
              <div className="tile-cta">
                <strong>{d.name.es}</strong>
                <span className="chip">{15} €</span>
              </div>
              {d.description?.es && <p style={{ color:'var(--muted)' }}>{d.description.es}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
