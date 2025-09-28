import { NextResponse } from 'next/server';
import { dbListWorld } from '@/db/sqlite';
import { worldEventListSchema } from '@/lib/schemas';

export async function GET() {
    try {
        const list = dbListWorld();
        const data = worldEventListSchema.parse(list);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
