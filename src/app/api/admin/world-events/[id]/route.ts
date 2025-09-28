import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbGetWorld, dbUpdateWorld, dbRemoveWorld } from '@/db/sqlite';
import { worldEventSchema } from '@/lib/schemas';
import { worldEventsUpdateSchema } from '@/app/api/_utils/worldEventSchemas';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;
    try {
        const item = dbGetWorld(params.id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const data = worldEventSchema.parse(item);
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
        const patch = worldEventsUpdateSchema.parse(payload);
        // @ts-ignore
        const updated = dbUpdateWorld(params.id, patch);
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
        const ex = dbGetWorld(params.id);
        if (!ex) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        dbRemoveWorld(params.id);
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
