import { getAllPublishedNews } from '@/lib/data-source';
import type { Locale } from '@/lib/types';
import NewsTeaser from '@/components/NewsTeaser';
import { Reveal } from '@/components';

export default async function NewsListPage({ params }: { params: { lang: string } }) {
    const lang = (params.lang === 'en' ? 'en' : 'es') as Locale;
    const items = await getAllPublishedNews();

    return (
        <section className="section">
            <div className="container">
                <Reveal><h1 className="section-title">{lang === 'es' ? 'Novedades' : 'News'}</h1></Reveal>
                {!items.length ? (
                    <Reveal className="mt-3">
                        <div className="note">{lang === 'es' ? 'No hay publicaciones aún.' : 'No posts yet.'}</div>
                    </Reveal>
                ) : (
                    <Reveal className="mt-4">
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {items.map(n => <NewsTeaser key={n.id} n={n} lang={lang} />)}
                        </div>
                    </Reveal>
                )}
            </div>
        </section>
    );
}
