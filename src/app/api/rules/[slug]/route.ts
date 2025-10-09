import { NextResponse } from 'next/server';
import { dbGetRuleBySlug } from '@/db/sqlite';
import { ruleSchema } from '@/lib/schemas';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
    try {
        const item = dbGetRuleBySlug(params.slug);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const data = ruleSchema.parse(item);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
