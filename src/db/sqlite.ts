import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { Donation, LocalizedString, Pack, WeeklyEvent, WorldEvent } from '@/lib/types';
import { readMock, rowToDonation, rowToPack } from '@/helpers/dbHelpers';
import { donationSchema } from '@/lib/schemas';
import { boolToInt, intToBool, ls, nowIso } from '@/utils/dbUtils';

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

CREATE INDEX IF NOT EXISTS idx_world_events_ends_at   ON world_events(ends_at);
CREATE INDEX IF NOT EXISTS idx_world_events_starts_at ON world_events(starts_at);

CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_es TEXT,
  desc_en TEXT,
  category TEXT NOT NULL,
  scope TEXT NOT NULL,
  price_eur REAL,
  price_ne REAL,
  price_ne_fake REAL,
  featured INTEGER DEFAULT 0,
  icon TEXT,
  is_special INTEGER NOT NULL DEFAULT 0,
  show_item INTEGER NOT NULL DEFAULT 1,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_donations_show_feat_created
  ON donations(show_item, featured, created_at);

CREATE TABLE IF NOT EXISTS packs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_es TEXT,
  desc_en TEXT,

  price_eur REAL,
  price_ne REAL,
  price_ne_fake REAL,

  featured INTEGER NOT NULL DEFAULT 0,
  icon TEXT,

  items_json TEXT NOT NULL,       -- JSON: Array<{ donationId:string, qty?:number }>
  metadata_json TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_packs_featured_created
  ON packs(featured, created_at);
`);


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
  const mock = readMock<WeeklyEvent[]>('events.json');
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
  const mock = readMock<WorldEvent[]>('world-events.json');
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

function seedDonation() {
  const mock = readMock<Donation[]>('donations.json');

  const stmt = db.prepare(`
    INSERT INTO donations
    (
      id, slug, name_es, name_en, desc_es, desc_en, category, scope,
      price_eur, price_ne, price_ne_fake, featured, icon, is_special, show_item,
      metadata_json, created_at, updated_at
    )
    VALUES
    (
      @id, @slug, @name_es, @name_en, @desc_es, @desc_en, @category, @scope,
      @price_eur, @price_ne, @price_ne_fake, @featured, @icon, @is_special, @show_item,
      @metadata_json, @created_at, @updated_at
    )
  `);

  const trx = db.transaction((rows: Donation[]) => {
    for (const d of rows) {
      stmt.run({
        id: d.id,
        slug: d.slug,
        name_es: d.name.es,
        name_en: d.name.en,
        desc_es: d.description?.es ?? null,
        desc_en: d.description?.en ?? null,
        category: d.category,
        scope: d.scope,
        price_eur: d.price.eur ?? null,
        price_ne: d.price.ne ?? null,
        price_ne_fake: d.price.neFake ?? null,
        featured: d.featured ? 1 : 0,
        icon: d.icon ?? null,
        is_special: d.isSpecial ? 1 : 0,
        show_item: d.showItem ? 1 : 0,
        metadata_json: d.metadata ? JSON.stringify(d.metadata) : null,
        created_at: d.createdAt,
        updated_at: d.updatedAt,
      });
    }
  });

  trx(mock);
}

function seedPacks() {
  const mock = readMock<Pack[]>('packs.json');

  const stmt = db.prepare(`
    INSERT INTO packs (
      id, slug, name_es, name_en, desc_es, desc_en,
      price_eur, price_ne, price_ne_fake,
      featured, icon,
      items_json, metadata_json,
      created_at, updated_at
    ) VALUES (
      @id, @slug, @name_es, @name_en, @desc_es, @desc_en,
      @price_eur, @price_ne, @price_ne_fake,
      @featured, @icon,
      @items_json, @metadata_json,
      @created_at, @updated_at
    )
  `);

  const trx = db.transaction((rows: Pack[]) => {
    for (const p of rows) {
      stmt.run({
        id: p.id,
        slug: p.slug,
        name_es: p.name.es,
        name_en: p.name.en,
        desc_es: p.description?.es ?? null,
        desc_en: p.description?.en ?? null,
        price_eur: p.price?.eur ?? null,
        price_ne: p.price?.ne ?? null,
        price_ne_fake: p.price?.neFake ?? null,
        featured: boolToInt(!!p.featured),
        icon: p.icon ?? null,
        items_json: JSON.stringify(p.items ?? []),
        metadata_json: null,
        created_at: p.createdAt ?? nowIso(),
        updated_at: p.updatedAt ?? nowIso(),
      });
    }
  });

  trx(mock);
}

if (tableEmpty('weekly_events')) seedWeekly();
if (tableEmpty('world_events')) seedWorld();
if (tableEmpty('donations')) seedDonation();
if (tableEmpty('packs')) seedPacks();

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

export function dbListWorld(
  opts: { limit?: number; from?: Date } = {}
): WorldEvent[] {
  const limit = Math.max(1, opts.limit ?? 6);
  const fromIso = (opts.from ?? new Date()).toISOString();

  const rows = db.prepare(`
    SELECT *
      FROM world_events
     WHERE datetime(ends_at) >= datetime(?)
     ORDER BY datetime(starts_at) ASC
     LIMIT ?
  `).all(fromIso, limit) as any[];

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

export function dbListAllWorld(): WorldEvent[] {
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

export function dbListDonationItem(): Donation[] {
  const rows = db.prepare(
    `SELECT * FROM donations WHERE show_item = 1
     ORDER BY featured DESC, created_at DESC`
  ).all() as any[];
  return rows.map(rowToDonation);
}

export function dbListDonationsAll(): Donation[] {
  const rows = db.prepare(`
    SELECT * FROM donations
    ORDER BY featured DESC, created_at DESC
  `).all() as any[];
  return rows.map(rowToDonation);
}

export function dbGetDonationItem(id: string): Donation | undefined {
  const r = db.prepare(`SELECT * FROM donations WHERE id=?`).get(id) as any;
  return r ? rowToDonation(r) : undefined;
}

export function dbCreateDonationItem(input: Omit<Donation, 'id'|'createdAt'|'updatedAt'> & { id?: string }): Donation {
  const id = input.id ?? ('do_' + Math.random().toString(36).slice(2, 8));
  const now = nowIso();

  const candidate = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
  };
  const data = donationSchema.parse(candidate);

  db.prepare(`
    INSERT INTO donations (
      id, slug, name_es, name_en, desc_es, desc_en,
      category, scope,
      price_eur, price_ne, price_ne_fake,
      featured, icon, is_special, show_item,
      metadata_json, created_at, updated_at
    ) VALUES (
      @id, @slug, @name_es, @name_en, @desc_es, @desc_en,
      @category, @scope,
      @price_eur, @price_ne, @price_ne_fake,
      @featured, @icon, @is_special, @show_item,
      @metadata_json, @created_at, @updated_at
    )
  `).run({
    id: data.id,
    slug: data.slug,
    name_es: data.name.es,
    name_en: data.name.en,
    desc_es: data.description?.es ?? null,
    desc_en: data.description?.en ?? null,
    category: data.category,
    scope: data.scope,
    price_eur: data.price.eur ?? null,
    price_ne: data.price.ne ?? null,
    price_ne_fake: data.price.neFake ?? null,
    featured: boolToInt(!!data.featured),
    icon: data.icon ?? null,
    is_special: boolToInt(!!data.isSpecial),
    show_item: boolToInt(!!data.showItem),
    metadata_json: data.metadata ? JSON.stringify(data.metadata) : null,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  });

  return dbGetDonationItem(id)!;
}

export function dbUpdateDonationItem(id: string, input: Partial<Omit<Donation, 'id'|'createdAt'|'updatedAt'>>): Donation {
  const existing = dbGetDonationItem(id);
  if (!existing) throw new Error('Not found');

  const candidate: Donation = {
    ...existing,
    ...input,
    id,
    name: { es: input.name?.es ?? existing.name.es, en: input.name?.en ?? existing.name.en },
    description: input.description
      ? { es: input.description.es ?? existing.description?.es ?? '', en: input.description.en ?? existing.description?.en ?? '' }
      : existing.description,
    price: {
      eur: input.price?.eur ?? existing.price.eur,
      ne: input.price?.ne ?? existing.price.ne,
      neFake: input.price?.neFake ?? existing.price.neFake,
    },
    updatedAt: nowIso(),
  };

  const data = donationSchema.parse(candidate);

  db.prepare(`
    UPDATE donations
       SET slug=@slug, name_es=@name_es, name_en=@name_en,
           desc_es=@desc_es, desc_en=@desc_en,
           category=@category, scope=@scope,
           price_eur=@price_eur, price_ne=@price_ne, price_ne_fake=@price_ne_fake,
           featured=@featured, icon=@icon, is_special=@is_special, show_item=@show_item,
           metadata_json=@metadata_json, updated_at=@updated_at
     WHERE id=@id
  `).run({
    id: data.id,
    slug: data.slug,
    name_es: data.name.es,
    name_en: data.name.en,
    desc_es: data.description?.es ?? null,
    desc_en: data.description?.en ?? null,
    category: data.category,
    scope: data.scope,
    price_eur: data.price.eur ?? null,
    price_ne: data.price.ne ?? null,
    price_ne_fake: data.price.neFake ?? null,
    featured: boolToInt(!!data.featured),
    icon: data.icon ?? null,
    is_special: boolToInt(!!data.isSpecial),
    show_item: boolToInt(!!data.showItem),
    metadata_json: data.metadata ? JSON.stringify(data.metadata) : null,
    updated_at: data.updatedAt,
  });

  return dbGetDonationItem(id)!;
}

export function dbRemoveDonationItem(id: string): void {
  db.prepare(`DELETE FROM donations WHERE id=?`).run(id);
}

export function dbListPacks(): Pack[] {
  const rows = db.prepare(`
    SELECT * FROM packs
    ORDER BY featured DESC, created_at DESC
  `).all() as any[];
  return rows.map(rowToPack);
}

export function dbGetPack(id: string): Pack | undefined {
  const r = db.prepare(`SELECT * FROM packs WHERE id=?`).get(id) as any;
  return r ? rowToPack(r) : undefined;
}

export function dbCreatePack(input: Omit<Pack, 'id'|'createdAt'|'updatedAt'> & { id?: string }): Pack {
  const id = input.id ?? ('pk_' + Math.random().toString(36).slice(2, 8));
  const now = nowIso();

  db.prepare(`
    INSERT INTO packs (
      id, slug, name_es, name_en, desc_es, desc_en,
      price_eur, price_ne, price_ne_fake,
      featured, icon,
      items_json, metadata_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, input.slug, input.name.es, input.name.en,
    input.description?.es ?? null, input.description?.en ?? null,
    input.price?.eur ?? null, input.price?.ne ?? null, input.price?.neFake ?? null,
    input.featured ? 1 : 0, input.icon ?? null,
    JSON.stringify(input.items ?? []), null,
    now, now
  );

  return dbGetPack(id)!;
}

export function dbUpdatePack(id: string, input: Partial<Omit<Pack, 'id'|'createdAt'|'updatedAt'>>): Pack {
  const cur = dbGetPack(id);
  if (!cur) throw new Error('Not found');

  const merged: Pack = {
    ...cur,
    ...input,
    id,
    name: { es: input.name?.es ?? cur.name.es, en: input.name?.en ?? cur.name.en },
    description: input.description
      ? { es: input.description.es ?? cur.description?.es ?? '', en: input.description.en ?? cur.description?.en ?? '' }
      : cur.description,
    price: {
      eur: input.price?.eur ?? cur.price.eur,
      ne: input.price?.ne ?? cur.price.ne,
      neFake: input.price?.neFake ?? cur.price.neFake,
    },
    items: input.items ?? cur.items,
    updatedAt: nowIso(),
  };

  db.prepare(`
    UPDATE packs SET
      slug=@slug, name_es=@name_es, name_en=@name_en,
      desc_es=@desc_es, desc_en=@desc_en,
      price_eur=@price_eur, price_ne=@price_ne, price_ne_fake=@price_ne_fake,
      featured=@featured, icon=@icon,
      items_json=@items_json, metadata_json=@metadata_json, updated_at=@updated_at
    WHERE id=@id
  `).run({
    id: merged.id,
    slug: merged.slug,
    name_es: merged.name.es,
    name_en: merged.name.en,
    desc_es: merged.description?.es ?? null,
    desc_en: merged.description?.en ?? null,
    price_eur: merged.price.eur ?? null,
    price_ne: merged.price.ne ?? null,
    price_ne_fake: merged.price.neFake ?? null,
    featured: merged.featured ? 1 : 0,
    icon: merged.icon ?? null,
    items_json: JSON.stringify(merged.items ?? []),
    metadata_json: null,
    updated_at: merged.updatedAt,
  });

  return dbGetPack(id)!;
}

export function dbRemovePack(id: string): void {
  db.prepare(`DELETE FROM packs WHERE id=?`).run(id);
}