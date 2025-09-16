import { WeeklyEvent, Donation } from './types';

const USE_MOCK = process.env.USE_MOCK === 'true' || process.env.USE_MOCK === undefined;
const API_BASE_URL = process.env.API_BASE_URL || '';

// Helper to fetch JSON safely
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getWeeklyEvents(): Promise<WeeklyEvent[]> {
  if (USE_MOCK) {
    const data = (await import('../mocks/events.json')).default as WeeklyEvent[];
    return data;
  }
  return fetchJson<WeeklyEvent[]>('/events');
}

export async function getDonations(): Promise<Donation[]> {
  if (USE_MOCK) {
    const data = (await import('../mocks/donations.json')).default as Donation[];
    return data;
  }
  return fetchJson<Donation[]>('/donations');
}
