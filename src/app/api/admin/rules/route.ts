import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbListAllRules, dbCreateRule } from '@/db/sqlite';
import { ruleListSchema } from '@/lib/schemas';
import { ruleCreateSchema } from '@/app/api/_utils/ruleSchemas';

export async function GET(req: NextRequest) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const list = dbListAllRules();
        const data = ruleListSchema.parse(list);
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
        const input = ruleCreateSchema.parse(payload);
        const created = dbCreateRule(input);
        return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
        const msg = err?.issues ?? err?.message;
        return NextResponse.json({ error: msg ?? 'Invalid payload' }, { status: 400 });
    }
}
