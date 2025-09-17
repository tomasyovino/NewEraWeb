'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({
  initialError = '',
  nextPath = '',
}: { initialError?: string; nextPath?: string }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr]   = useState(initialError);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // mock auth:
    if (user === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD) {
      router.push(nextPath || '/admin');
    } else {
      setErr('Credenciales inválidas');
    }
  }

  return (
    <form onSubmit={onSubmit} className="tile max-w-md mx-auto">
      <h1 className="section-title">Admin Login</h1>
      {err && <div className="we-warning" role="alert">{err}</div>}
      <label className="grid gap-1 mt-3">
        <span>Usuario</span>
        <input className="input" value={user} onChange={e=>setUser(e.target.value)} />
      </label>
      <label className="grid gap-1 mt-3">
        <span>Contraseña</span>
        <input className="input" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
      </label>
      <button className="btn btn-primary mt-4" type="submit">Entrar</button>
    </form>
  );
}
