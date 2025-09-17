import '../../styles/global.css';
import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>Admin · New Era</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Fondo */}
        <div className="bg-scene" />
        <div className="bg-dots" />
        <div className="vignette" />

        {/* Header compacto */}
        <div className="header-wrap">
          <div className="header">
            <Link href="/admin" className="brand">
              <span className="brand-title">Admin</span>
            </Link>

            <nav className="nav">
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/events/weekly">Eventos semanales</Link>
              <Link href="/admin/events/world">Eventos de mundo</Link>
              <Link href="/admin/donations">Donaciones</Link>
            </nav>

            <form action="/api/auth/logout" method="post">
              <button className="btn btn-ghost" type="submit">Salir</button>
            </form>
          </div>
        </div>

        <main className="main-pad">
          <div className="container">{children}</div>
        </main>
      </body>
    </html>
  );
}
