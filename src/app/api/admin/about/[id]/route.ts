import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbGetAbout, dbUpdateAbout, dbRemoveAbout } from '@/db/sqlite';
import { aboutSchema } from '@/lib/schemas';
import { aboutUpdateSchema } from '@/app/api/_utils/aboutSchemas';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const item = dbGetAbout(params.id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const data = aboutSchema.parse(item);
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
        const patch = aboutUpdateSchema.parse(payload);
        const updated = dbUpdateAbout(params.id, patch);
        return NextResponse.json(updated);
    } catch (err: any) {
        const msg = err?.issues ? err.issues : err?.message;
        return NextResponse.json({ error: msg ?? 'Invalid payload' }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const existing = dbGetAbout(params.id);
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        dbRemoveAbout(params.id);
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
