import Link from 'next/link';
import { getAllPublishedNewsPage } from '@/lib/data-source';
import type { Locale } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function NewsIndex({
    params, searchParams,
}: {
    params: { lang: string },
    searchParams: { page?: string }
}) {
    const lang = (params.lang === 'en' ? 'en' : 'es') as Locale;
    const page = Number(searchParams.page ?? '1') || 1;
    const limit = 8;

    const { items, pages } = await getAllPublishedNewsPage(page, limit);

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: 900 }}>
                <div className="tile">
                    <div className="kicker">{lang === 'es' ? 'Novedades' : 'News'}</div>
                    <h1 className="section-title">{lang === 'es' ? 'Actualizaciones & anuncios' : 'Updates & announcements'}</h1>
                </div>

                <div className="grid gap-4 mt-4">
                    {items.map(n => (
                        <article key={n.id} className="tile hover:brightness-105">
                            {/* Header */}
                            <div className="tile-cta">
                                <div>
                                    <div className="kicker" style={{ color: 'var(--muted)' }}>
                                        {new Date(n.publishedAt ?? n.createdAt).toLocaleDateString()}
                                    </div>
                                    <h2 style={{ fontSize: 22, lineHeight: 1.2 }}>{n.title[lang]}</h2>
                                </div>
                                <Link className="btn btn-ghost" href={`/${lang}/news/${n.slug}`}>
                                    {lang === 'es' ? 'Leer' : 'Read'}
                                </Link>
                            </div>

                            {/* Cover */}
                            {n.cover && (
                                <div className="rounded overflow-hidden border border-[var(--stroke)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={n.cover} alt={n.title[lang]} style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}

                            {/* Excerpt */}
                            {n.excerpt?.[lang] && (
                                <p className="mt-2" style={{ color: 'var(--muted)' }}>
                                    {n.excerpt[lang]}
                                </p>
                            )}

                            {/* Tags */}
                            {!!n.tags?.length && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {n.tags.map(t => <span key={t} className="chip">#{t}</span>)}
                                </div>
                            )}
                        </article>
                    ))}
                    {items.length === 0 && (
                        <div className="note">
                            {lang === 'es' ? 'No hay novedades publicadas.' : 'No news yet.'}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => {
                            const active = p === page;
                            return (
                                <Link
                                    key={p}
                                    className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
                                    href={`/${lang}/news?page=${p}`}
                                >
                                    {p}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
