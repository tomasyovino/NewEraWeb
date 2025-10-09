import { getAbout } from '@/lib/data-source';
import { renderMarkdown } from '@/lib/markdown';
import type { Locale } from '@/lib/types';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AboutPage({ params }: { params: { lang: string } }) {
    const lang = (params.lang === 'en' ? 'en' : 'es') as Locale;

    const entries = await getAbout();
    const rendered = await Promise.all(
        entries.map(async (m) => ({
            ...m,
            html: await renderMarkdown(m.body[lang] || ''),
        }))
    );

    const lastUpdated =
        rendered.length > 0
            ? new Date(
                Math.max(...rendered.map(e => Date.parse(e.updatedAt || e.createdAt)))
            )
            : null;

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: 900 }}>
                <article className="tile">
                    <div className="kicker" style={{ color: 'var(--muted)' }}>
                        {lang === 'es' ? 'Quiénes somos' : 'Who we are'}
                    </div>
                    <h1 className="section-title">
                        {lang === 'es' ? 'Equipo & colaboradores' : 'Team & contributors'}
                    </h1>

                    {lastUpdated && (
                        <div className="note" style={{ marginTop: 8 }}>
                            {lang === 'es' ? 'Última actualización:' : 'Last updated:'}{' '}
                            {lastUpdated.toLocaleDateString()}
                        </div>
                    )}
                </article>

                {/* Lista */}
                <div className="grid gap-4 mt-4">
                    {rendered.map((m) => (
                        <section key={m.id} className="tile">
                            {/* Encabezado compacto con avatar */}
                            <div className="tile-cta">
                                <div className="flex items-center gap-3">
                                    {m.avatar ? (
                                        <Image
                                            src={m.avatar}
                                            alt={m.title[lang]}
                                            width={64}
                                            height={64}
                                            className="rounded object-cover"
                                        />
                                    ) : (
                                        <div
                                            aria-hidden
                                            style={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: 12,
                                                background: 'var(--surface-2)',
                                                border: '1px solid var(--stroke)',
                                            }}
                                        />
                                    )}
                                    <div>
                                        <h2 style={{ fontSize: 20, lineHeight: 1.2 }}>{m.title[lang]}</h2>
                                        {m.role && (
                                            <div style={{ color: 'var(--muted)' }}>{m.role}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Tags si hay */}
                                {!!m.tags?.length && (
                                    <div className="flex gap-2 flex-wrap">
                                        {m.tags.map(t => (
                                            <span key={t} className="chip">#{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cuerpo (markdown → html) */}
                            <div className="prose-md mt-3">
                                <div dangerouslySetInnerHTML={{ __html: m.html }} />
                            </div>
                        </section>
                    ))}

                    {rendered.length === 0 && (
                        <div className="note">
                            {lang === 'es'
                                ? 'Pronto presentaremos al equipo.'
                                : 'Team information coming soon.'}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
