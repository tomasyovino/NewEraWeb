import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const { username, password } = body;

  const U = process.env.ADMIN_USERNAME ?? 'admin';
  const P = process.env.ADMIN_PASSWORD ?? 'admin123';

  if (username === U && password === P) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_session', 'ok', {
      path: '/admin',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8hs
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
}
