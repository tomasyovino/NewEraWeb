export type Locale = 'es' | 'en';

export type LocalizedString = {
  es: string;
  en: string;
};

export type DayOfWeek = number;

export type WeeklyEvent = {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  dayOfWeek: DayOfWeek;
  times: string[];
  durationMinutes?: number;
  featured?: boolean;
  icon?: string;
};

export type EventSlot = {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  dayOfWeek: DayOfWeek;
  time: string;
  durationMinutes?: number;
  featured?: boolean;
  icon?: string;
};

export type DonationCategory = 'cosmetic'|'mount'|'house'|'utility'|'other';

export type Donation = {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  price: { currency: 'EUR'; amount: number };
  category?: DonationCategory;
  image?: string;
};

export type ServerStatus = {
  online: boolean;
  playersOnline: number;
  maxPlayers: number;
  uptimeMinutes: number;
  lastRestartIso?: string;
};

export interface WorldEvent {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  startsAt: string;
  endsAt: string;
  banner?: string;
  location?: LocalizedString;
  featured?: boolean;
  headline?: LocalizedString;
  highlights?: LocalizedString[];
  rewards?: LocalizedString[];
  warnings?: LocalizedString[];
}