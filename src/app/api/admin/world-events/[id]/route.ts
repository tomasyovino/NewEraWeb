import { NextResponse } from 'next/server';
import { get, update, remove } from '../store';

export async function GET(_: Request, { params }: { params: { id: string }}) {
  const ev = get(params.id);
  if (!ev) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(ev);
}

export async function PUT(req: Request, { params }: { params: { id: string }}) {
  const body = await req.json().catch(() => ({}));
  try {
    const ev = update(params.id, body);
    return NextResponse.json(ev);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Invalid' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  try {
    remove(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Invalid' }, { status: 400 });
  }
}
