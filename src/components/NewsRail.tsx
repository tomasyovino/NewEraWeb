'use client';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale, New } from '@/lib/types';

export default function NewsRail({ items, lang }: { items: New[]; lang: Locale }) {
    if (!items.length) return null;

    return (
        <aside
            className="tile"
            style={{
                position: 'sticky',
                top: 24,
                alignSelf: 'start',
                boxShadow: '0 10px 24px rgba(0,0,0,.25)',
                border: '1px solid var(--stroke)',
            }}
        >
            <div className="tile-cta">
                <div>
                    <div className="kicker">{lang === 'es' ? 'Novedades' : 'News'}</div>
                    <h3 style={{ fontSize: 20, lineHeight: 1.2, fontWeight: 700 }}>
                        {lang === 'es' ? 'Lo último del servidor' : 'Latest updates'}
                    </h3>
                </div>
                <Link className="btn btn-ghost" href={`/${lang}/news`}>{lang === 'es' ? 'Ver todo' : 'See all'}</Link>
            </div>

            <div className="grid gap-3">
                {items.map(n => (
                    <Link key={n.id} href={`/${lang}/news/${n.slug}`} className="list-soft hover:brightness-110">
                        <div className="flex gap-3 p-2">
                            {n.cover && (
                                <Image
                                    src={n.cover}
                                    alt={n.title[lang]}
                                    width={72}
                                    height={72}
                                    className="rounded object-cover"
                                    style={{ flex: '0 0 72px' }}
                                />
                            )}
                            <div className="flex-1">
                                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                                    {new Date(n.publishedAt ?? n.createdAt).toLocaleDateString()}
                                </div>
                                <div className="line-clamp-2 font-semibold">{n.title[lang]}</div>
                                {n.excerpt?.[lang] && (
                                    <div className="text-sm line-clamp-2" style={{ color: 'var(--muted)' }}>
                                        {n.excerpt[lang]}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </aside>
    );
}
