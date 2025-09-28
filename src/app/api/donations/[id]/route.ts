import { NextResponse } from 'next/server';
import { dbGetDonationItem } from '@/db/sqlite';
import { donationSchema } from '@/lib/schemas';

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const item = dbGetDonationItem(params.id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const data = donationSchema.parse(item);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
