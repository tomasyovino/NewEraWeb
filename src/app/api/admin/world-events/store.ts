import type { WorldEvent } from '@/lib/types';
import { worldEventSchema } from '@/lib/schemas';
import { dbListWorld, dbGetWorld, dbCreateWorld, dbUpdateWorld, dbRemoveWorld } from '@/db/sqlite';

export function list(): WorldEvent[] { return dbListWorld(); }
export function get(id: string): WorldEvent | undefined { return dbGetWorld(id); }
export function create(input: unknown): WorldEvent {
  const data = worldEventSchema.parse({ ...(input as object) });
  return dbCreateWorld(data);
}
export function update(id: string, input: unknown): WorldEvent {
  const current = dbGetWorld(id);
  if (!current) throw new Error('Not found');
  const merged = { ...current, ...(input as object), id };
  const data = worldEventSchema.parse(merged);
  return dbUpdateWorld(id, data);
}
export function remove(id: string): void { dbRemoveWorld(id); }
