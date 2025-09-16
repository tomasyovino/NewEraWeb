import '../styles/global.css';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import fs from 'node:fs';
import path from 'node:path';

type Dict = Record<string, any>;

function loadDict(lang: string): Dict {
  const p = path.join(process.cwd(), 'i18n', `${lang}.json`);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

export default function RootLayout({ children, params }: { children: ReactNode; params: { lang: string } }) {
  const dict = loadDict(params.lang || 'es');

  return (
    <html lang={params.lang}>
      <head>
        <link rel="icon" href="/images/favicon.ico" />
        <title>{dict.brand}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="var(--color-bg)" />
      </head>
      <body className="min-h-screen">
        <header className="border-b border-surface/60">
          <div className="container-default flex items-center gap-4 py-3">
            <Link href={`/${params.lang}`} className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="logo" width={36} height={36} className="rounded-xl" />
              <span className="font-semibold tracking-wide">{dict.brand}</span>
            </Link>
            <nav className="ml-auto flex items-center gap-1">
              <NavLink href={`/${params.lang}`}>{dict.nav.home}</NavLink>
              <NavLink href={`/${params.lang}/about`}>{dict.nav.about}</NavLink>
              <NavLink href={`/${params.lang}/discord`}>{dict.nav.discord}</NavLink>
              <NavLink href={`/${params.lang}/wiki`}>{dict.nav.wiki}</NavLink>
              <NavLink href={`/${params.lang}/donate`}>{dict.nav.donate}</NavLink>
            </nav>
            <div className="ml-2">
              <LangSwitcher current={params.lang} />
            </div>
          </div>
        </header>
        <main className="container-default py-8">{children}</main>
        <footer className="mt-12 border-t border-surface/60">
          <div className="container-default py-6 text-sm text-subtle">
            © {new Date().getFullYear()} UO New Era — All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="nav-link text-subtle hover:text-text">
      {children}
    </Link>
  );
}

function LangSwitcher({ current }: { current: string }) {
  const other = current === 'es' ? 'en' : 'es';
  return (
    <Link
      className="px-3 py-2 rounded-xl border border-surface/60 hover:bg-surface/60 transition text-subtle hover:text-text"
      href={`/${other}`}
    >
      {other.toUpperCase()}
    </Link>
  );
}

export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}
