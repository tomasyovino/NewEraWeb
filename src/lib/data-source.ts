import { WeeklyEvent, EventSlot, Donation, ServerStatus } from './types';
import { weeklyEventListSchema, donationListSchema, serverStatusSchema } from './schemas';
import { DEFAULT_TZ, } from './constants';
import { currentWeekday, compareTimeHHmm } from './time';

const USE_MOCK = process.env.USE_MOCK === 'true' || process.env.USE_MOCK === undefined;
const API_BASE_URL = process.env.API_BASE_URL || '';

// fetcher básico
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Eventos ────────────────────────────────────────────────────────────────
export async function getWeeklyEvents(): Promise<WeeklyEvent[]> {
  if (USE_MOCK) {
    const raw = (await import('../mocks/events.json')).default;
    return weeklyEventListSchema.parse(raw);
  }
  const raw = await fetchJson<unknown>('/events');
  return weeklyEventListSchema.parse(raw);
}

// Eventos del día (aplana cada time ⇒ EventSlot)
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
  return slots.sort((a,b) => compareTimeHHmm(a.time, b.time));
}

// Agenda semanal “aplanada” (útil para una grilla)
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
  return out.sort((a,b) => (a.dayOfWeek - b.dayOfWeek) || compareTimeHHmm(a.time, b.time));
}

// ── Donaciones ─────────────────────────────────────────────────────────────
export async function getDonations(): Promise<Donation[]> {
  if (USE_MOCK) {
    const raw = (await import('../mocks/donations.json')).default;
    return donationListSchema.parse(raw);
  }
  const raw = await fetchJson<unknown>('/donations');
  return donationListSchema.parse(raw);
}

// ── Estado del servidor ────────────────────────────────────────────────────
export async function getStatus(): Promise<ServerStatus> {
  if (USE_MOCK) {
    const raw = (await import('../mocks/status.json')).default;
    return serverStatusSchema.parse(raw);
  }
  const raw = await fetchJson<unknown>('/status');
  return serverStatusSchema.parse(raw);
}
