import { getDonations } from '@/lib/data-source';
import fs from 'node:fs';
import path from 'node:path';

function loadDict(lang: string) {
  const p = path.join(process.cwd(), 'i18n', `${lang}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export default async function DonatePage({ params }: { params: { lang: string } }) {
  const dict = loadDict(params.lang || 'es');
  const items = await getDonations();
  const isEs = (params.lang || 'es') === 'es';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{dict.donate.title}</h1>
      <p className="text-subtle">{dict.donate.note}</p>
      <ul className="grid md:grid-cols-2 gap-3">
        {items.map(it => (
          <li key={it.id} className="card p-4">
            <div className="font-medium">{isEs ? it.name_es : it.name_en}</div>
            {it.description_es && (
              <p className="text-subtle text-sm mt-1">{isEs ? it.description_es : it.description_en}</p>
            )}
            <div className="mt-3 font-semibold">€ {it.price_eur.toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
