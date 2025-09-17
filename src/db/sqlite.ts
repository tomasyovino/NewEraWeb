import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { LocalizedString, WeeklyEvent, WorldEvent } from '@/lib/types';

// Ruta del archivo SQLite
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = process.env.SQLITE_PATH || path.join(DATA_DIR, 'app.db');

// Asegurar carpeta
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Abrir DB
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Crear tablas si no existen
db.exec(`
CREATE TABLE IF NOT EXISTS weekly_events (
  id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_es TEXT,
  desc_en TEXT,
  day_of_week INTEGER NOT NULL,
  times_json TEXT NOT NULL,            -- JSON string[] "HH:mm"
  duration_minutes INTEGER,
  featured INTEGER NOT NULL DEFAULT 0, -- 0/1
  icon TEXT
);

CREATE TABLE IF NOT EXISTS world_events (
  id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_es TEXT,
  desc_en TEXT,
  headline_es TEXT,
  headline_en TEXT,
  location_es TEXT,
  location_en TEXT,
  starts_at TEXT NOT NULL,  -- ISO8601
  ends_at TEXT NOT NULL,    -- ISO8601
  featured INTEGER NOT NULL DEFAULT 0,
  banner TEXT,
  highlights_json TEXT,     -- JSON LocalizedString[]
  rewards_json TEXT,        -- JSON LocalizedString[]
  warnings_json TEXT        -- JSON LocalizedString[]
);
`);

// Utils
const boolToInt = (b: boolean | undefined) => (b ? 1 : 0);
const intToBool = (n: number) => n === 1;

function ls(es?: string|null, en?: string|null): LocalizedString {
  return { es: es ?? '', en: en ?? '' };
}

function parseJsonArray<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

// ---------- Seed si vacío ----------
function tableEmpty(name: string): boolean {
  const row = db.prepare(`SELECT COUNT(*) as c FROM ${name}`).get() as { c: number };
  return row.c === 0;
}

function seedWeekly() {
  const mock = require('@/mocks/events.json') as WeeklyEvent[];
  const stmt = db.prepare(`
    INSERT INTO weekly_events
    (id, name_es, name_en, desc_es, desc_en, day_of_week, times_json, duration_minutes, featured, icon)
    VALUES (@id, @name_es, @name_en, @desc_es, @desc_en, @day_of_week, @times_json, @duration_minutes, @featured, @icon)
  `);
  const trx = db.transaction((rows: WeeklyEvent[]) => {
    for (const ev of rows) {
      stmt.run({
        id: ev.id,
        name_es: ev.name.es,
        name_en: ev.name.en,
        desc_es: ev.description?.es ?? null,
        desc_en: ev.description?.en ?? null,
        day_of_week: ev.dayOfWeek,
        times_json: JSON.stringify(ev.times ?? []),
        duration_minutes: ev.durationMinutes ?? null,
        featured: boolToInt(ev.featured),
        icon: ev.icon ?? null,
      });
    }
  });
  trx(mock);
}

function seedWorld() {
  const mock = require('@/mocks/world-events.json') as WorldEvent[];
  const stmt = db.prepare(`
    INSERT INTO world_events
    (id, name_es, name_en, desc_es, desc_en, headline_es, headline_en, location_es, location_en,
     starts_at, ends_at, featured, banner, highlights_json, rewards_json, warnings_json)
    VALUES (@id, @name_es, @name_en, @desc_es, @desc_en, @headline_es, @headline_en, @location_es, @location_en,
            @starts_at, @ends_at, @featured, @banner, @highlights_json, @rewards_json, @warnings_json)
  `);
  const trx = db.transaction((rows: WorldEvent[]) => {
    for (const ev of rows) {
      stmt.run({
        id: ev.id,
        name_es: ev.name.es,
        name_en: ev.name.en,
        desc_es: ev.description?.es ?? null,
        desc_en: ev.description?.en ?? null,
        headline_es: ev.headline?.es ?? null,
        headline_en: ev.headline?.en ?? null,
        location_es: ev.location?.es ?? null,
        location_en: ev.location?.en ?? null,
        starts_at: ev.startsAt,
        ends_at: ev.endsAt,
        featured: boolToInt(ev.featured),
        banner: ev.banner ?? null,
        highlights_json: ev.highlights ? JSON.stringify(ev.highlights) : null,
        rewards_json: ev.rewards ? JSON.stringify(ev.rewards) : null,
        warnings_json: ev.warnings ? JSON.stringify(ev.warnings) : null,
      });
    }
  });
  trx(mock);
}

if (tableEmpty('weekly_events')) seedWeekly();
if (tableEmpty('world_events')) seedWorld();

// ---------- Queries públicas ----------
export function dbListWeekly(): WeeklyEvent[] {
  const rows = db.prepare(`SELECT * FROM weekly_events`).all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: ls(r.name_es, r.name_en),
    description: (r.desc_es || r.desc_en) ? ls(r.desc_es, r.desc_en) : undefined,
    dayOfWeek: r.day_of_week,
    times: parseJsonArray<string[]>(r.times_json, []),
    durationMinutes: r.duration_minutes ?? undefined,
    featured: intToBool(r.featured),
    icon: r.icon ?? undefined,
  }));
}

export function dbGetWeekly(id: string): WeeklyEvent | undefined {
  const r = db.prepare(`SELECT * FROM weekly_events WHERE id=?`).get(id) as any;
  if (!r) return;
  return {
    id: r.id,
    name: ls(r.name_es, r.name_en),
    description: (r.desc_es || r.desc_en) ? ls(r.desc_es, r.desc_en) : undefined,
    dayOfWeek: r.day_of_week,
    times: parseJsonArray<string[]>(r.times_json, []),
    durationMinutes: r.duration_minutes ?? undefined,
    featured: intToBool(r.featured),
    icon: r.icon ?? undefined,
  };
}

export function dbCreateWeekly(input: Omit<WeeklyEvent,'id'> & { id?: string }): WeeklyEvent {
  const id = input.id ?? ('ev_' + Math.random().toString(36).slice(2,8));
  db.prepare(`
    INSERT INTO weekly_events
    (id, name_es, name_en, desc_es, desc_en, day_of_week, times_json, duration_minutes, featured, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.name.es, input.name.en,
    input.description?.es ?? null, input.description?.en ?? null,
    input.dayOfWeek,
    JSON.stringify(input.times ?? []),
    input.durationMinutes ?? null,
    boolToInt(input.featured),
    input.icon ?? null,
  );
  return dbGetWeekly(id)!;
}

export function dbUpdateWeekly(id: string, input: Omit<WeeklyEvent,'id'> & { id?: string }): WeeklyEvent {
  db.prepare(`
    UPDATE weekly_events
      SET name_es=?, name_en=?, desc_es=?, desc_en=?, day_of_week=?, times_json=?,
          duration_minutes=?, featured=?, icon=?
      WHERE id=?
  `).run(
    input.name.es, input.name.en,
    input.description?.es ?? null, input.description?.en ?? null,
    input.dayOfWeek,
    JSON.stringify(input.times ?? []),
    input.durationMinutes ?? null,
    boolToInt(input.featured),
    input.icon ?? null,
    id,
  );
  return dbGetWeekly(id)!;
}

export function dbRemoveWeekly(id: string): void {
  db.prepare(`DELETE FROM weekly_events WHERE id=?`).run(id);
}

export function dbListWorld(): WorldEvent[] {
  const rows = db.prepare(`SELECT * FROM world_events`).all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: ls(r.name_es, r.name_en),
    description: (r.desc_es || r.desc_en) ? ls(r.desc_es, r.desc_en) : undefined,
    headline: (r.headline_es || r.headline_en) ? ls(r.headline_es, r.headline_en) : undefined,
    location: (r.location_es || r.location_en) ? ls(r.location_es, r.location_en) : undefined,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    featured: intToBool(r.featured),
    banner: r.banner ?? undefined,
    highlights: parseJsonArray<LocalizedString[]>(r.highlights_json, []),
    rewards: parseJsonArray<LocalizedString[]>(r.rewards_json, []),
    warnings: parseJsonArray<LocalizedString[]>(r.warnings_json, []),
  }));
}

export function dbGetWorld(id: string): WorldEvent | undefined {
  const r = db.prepare(`SELECT * FROM world_events WHERE id=?`).get(id) as any;
  if (!r) return;
  return {
    id: r.id,
    name: ls(r.name_es, r.name_en),
    description: (r.desc_es || r.desc_en) ? ls(r.desc_es, r.desc_en) : undefined,
    headline: (r.headline_es || r.headline_en) ? ls(r.headline_es, r.headline_en) : undefined,
    location: (r.location_es || r.location_en) ? ls(r.location_es, r.location_en) : undefined,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    featured: intToBool(r.featured),
    banner: r.banner ?? undefined,
    highlights: parseJsonArray<LocalizedString[]>(r.highlights_json, []),
    rewards: parseJsonArray<LocalizedString[]>(r.rewards_json, []),
    warnings: parseJsonArray<LocalizedString[]>(r.warnings_json, []),
  };
}

export function dbCreateWorld(input: Omit<WorldEvent,'id'> & { id?: string }): WorldEvent {
  const id = input.id ?? ('we_' + Math.random().toString(36).slice(2,8));
  db.prepare(`
    INSERT INTO world_events
    (id, name_es, name_en, desc_es, desc_en, headline_es, headline_en, location_es, location_en,
     starts_at, ends_at, featured, banner, highlights_json, rewards_json, warnings_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.name.es, input.name.en,
    input.description?.es ?? null, input.description?.en ?? null,
    input.headline?.es ?? null, input.headline?.en ?? null,
    input.location?.es ?? null, input.location?.en ?? null,
    input.startsAt, input.endsAt,
    boolToInt(input.featured),
    input.banner ?? null,
    input.highlights ? JSON.stringify(input.highlights) : null,
    input.rewards ? JSON.stringify(input.rewards) : null,
    input.warnings ? JSON.stringify(input.warnings) : null,
  );
  return dbGetWorld(id)!;
}

export function dbUpdateWorld(id: string, input: Omit<WorldEvent,'id'> & { id?: string }): WorldEvent {
  db.prepare(`
    UPDATE world_events
      SET name_es=?, name_en=?, desc_es=?, desc_en=?, headline_es=?, headline_en=?,
          location_es=?, location_en=?, starts_at=?, ends_at=?, featured=?, banner=?,
          highlights_json=?, rewards_json=?, warnings_json=?
      WHERE id=?
  `).run(
    input.name.es, input.name.en,
    input.description?.es ?? null, input.description?.en ?? null,
    input.headline?.es ?? null, input.headline?.en ?? null,
    input.location?.es ?? null, input.location?.en ?? null,
    input.startsAt, input.endsAt,
    boolToInt(input.featured), input.banner ?? null,
    input.highlights ? JSON.stringify(input.highlights) : null,
    input.rewards ? JSON.stringify(input.rewards) : null,
    input.warnings ? JSON.stringify(input.warnings) : null,
    id,
  );
  return dbGetWorld(id)!;
}

export function dbRemoveWorld(id: string): void {
  db.prepare(`DELETE FROM world_events WHERE id=?`).run(id);
}
