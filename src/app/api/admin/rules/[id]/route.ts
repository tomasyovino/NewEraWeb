import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbGetRule, dbUpdateRule, dbRemoveRule } from '@/db/sqlite';
import { ruleSchema } from '@/lib/schemas';
import { ruleUpdateSchema } from '@/app/api/_utils/ruleSchemas';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const item = dbGetRule(params.id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const data = ruleSchema.parse(item);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const payload = await req.json();
        const patch = ruleUpdateSchema.parse(payload);
        const updated = dbUpdateRule(params.id, patch);
        return NextResponse.json(updated);
    } catch (err: any) {
        const msg = err?.issues ?? err?.message;
        return NextResponse.json({ error: msg ?? 'Invalid payload' }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const existing = dbGetRule(params.id);
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        dbRemoveRule(params.id);
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
