import {
  WeeklyEvent, EventSlot, WorldEvent,
  Pack,
  New,
} from './types';
import {
  weeklyEventListSchema, donationListSchema, worldEventListSchema,
  packListSchema,
  newListSchema,
} from './schemas';
import { DEFAULT_TZ } from './constants';
import { currentWeekday, compareTimeHHmm } from './time';
import { eventsMock, worldEventsMock, donationsMock, packsMock, newsMock } from '@/mocks'
import { boolEnv } from '@/helpers/dbHelpers';

const isServer = typeof window === 'undefined';
const USE_MOCK = boolEnv('USE_MOCK', false);

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

  const raw = await fetchJson<unknown>(`/api/world-events`);
  return worldEventListSchema.parse(raw);
}

/* ================== WEEKLY EVENTS ================== */

export async function getWeeklyEvents(): Promise<WeeklyEvent[]> {
  if (USE_MOCK) {
    return weeklyEventListSchema.parse(eventsMock as unknown);
  }
  const raw = await fetchJson<unknown>('/api/weekly-events');
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

export async function getDonations() {
  if (USE_MOCK) {
    return donationListSchema.parse(donationsMock as unknown);
  }
  const raw = await fetchJson<unknown>('/api/donations');
  return donationListSchema.parse(raw);
}

export async function getPacks(): Promise<Pack[]> {
  if (USE_MOCK) {
    return packListSchema.parse(packsMock as unknown);
  }
  return packListSchema.parse(await fetchJson<unknown>('/api/packs'));
}

/* ================== NEWS ================== */
export async function getLatestNews(limit = 3): Promise<New[]> {
  if (USE_MOCK) {
    const all = newListSchema.parse(newsMock as unknown);
    const pub = all
      .filter(n => n.publishedAt && Date.now() >= Date.parse(n.publishedAt))
      .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!));
    return pub.slice(0, limit);
  }
  const raw = await fetchJson<unknown>(`/api/news?published=1&limit=${limit}`);
  return newListSchema.parse(raw);
}

export async function getAllPublishedNews(): Promise<New[]> {
  if (USE_MOCK) {
    const all = newListSchema.parse(newsMock as unknown);
    return all
      .filter(n => n.publishedAt && Date.now() >= Date.parse(n.publishedAt))
      .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!));
  }
  const raw = await fetchJson<unknown>(`/api/news?published=1`);
  return newListSchema.parse(raw);
}

export async function getNewsBySlug(slug: string): Promise<New | null> {
  if (USE_MOCK) {
    const all = newListSchema.parse(newsMock as unknown);
    const item = all.find(
      n => n.slug === slug && n.publishedAt && Date.now() >= Date.parse(n.publishedAt)
    );
    return item ?? null;
  }
  const raw = await fetchJson<unknown>(`/api/news?published=1&limit=1&slug=${encodeURIComponent(slug)}`);
  const arr = newListSchema.parse(raw);
  return arr[0] ?? null;
}