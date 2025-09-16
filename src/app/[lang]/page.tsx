import { getWeeklyEvents } from '@/lib/data-source';
import { todayWeekday } from '@/lib/time';
import fs from 'node:fs';
import path from 'node:path';

function loadDict(lang: string) {
  const p = path.join(process.cwd(), 'i18n', `${lang}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export default async function Page({ params }: { params: { lang: string } }) {
  const dict = loadDict(params.lang || 'es');
  const events = await getWeeklyEvents();
  const today = todayWeekday(process.env.TZ || 'Europe/Madrid');

  const todays = events.filter(e => e.dayOfWeek === today);
  const weekly = events.sort((a,b)=> (a.dayOfWeek - b.dayOfWeek) || a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-[url('/images/background.png')] bg-cover bg-center ring-1 ring-surface/50">
        <h1 className="text-2xl md:text-3xl font-bold drop-shadow">{dict.home.title}</h1>
        <p className="text-subtle mt-1">{dict.home.subtitle}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{dict.home.todayEvents}</h2>
        {todays.length === 0 ? (
          <p className="text-subtle">{dict.home.noEventsToday}</p>
        ) : (
          <ul className="grid md:grid-cols-2 gap-3">
            {todays.map(ev => (
              <li key={ev.id} className="card p-4">
                <div className="font-medium">{params.lang === 'es' ? ev.name_es : ev.name_en}</div>
                <div className="text-subtle text-sm">{ev.time}</div>
                {ev.description_es && (
                  <p className="mt-2 text-sm text-subtle">
                    {params.lang === 'es' ? ev.description_es : ev.description_en}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{dict.home.weeklySchedule}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {weekly.map(ev => (
            <div key={ev.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{params.lang === 'es' ? ev.name_es : ev.name_en}</div>
                <p className="text-subtle text-sm">
                  {weekdayName(ev.dayOfWeek, params.lang)} · {ev.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function weekdayName(d: number, lang: string) {
  const es = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const en = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const arr = lang === 'es' ? es : en;
  return arr[d] || '';
}
