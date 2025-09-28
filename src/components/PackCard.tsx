'use client';

import { useMemo, useState } from 'react';
import type { Locale, Pack, Donation } from '@/lib/types';

/**
 * Permite resolver el nombre legible de un item del pack a partir de su donationId.
 * Si no se provee, se mostrará el ID y la cantidad.
 */
type ResolveDonationName = (id: string, lang: Locale) => string | undefined;

function fmtEur(n: number, lang: Locale) {
  const loc = lang === 'es' ? 'es-ES' : 'en-GB';
  return new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n);
}

function PriceChips({ pack, lang }: { pack: Pack; lang: Locale }) {
  const chips: string[] = [];
  if (pack.price?.eur != null) chips.push(fmtEur(pack.price.eur, lang));
  if (pack.price?.ne != null) chips.push(`${pack.price.ne} NE`);
  if (pack.price?.neFake != null) chips.push(`${pack.price.neFake} ${lang==='es' ? 'NE Falsificadas' : 'Counterfeit NE'}`);

  if (chips.length === 0) {
    return <span className="chip" style={{opacity:.7}}>{lang==='es' ? 'Consultar' : 'Ask'}</span>;
  }
  return (
    <>
      {chips.map((c, i) => (
        <span key={i} className="chip">{c}</span>
      ))}
    </>
  );
}

export default function PackCard({
  pack,
  lang,
  resolveDonationName,
  maxPreview = 4,
}: {
  pack: Pack;
  lang: Locale;
  resolveDonationName?: ResolveDonationName;
  /** Cuántos items mostrar en la vista previa antes del toggle */
  maxPreview?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const itemsPreview = useMemo(() => {
    if (expanded) return pack.items;
    return pack.items.slice(0, maxPreview);
  }, [expanded, pack.items, maxPreview]);

  const remaining = Math.max(0, pack.items.length - itemsPreview.length);

  return (
    <article className="tile pack-card">
      {/* Cabecera */}
      <div className="tile-cta" style={{ alignItems:'flex-start', gap:12 }}>
        <div className="flex items-center gap-3">
          {pack.icon ? (
            // usa <img> para no depender de dominio en next/image
            <img
              src={pack.icon}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              className="icon-glow"
              style={{ borderRadius: 10, objectFit:'cover' }}
            />
          ) : null}
          <div>
            <h3 className="truncate">{pack.name[lang]}</h3>
            {pack.featured ? (
              <span className="chip" style={{ marginTop: 4 }}>
                {lang==='es' ? 'Destacado' : 'Featured'}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriceChips pack={pack} lang={lang} />
        </div>
      </div>

      {/* Descripción */}
      {pack.description?.[lang] && (
        <p className="text-sm" style={{ color:'var(--muted)', marginTop: 8 }}>
          {pack.description[lang]}
        </p>
      )}

      {/* Contenido del pack */}
      <div className="kicker" style={{ marginTop: 10 }}>
        {lang==='es' ? 'Contenido' : 'Contents'}
      </div>
      <ul className="list-soft space-y-1">
        {itemsPreview.map((it, idx) => {
          const label =
            resolveDonationName?.(it.donationId, lang) ??
            `${lang==='es' ? 'Ítem' : 'Item'} ${it.donationId}`;
          return (
            <li key={`${it.donationId}-${idx}`} className="flex items-center justify-between gap-3">
              <span className="truncate">{label}</span>
              {it.qty != null && <span className="chip">×{it.qty}</span>}
            </li>
          );
        })}
      </ul>

      {/* Toggle */}
      {pack.items.length > maxPreview && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs" style={{ color:'var(--muted)' }}>
            {expanded
              ? (lang==='es' ? 'Mostrando todos los ítems' : 'Showing all items')
              : (lang==='es'
                  ? (remaining === 1 ? '1 ítem más' : `${remaining} ítems más`)
                  : (remaining === 1 ? '1 more item' : `${remaining} more items`))}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            aria-controls={`pack-items-${pack.id}`}
          >
            {expanded ? (lang==='es' ? 'Ver menos' : 'Show less') : (lang==='es' ? 'Ver todo' : 'Show all')}
          </button>
        </div>
      )}
    </article>
  );
}
