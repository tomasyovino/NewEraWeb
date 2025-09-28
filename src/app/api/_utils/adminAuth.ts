import { NextRequest, NextResponse } from 'next/server';

export function requireAdminAuth(req: NextRequest): NextResponse | null {
    const user = process.env.ADMIN_USERNAME || process.env.NEXT_PUBLIC_ADMIN_USERNAME || process.env.ADMIN_USER;
    const pass = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASS;

    const okCookie = req.cookies.get('adm')?.value === '1';

    if (!user || !pass) {
        return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 });
    }

    const h = req.headers.get('authorization');
    if (!okCookie && (!h || !h.startsWith('Basic '))) {
        return NextResponse.json({ error: 'Unauthorized' }, {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="admin"' },
        });
    }

    if (!okCookie) {
        const [, b64] = h!.split(' ');
        const [u, p] = Buffer.from(b64, 'base64').toString('utf8').split(':');
        if (u !== user || p !== pass) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return null;
}
