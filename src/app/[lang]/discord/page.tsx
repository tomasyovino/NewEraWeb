import fs from 'node:fs';
import path from 'node:path';

function loadDict(lang: string) {
  const p = path.join(process.cwd(), 'i18n', `${lang}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export default function DiscordPage({ params }: { params: { lang: string } }) {
  const dict = loadDict(params.lang || 'es');
  const discordUrl = "https://discord.com/"; // replace later
  return (
    <div className="card p-6 text-center">
      <h1 className="text-xl font-semibold">{dict.discord.title}</h1>
      <a href={discordUrl} target="_blank" className="inline-block mt-4 px-4 py-2 rounded-xl bg-primary hover:opacity-90">
        {dict.discord.cta}
      </a>
      <p className="text-subtle text-sm mt-3">(Configurar URL real más adelante)</p>
    </div>
  );
}
