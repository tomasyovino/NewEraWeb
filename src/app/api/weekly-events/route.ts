import { NextResponse } from 'next/server';
import { dbListWeekly } from '@/db/sqlite';
import { weeklyEventListSchema } from '@/lib/schemas';

export async function GET() {
    try {
        const list = dbListWeekly();
        const data = weeklyEventListSchema.parse(list);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
