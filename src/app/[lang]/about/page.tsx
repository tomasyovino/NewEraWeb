import fs from 'node:fs';
import path from 'node:path';

function loadDict(lang: string) {
  const p = path.join(process.cwd(), 'i18n', `${lang}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export default function AboutPage({ params }: { params: { lang: string } }) {
  const dict = loadDict(params.lang || 'es');
  return (
    <div className="prose prose-invert max-w-none">
      <h1>{dict.about.title}</h1>
      <p>{dict.about.p1}</p>
      <p>{dict.about.p2}</p>
    </div>
  );
}
