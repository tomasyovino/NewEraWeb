import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/api/_utils/adminAuth';
import { worldEventSchema } from '@/lib/schemas';
import { worldEventsUpdateSchema } from '@/app/api/_utils/worldEventSchemas';

const VM_API_BASE = process.env.VM_API_BASE_URL!;
const INTERNAL_KEY = process.env.VM_INTERNAL_API_KEY!;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const res = await fetch(
            `${VM_API_BASE}/admin/world-events/${encodeURIComponent(params.id)}`,
            {
                headers: {
                    'x-internal-key': INTERNAL_KEY,
                },
                cache: 'no-store',
            },
        );

        if (res.status === 404) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (!res.ok) {
            return NextResponse.json(
                { error: `Upstream error (${res.status})` },
                { status: 502 },
            );
        }

        const raw = await res.json();
        const data = worldEventSchema.parse(raw);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    let patch: unknown;

    try {
        const payload = await req.json();
        patch = worldEventsUpdateSchema.parse(payload);
    } catch (err: any) {
        const msg = err?.issues ?? err?.message;
        return NextResponse.json({ error: msg ?? 'Invalid payload' }, { status: 400 });
    }

    try {
        const res = await fetch(
            `${VM_API_BASE}/admin/world-events/${encodeURIComponent(params.id)}`,
            {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json',
                    'x-internal-key': INTERNAL_KEY,
                },
                body: JSON.stringify(patch),
            },
        );

        if (res.status === 404) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Upstream error' },
            { status: 502 },
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const guard = requireAdminAuth(req);
    if (guard) return guard;

    try {
        const res = await fetch(
            `${VM_API_BASE}/admin/world-events/${encodeURIComponent(params.id)}`,
            {
                method: 'DELETE',
                headers: {
                    'x-internal-key': INTERNAL_KEY,
                },
            },
        );

        if (res.status === 404) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (!res.ok) {
            return NextResponse.json(
                { error: `Upstream error (${res.status})` },
                { status: 502 },
            );
        }

        const data = await res.json().catch(() => ({ ok: true }));
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
    }
}
