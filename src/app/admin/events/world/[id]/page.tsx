'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { WorldEvent } from '@/lib/types';
import EventForm from '../EventForm';

export default function EditWorldEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<WorldEvent | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/world-events/${params.id}`, { cache: 'no-store' });
      if (!res.ok) { setErr('No encontrado'); return; }
      setItem(await res.json());
    })();
  }, [params.id]);

  if (err) return <div className="section"><div className="container"><div className="we-warning">{err}</div></div></div>;
  if (!item) return <div className="section"><div className="container"><div className="note">Cargando…</div></div></div>;

  const { id, ...rest } = item;

  return (
    <section className="section">
      <div className="container" style={{maxWidth: 880}}>
        <div className="tile">
          <div className="kicker">Eventos de mundo</div>
          <h2 className="section-title">Editar</h2>

          <EventForm
            initial={{ ...rest, id }}
            submitLabel="Guardar cambios"
            onSubmit={async (data) => {
              const res = await fetch(`/api/admin/world-events/${id}`, {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (!res.ok) throw new Error('No se pudo guardar');
              router.push('/admin/events/world');
            }}
          />
        </div>
      </div>
    </section>
  );
}
