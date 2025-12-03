import { NextResponse } from 'next/server';
import { aboutListSchema } from '@/lib/schemas';

const VM_API_BASE = process.env.VM_API_BASE_URL!;
const INTERNAL_KEY = process.env.VM_INTERNAL_API_KEY!;

export async function GET() {
    try {
        const res = await fetch(`${VM_API_BASE}/about`, {
            headers: {
                'x-internal-key': INTERNAL_KEY,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Upstream error (${res.status})` },
                { status: 502 },
            );
        }
        const raw = await res.json();
        const data = aboutListSchema.parse(raw);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
