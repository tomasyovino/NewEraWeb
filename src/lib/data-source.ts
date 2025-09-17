// src/lib/data-source.ts
import { WeeklyEvent, EventSlot, Donation, ServerStatus, WorldEvent } from './types';
import { weeklyEventListSchema, donationListSchema, serverStatusSchema, worldEventListSchema } from './schemas';
import { DEFAULT_TZ } from './constants';
import { currentWeekday, compareTimeHHmm } from './time';

const isServer = typeof window === 'undefined';

function makeUrl(path: string) {
  if (!isServer) return path; // en cliente, fetch relativo está OK
  // Base para SSR: env primero; si no, dev local
  const base =
    process.env.NEXT_PUBLIC_BASE_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? 3000}`);
  return new URL(path, base).toString();
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = makeUrl(path);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Eventos de mundo ──────────────────────────────────────────────────────
export async function getWorldEvents(): Promise<WorldEvent[]> {
  const raw = await fetchJson<unknown>('/api/admin/world-events?scope=public&limit=6&from=now');
  return worldEventListSchema.parse(raw);
}
export async function getActiveWorldEvents(now: Date = new Date()): Promise<WorldEvent[]> {
  const all = await getWorldEvents();
  return all
    .filter(ev => {
      const s = Date.parse(ev.startsAt);
      const e = Date.parse(ev.endsAt);
      const t = now.getTime();
      return t >= s && t <= e;
    })
    .sort((a, b) => Date.parse(a.endsAt) - Date.parse(b.endsAt));
}
export async function getUpcomingWorldEvents(limit?: number, now: Date = new Date()): Promise<WorldEvent[]> {
  const all = await getWorldEvents();
  const up = all
    .filter(ev => Date.parse(ev.startsAt) > now.getTime())
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  return typeof limit === 'number' ? up.slice(0, Math.max(0, limit)) : up;
}
export async function getFeaturedWorldEvent(now: Date = new Date()): Promise<WorldEvent | undefined> {
  const active = await getActiveWorldEvents(now);
  const featActive = active.find(e => e.featured);
  if (featActive) return featActive;
  const upcoming = await getUpcomingWorldEvents(5, now);
  return upcoming.find(e => e.featured) ?? upcoming[0];
}

// ── Eventos semanales ─────────────────────────────────────────────────────
export async function getWeeklyEvents(): Promise<WeeklyEvent[]> {
  const raw = await fetchJson<unknown>('/api/admin/weekly-events');
  return weeklyEventListSchema.parse(raw);
}

export async function getTodayEventSlots(tz = DEFAULT_TZ): Promise<EventSlot[]> {
  const all = await getWeeklyEvents();
  const today = currentWeekday(tz);
  const slots: EventSlot[] = [];
  for (const ev of all) {
    if (ev.dayOfWeek !== today) continue;
    for (const t of ev.times) {
      slots.push({
        id: ev.id,
        name: ev.name,
        description: ev.description,
        dayOfWeek: ev.dayOfWeek,
        time: t,
        durationMinutes: ev.durationMinutes,
        featured: ev.featured,
        icon: ev.icon,
      });
    }
  }
  return slots.sort((a, b) => compareTimeHHmm(a.time, b.time));
}

export async function getWeeklyAgendaSlots(): Promise<EventSlot[]> {
  const all = await getWeeklyEvents();
  const out: EventSlot[] = [];
  for (const ev of all) {
    for (const t of ev.times) {
      out.push({
        id: ev.id,
        name: ev.name,
        description: ev.description,
        dayOfWeek: ev.dayOfWeek,
        time: t,
        durationMinutes: ev.durationMinutes,
        featured: ev.featured,
        icon: ev.icon,
      });
    }
  }
  return out.sort((a, b) => (a.dayOfWeek - b.dayOfWeek) || compareTimeHHmm(a.time, b.time));
}

// ── Donaciones / Estado (cuando los conectes) ─────────────────────────────
export async function getDonations(): Promise<Donation[]> {
  const raw = await fetchJson<unknown>('/api/donations');   // crea la ruta cuando toque
  return donationListSchema.parse(raw);
}
export async function getStatus(): Promise<ServerStatus> {
  const raw = await fetchJson<unknown>('/api/status');      // crea la ruta cuando toque
  return serverStatusSchema.parse(raw);
}
