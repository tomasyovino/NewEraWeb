import { NextResponse } from 'next/server';
import { dbGetWeekly } from '@/db/sqlite';
import { weeklyEventSchema } from '@/lib/schemas';

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const p = dbGetWeekly(params.id);
        if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const data = weeklyEventSchema.parse(p);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
