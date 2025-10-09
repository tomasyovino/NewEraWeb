import { NextResponse } from 'next/server';
import { dbListRules } from '@/db/sqlite';
import { ruleListSchema } from '@/lib/schemas';

export async function GET() {
    try {
        const items = dbListRules();
        const data = ruleListSchema.parse(items);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
