import {
  WeeklyEvent, EventSlot, Donation, ServerStatus, WorldEvent,
} from './types';
import {
  weeklyEventListSchema, donationListSchema, serverStatusSchema, worldEventListSchema,
} from './schemas';
import { DEFAULT_TZ } from './constants';
import { currentWeekday, compareTimeHHmm } from './time';
import { eventsMock, worldEventsMock, donationsMock, statusMock} from '@/mocks'

const isServer = typeof window === 'undefined';

function boolEnv(name: string, def = true) {
  const v = process.env[name];
  if (v == null) return def;
  const s = String(v).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}
const USE_MOCK = boolEnv('USE_MOCK', true);

function makeUrl(path: string) {
  if (!isServer) return path;
  const base =
    process.env.API_BASE_URL
    ?? process.env.NEXT_PUBLIC_BASE_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? 3000}`);
  return new URL(path, base).toString();
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = makeUrl(path);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

/* ================== WORLD EVENTS ================== */

// Público (Home): activos o futuros, limitado (default 6)
export async function getWorldEvents(opts?: { limit?: number; now?: Date }): Promise<WorldEvent[]> {
  const limit = opts?.limit ?? 6;
  const now = opts?.now ?? new Date();

  if (USE_MOCK) {
    const all = worldEventListSchema.parse(worldEventsMock as unknown);
    const t = now.getTime();
    return all
      .filter(ev => Date.parse(ev.endsAt) >= t)
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
      .slice(0, Math.max(0, limit));
  }

  const qs = new URLSearchParams({ scope: 'public', limit: String(limit), from: 'now' });
  const raw = await fetchJson<unknown>(`/api/admin/world-events?${qs.toString()}`);
  return worldEventListSchema.parse(raw);
}

// Admin: todo sin filtros
export async function getWorldEventsAll(): Promise<WorldEvent[]> {
  if (USE_MOCK) {
    return worldEventListSchema.parse(worldEventsMock as unknown);
  }
  const raw = await fetchJson<unknown>('/api/admin/world-events');
  return worldEventListSchema.parse(raw);
}

export async function getActiveWorldEvents(now: Date = new Date()): Promise<WorldEvent[]> {
  const all = await getWorldEvents({ now, limit: 999 });
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
  const all = await getWorldEvents({ now, limit: 999 });
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

/* ================== WEEKLY EVENTS ================== */

export async function getWeeklyEvents(): Promise<WeeklyEvent[]> {
  if (USE_MOCK) {
    return weeklyEventListSchema.parse(eventsMock as unknown);
  }
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

/* ================== DONATIONS / STATUS ================== */

export async function getDonations(): Promise<Donation[]> {
  if (USE_MOCK) {
    try {
      return donationListSchema.parse(donationsMock as unknown);
    } catch { return []; }
  }
  const raw = await fetchJson<unknown>('/api/donations');
  return donationListSchema.parse(raw);
}

export async function getStatus(): Promise<ServerStatus> {
  if (USE_MOCK) {
    try {
      return serverStatusSchema.parse(statusMock as unknown);
    } catch {
      return serverStatusSchema.parse({ online: true, players: 0, peak24h: 0, message: null });
    }
  }
  const raw = await fetchJson<unknown>('/api/status');
  return serverStatusSchema.parse(raw);
}
