export type WeeklyEvent = {
  id: string;
  name_es: string;
  name_en: string;
  dayOfWeek: number; // 0=Sunday .. 6=Saturday
  time: string;      // 'HH:mm' in server TZ
  description_es?: string;
  description_en?: string;
};

export type Donation = {
  id: string;
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  price_eur: number;
};
