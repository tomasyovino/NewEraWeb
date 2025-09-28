import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { dbListDonationsAll, dbCreateDonationItem } from '@/db/sqlite';
import { donationListSchema } from '@/lib/schemas';
import { donationCreateSchema } from '@/app/api/_utils/donationSchemas';

export async function GET(req: NextRequest) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const list = dbListDonationsAll();
        const data = donationListSchema.parse(list);
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
        const input = donationCreateSchema.parse(payload);
        const created = dbCreateDonationItem(input);
        return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
        const msg = err?.issues ? err.issues : err?.message;
        return NextResponse.json({ error: msg ?? 'Invalid payload' }, { status: 400 });
    }
}
