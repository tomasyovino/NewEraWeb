import { NextResponse } from 'next/server';
import { dbListPacks } from '@/db/sqlite';
import { packListSchema } from '@/lib/schemas';

export async function GET() {
    try {
        const list = dbListPacks();
        const data = packListSchema.parse(list);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
