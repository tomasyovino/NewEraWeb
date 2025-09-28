// src/lib/donations.ts
import type { Donation, DonationCategory, DonationPack, Locale } from '@/lib/types';

export const CATEGORY_ORDER: DonationCategory[] = [
  'currency_ne', 'currency_ne_fake', 'stat_boost', 'mount',
  'land_house', 'land_mine'
];

export const CATEGORY_LABELS: Record<DonationCategory, { es: string; en: string }> = {
  currency_ne:       { es: 'Monedas New Era',           en: 'NE Coins' },
  currency_ne_fake:  { es: 'Monedas Falsificadas NE',   en: 'Counterfeit NE' },
  stat_boost:        { es: 'Subida de Stats',           en: 'Stat Boosts' },
  mount:             { es: 'Monturas',                  en: 'Mounts' },
  land_house:        { es: 'Terrenos • Casas',          en: 'Land • Houses' },
  land_mine:         { es: 'Terrenos • Minas',          en: 'Land • Mines' },
};

export function groupByCategory(items: Donation[]) {
  const map = new Map<DonationCategory, Donation[]>();
  for (const it of items) {
    const cat = it.category ?? 'other';
    const arr = map.get(cat) ?? [];
    arr.push(it);
    map.set(cat, arr);
  }
  return map;
}

export function pickFeatured(donations: Donation[], packs: DonationPack[]) {
  // primero pack destacado; si no hay, donación destacada; si no, el primero de la lista
  const featPack = packs.find(p => p.featured) ?? packs[0];
  const featItem = donations.find(d => d.featured) ?? donations[0];
  return featPack ?? featItem ?? null;
}

export function priceLabel(
  p: { eur?: number; ne?: number; neFake?: number },
  lang: Locale
) {
  const main = p.eur ? `€ ${p.eur.toFixed(2)}` : null;
  const extra: string[] = [];
  if (p.ne != null)    extra.push(`${p.ne} NE`);
  if (p.neFake != null) extra.push(`${p.neFake} NE*`);
  return { main, extra };
}
