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
  const lang = (params.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  return (
    <div className="space-y-4">
      
    </div>
  );
}
