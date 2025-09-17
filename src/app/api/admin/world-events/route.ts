import { NextResponse } from 'next/server';
import { dbListWorld } from '@/db/sqlite';
import { worldEventListSchema } from '@/lib/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get('scope'); // 'public' | null
  const limitParam = url.searchParams.get('limit');
  const fromParam = url.searchParams.get('from'); // 'now' | ISO
  const limit = Number.isFinite(Number(limitParam)) ? Math.max(1, Number(limitParam)) : undefined;

  const all = dbListWorld();

  // Admin (default) ⇒ devuelve TODO
  if (scope !== 'public') {
    return NextResponse.json(worldEventListSchema.parse(all));
  }

  // Público ⇒ solo ACTIVO o PRÓXIMO, desde "from" (default: now), máx N (default: 6)
  const base = (fromParam === 'now' || !fromParam) ? new Date() : new Date(fromParam);
  const baseMs = isNaN(base.getTime()) ? Date.now() : base.getTime();

  const filtered = all.filter(ev => {
    const s = Date.parse(ev.startsAt);
    const e = Date.parse(ev.endsAt);
    // activo (base entre s..e) o futuro (s > base)
    return (baseMs >= s && baseMs <= e) || (s > baseMs);
  }).sort((a, b) => {
    // orden: activos primero por fin más cercano; luego próximos por inicio más cercano
    const now = baseMs;
    const aStart = Date.parse(a.startsAt), aEnd = Date.parse(a.endsAt);
    const bStart = Date.parse(b.startsAt), bEnd = Date.parse(b.endsAt);
    const aActive = now >= aStart && now <= aEnd;
    const bActive = now >= bStart && now <= bEnd;

    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    if (aActive && bActive) return aEnd - bEnd;
    return aStart - bStart;
  });

  const limited = typeof limit === 'number' ? filtered.slice(0, limit) : filtered.slice(0, 6);

  return NextResponse.json(worldEventListSchema.parse(limited));
}
