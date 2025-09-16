import fs from 'node:fs';
import path from 'node:path';

function loadDict(lang: string) {
  const p = path.join(process.cwd(), 'i18n', `${lang}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export default function WikiPage({ params }: { params: { lang: string } }) {
  const dict = loadDict(params.lang || 'es');
  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold">{dict.wiki.title}</h1>
      <p className="text-subtle mt-2">{dict.wiki.desc}</p>
    </div>
  );
}
