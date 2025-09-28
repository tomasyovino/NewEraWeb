import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbListWeekly, dbCreateWeekly } from '@/db/sqlite';
import { weeklyEventListSchema } from '@/lib/schemas';
import { weeklyEventsCreateSchema } from '@/app/api/_utils/weeklyEventSchemas';

export async function GET(req: NextRequest) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;
    try {
        const list = dbListWeekly();
        const data = weeklyEventListSchema.parse(list);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;
    try {
        const payload = await req.json();
        const input = weeklyEventsCreateSchema.parse(payload);
        const created = dbCreateWeekly(input);
        return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
        const msg = err?.issues ?? err?.message;
        return NextResponse.json({ error: msg ?? 'Invalid payload' }, { status: 400 });
    }
}
