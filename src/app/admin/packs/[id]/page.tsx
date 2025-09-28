'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PackForm from '../PackForm';
import type { Pack } from '@/lib/types';

export default function AdminPackEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<Pack | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/packs/${params.id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('No encontrado');
        setItem(await res.json());
      } catch (e: any) {
        setErr(e?.message ?? 'No encontrado');
      }
    })();
  }, [params.id]);

  if (err) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 880 }}>
          <div className="tile">
            <div className="we-warning">{err}</div>
          </div>
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 880 }}>
          <div className="tile">
            <div className="note">Cargando…</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 880 }}>
        <div className="tile">
          <PackForm
            value={item}
            onCancel={() => router.push('/admin/packs')}
            onSaved={() => router.push('/admin/packs')}
          />
        </div>
      </div>
    </section>
  );
}
