import Image from 'next/image';
import Link from 'next/link';
import type { Locale, New } from '@/lib/types';

export default function NewsTeaser({ n, lang }: { n: New; lang: Locale }) {
    const t = n.title[lang];
    const ex = n.excerpt?.[lang];
    const fecha = n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : '';
    return (
        <Link href={`/${lang}/news/${n.slug}`} className="tile hover:brightness-105">
            {n.cover && (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-2">
                    <Image
                        src={n.cover}
                        alt={t}
                        width={960}
                        height={540}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <div className="kicker">{fecha}</div>
            <h3 className="line-clamp-2">{t}</h3>
            {ex && <p className="mt-1 note line-clamp-2">{ex}</p>}
            {n.tags && n.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                    {n.tags.map(tag => <span key={tag} className="chip">#{tag}</span>)}
                </div>
            )}
        </Link>
    );
}
