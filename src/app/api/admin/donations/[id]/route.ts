import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbGetDonationItem, dbUpdateDonationItem, dbRemoveDonationItem } from '@/db/sqlite';
import { donationSchema } from '@/lib/schemas';
import { donationUpdateSchema } from '@/app/api/_utils/donationSchemas';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const item = dbGetDonationItem(params.id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const data = donationSchema.parse(item);
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
        const patch = donationUpdateSchema.parse(payload);
        const updated = dbUpdateDonationItem(params.id, patch);
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
        const existing = dbGetDonationItem(params.id);
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        dbRemoveDonationItem(params.id);
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
