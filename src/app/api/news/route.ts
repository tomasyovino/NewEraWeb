import { NextResponse, NextRequest } from 'next/server';
import { newListSchema } from '@/lib/schemas';

const VM_API_BASE = process.env.VM_API_BASE_URL!;
const INTERNAL_KEY = process.env.VM_INTERNAL_API_KEY!;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const publishedParam = searchParams.get('published');
        const onlyPublished = ['1', 'true', 'yes'].includes((publishedParam ?? '').toLowerCase());
        const slug = (searchParams.get('slug') ?? '').trim().toLowerCase();
        const q = (searchParams.get('q') ?? '').trim().toLowerCase();

        const withMeta = ['1', 'true', 'yes'].includes((searchParams.get('withMeta') ?? '').toLowerCase());
        const limitParam = Number(searchParams.get('limit') ?? '');
        const pageParam = Number(searchParams.get('page') ?? '');
        const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : undefined;
        const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

        const res = await fetch(`${VM_API_BASE}/news`, {
            headers: {
                'x-internal-key': INTERNAL_KEY,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Upstream error (${res.status})` },
                { status: 502 },
            );
        }

        const raw = await res.json();
        let items = newListSchema.parse(raw);

        if (onlyPublished) {
            items = items.filter((n: any) => n.publishedAt && Date.now() >= Date.parse(n.publishedAt));
        }
        if (slug) {
            items = items.filter((n: any) => n.slug.toLowerCase() === slug);
        }
        if (q) {
            items = items.filter((n: any) => {
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

        items.sort((a: any, b: any) => {
            const ap = a.publishedAt ? Date.parse(a.publishedAt) : 0;
            const bp = b.publishedAt ? Date.parse(b.publishedAt) : 0;
            if (bp !== ap) return bp - ap;
            return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        });

        if (!withMeta) {
            const sliced = limit ? items.slice(0, limit) : items;
            const data = newListSchema.parse(sliced);
            return NextResponse.json(data);
        }

        const total = items.length;
        const effLimit = limit ?? 10;
        const pages = Math.max(1, Math.ceil(total / effLimit));
        const safePage = Math.max(1, Math.min(page, pages));
        const start = (safePage - 1) * effLimit;
        const end = start + effLimit;
        const pageItems = items.slice(start, end);

        return NextResponse.json({
            items: pageItems,
            total,
            page: safePage,
            limit: effLimit,
            pages,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
