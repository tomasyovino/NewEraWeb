import { NextResponse } from 'next/server';
import { dbListDonationItem } from '@/db/sqlite';
import { donationListSchema } from '@/lib/schemas';

export async function GET() {
    try {
        const items = dbListDonationItem();
        const data = donationListSchema.parse(items);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
