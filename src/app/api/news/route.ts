import { NextResponse, NextRequest } from 'next/server';
import { dbListAllNews } from '@/db/sqlite';
import { newListSchema } from '@/lib/schemas';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const publishedParam = searchParams.get('published');
        const onlyPublished = publishedParam === '1' || publishedParam === 'true' || publishedParam === 'yes';
        const limit = Number(searchParams.get('limit') ?? '') || undefined;
        const slug = searchParams.get('slug')?.trim().toLowerCase() || '';
        const q = searchParams.get('q')?.trim().toLowerCase() || '';

        let items = dbListAllNews();

        if (onlyPublished) {
            items = items.filter(n => n.publishedAt && Date.now() >= Date.parse(n.publishedAt));
        }

        if (slug) {
            items = items.filter(n => n.slug.toLowerCase() === slug);
        }

        if (q) {
            items = items.filter(n => {
                const hay = [
                    n.slug,
                    n.title.es, n.title.en,
                    n.excerpt?.es ?? '', n.excerpt?.en ?? '',
                    n.body.es, n.body.en,
                    (n.tags ?? []).join(' '),
                ].join(' ').toLowerCase();
                return hay.includes(q);
            });
        }

        items.sort((a, b) => {
            const ap = a.publishedAt ? Date.parse(a.publishedAt) : 0;
            const bp = b.publishedAt ? Date.parse(b.publishedAt) : 0;
            if (bp !== ap) return bp - ap;
            const ac = Date.parse(a.createdAt);
            const bc = Date.parse(b.createdAt);
            return bc - ac;
        });

        if (limit && limit > 0) items = items.slice(0, limit);

        const data = newListSchema.parse(items);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
