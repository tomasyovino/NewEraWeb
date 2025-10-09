import { NextResponse } from 'next/server';
import { dbListAboutPublic } from '@/db/sqlite';
import { aboutListSchema } from '@/lib/schemas';

export async function GET() {
    try {
        const items = dbListAboutPublic();
        const data = aboutListSchema.parse(items);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
