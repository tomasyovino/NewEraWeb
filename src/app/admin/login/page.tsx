'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/admin';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const username = form.get('username');
    const password = form.get('password');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.replace(next);
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error ?? 'Error');
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="tile">
          <div className="kicker">Acceso</div>
          <h1 style={{ fontWeight: 800 }}>Panel administrativo</h1>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>
            Usa tus credenciales para ingresar.
          </p>

          <form onSubmit={onSubmit} className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span>Usuario</span>
              <input
                name="username"
                type="text"
                required
                className="input"
                placeholder="admin"
                autoComplete="username"
              />
            </label>
            <label className="grid gap-1">
              <span>Contraseña</span>
              <input
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            {err && <div className="we-warning">{err}</div>}

            <button className="btn btn-primary w-[140px] justify-center" disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>

            <div className="note">
              (Mock) Usuario por defecto: <code>admin</code> — Contraseña: <code>admin123</code>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
