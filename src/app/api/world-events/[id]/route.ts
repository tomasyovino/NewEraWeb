import { NextResponse } from 'next/server';
import { dbGetWorld } from '@/db/sqlite';
import { worldEventSchema } from '@/lib/schemas';

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const p = dbGetWorld(params.id);
        if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const data = worldEventSchema.parse(p);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
