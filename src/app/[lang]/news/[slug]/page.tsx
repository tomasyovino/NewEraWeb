import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsBySlug } from '@/lib/data-source';
import type { Locale } from '@/lib/types';

export default async function NewsDetailPage({
    params,
}: { params: { lang: string; slug: string } }) {
    const lang = (params.lang === 'en' ? 'en' : 'es') as Locale;
    const item = await getNewsBySlug(params.slug);
    if (!item) notFound();

    const fecha = item.publishedAt ? new Date(item.publishedAt).toLocaleString() : '';
    const title = item.title[lang];
    const body = item.body[lang];
    const ex = item.excerpt?.[lang];

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: 900 }}>
                <div className="tile">
                    <div className="tile-cta">
                        <div className="kicker">{fecha}</div>
                        <h1 className="section-title">{title}</h1>
                        <Link href={`/${lang}/news`} className="btn btn-ghost">
                            {lang === 'es' ? 'Volver' : 'Back'}
                        </Link>
                    </div>

                    {item.cover && (
                        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-3">
                            <Image
                                src={item.cover}
                                alt={title}
                                width={1200}
                                height={675}
                                className="w-full h-full object-cover"
                                priority
                            />
                        </div>
                    )}

                    {ex && <p className="note mb-3">{ex}</p>}

                    <article className="prose prose-invert max-w-none">
                        {body.split('\n').map((p: any, i: any) => p.trim()
                            ? <p key={i} style={{ margin: '0 0 0.9rem 0' }}>{p}</p>
                            : <br key={i} />
                        )}
                    </article>

                    {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1 mt-3 flex-wrap">
                            {item.tags.map((tag: string) => <span key={tag} className="chip">#{tag}</span>)}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
