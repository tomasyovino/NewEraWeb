import type { WeeklyEvent } from '@/lib/types';
import { weeklyEventSchema } from '@/lib/schemas';
import { dbListWeekly, dbGetWeekly, dbCreateWeekly, dbUpdateWeekly, dbRemoveWeekly } from '@/db/sqlite';

export function list(): WeeklyEvent[] {
  return dbListWeekly();
}
export function get(id: string): WeeklyEvent | undefined {
  return dbGetWeekly(id);
}
export function create(input: unknown): WeeklyEvent {
  const data = weeklyEventSchema.parse({ ...(input as object) });
  return dbCreateWeekly(data);
}
export function update(id: string, input: unknown): WeeklyEvent {
  const current = dbGetWeekly(id);
  if (!current) throw new Error('Not found');
  const merged = { ...current, ...(input as object), id };
  const data = weeklyEventSchema.parse(merged);
  return dbUpdateWeekly(id, data);
}
export function remove(id: string): void {
  dbRemoveWeekly(id);
}
