import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbListPacks, dbCreatePack } from '@/db/sqlite';
import { packListSchema } from '@/lib/schemas';
import { packCreateSchema } from '@/app/api/_utils/packSchemas';

export async function GET(req: NextRequest) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;
    try {
        const list = dbListPacks();
        const data = packListSchema.parse(list);
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
        const input = packCreateSchema.parse(payload);
        const created = dbCreatePack(input);
        return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
        const msg = err?.issues ?? err?.message;
        return NextResponse.json({ error: msg ?? 'Invalid payload' }, { status: 400 });
    }
}
