import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbGetPack, dbUpdatePack, dbRemovePack } from '@/db/sqlite';
import { packSchema } from '@/lib/schemas';
import { packUpdateSchema } from '@/app/api/_utils/packSchemas';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;
    try {
        const item = dbGetPack(params.id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const data = packSchema.parse(item);
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
        const patch = packUpdateSchema.parse(payload);
        const updated = dbUpdatePack(params.id, patch);
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
        const ex = dbGetPack(params.id);
        if (!ex) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        dbRemovePack(params.id);
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
