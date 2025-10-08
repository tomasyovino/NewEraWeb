import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbListAllNews, dbCreateNew } from '@/db/sqlite';
import { newListSchema } from '@/lib/schemas';
import { newCreateSchema } from '../../_utils/newSchemas';

export async function GET(req: NextRequest) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const list = dbListAllNews();
        const data = newListSchema.parse(list);
        return NextResponse.json(data);
    } catch (err: any) {
        console.log(err?.message)
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const payload = await req.json();
        const input = newCreateSchema.parse(payload);
        const created = dbCreateNew(input);
        return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
        const msg = err?.issues ? err.issues : err?.message;
        return NextResponse.json({ error: msg ?? 'Invalid payload' }, { status: 400 });
    }
}
