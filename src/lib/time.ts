import { DateTime } from 'luxon';

export function nowInTz(tz: string) {
  return DateTime.now().setZone(tz || 'Europe/Madrid');
}

export function todayWeekday(tz: string) {
  const n = nowInTz(tz).weekday; // 1=Mon .. 7=Sun
  return (n % 7); // convert to 0=Sun .. 6=Sat
}
