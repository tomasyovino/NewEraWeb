// src/app/[lang]/donate/packs/page.tsx
import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { getPacks } from '@/lib/data-source';
import type { Locale } from '@/lib/types';
import { priceLabel } from '@/lib/donations';

function dict(lang: Locale) {
  const p = path.join(process.cwd(), 'i18n', `${lang}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export default async function PacksPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'en' ? 'en' : 'es') as Locale;
  const d = dict(lang);
  const packs = await getPacks();

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">{lang==='es' ? 'Packs' : 'Packs'}</h1>
        <div className="note" style={{marginTop:8}}>
          {lang==='es'
            ? 'Vista informativa de packs disponibles. Cada pack detalla su contenido.'
            : 'Informative view of available packs. Each pack lists its contents.'}
        </div>

        {packs.length === 0 ? (
          <div className="note mt-4">{lang==='es' ? 'No hay packs disponibles.' : 'No packs available.'}</div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {packs.map(pk => {
              const price = priceLabel(pk.price, lang);
              return (
                <article key={pk.id} className="tile">
                  <div className="tile-cta">
                    <div className="flex items-center gap-3">
                      {pk.icon && <Image src={pk.icon} alt="" width={48} height={48} className="icon-glow" />}
                      <div>
                        <h3>{pk.name[lang]}</h3>
                        {pk.description?.[lang] && (
                          <p className="text-sm" style={{ color:'var(--muted)' }}>{pk.description[lang]}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="chip">{price.main}</span>
                      {price.extra.map((x,i) => <span key={i} className="chip chip-alt">{x}</span>)}
                    </div>
                  </div>

                  {/* Items del pack (collapsible simple) */}
                  <details className="mt-2 group">
                    <summary className="row cursor-pointer">
                      <span className="font-semibold">
                        {lang==='es' ? 'Contenido del pack' : 'Pack contents'}
                      </span>
                      <svg className="caret" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
                        <path d="M8 5l8 7-8 7z" />
                      </svg>
                    </summary>
                    <div className="details-body mt-2">
                      <div>
                        <ul className="we-list-soft">
                          {pk.items.map((it, i) => (
                            <li key={i} className="chip">
                              {it.qty ? `${it.qty}x ` : ''}{it.donationId}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
