import { z } from 'zod';

export const localizedStringSchema = z.object({
  es: z.string(),
  en: z.string(),
});

const hhmm = /^\d{2}:\d{2}$/;

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Invalid ISO datetime' });

const urlOrRootRelative = z.string().refine((v) => {
  return /^https?:\/\//i.test(v) || v.startsWith('/');
}, { message: 'Invalid URL' });

export const weeklyEventSchema = z.object({
  id: z.string(),
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  times: z.array(z.string().regex(hhmm)).min(1),
  durationMinutes: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  icon: z.string().optional(),
});

export const donationSchema = z.object({
  id: z.string(),
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  price: z.object({
    currency: z.literal('EUR'),
    amount: z.number().nonnegative(),
  }),
  category: z.enum(['cosmetic','mount','house','utility','other']).optional(),
  image: z.string().optional(),
});

export const serverStatusSchema = z.object({
  online: z.boolean(),
  playersOnline: z.number().int().nonnegative(),
  maxPlayers: z.number().int().positive(),
  uptimeMinutes: z.number().int().nonnegative(),
  lastRestartIso: z.string().datetime().optional(),
});

export const worldEventSchema = z.object({
  id: z.string(),
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  startsAt: isoDate,
  endsAt: isoDate,
  banner: urlOrRootRelative.optional(),
  location: localizedStringSchema.optional(),
  featured: z.boolean().optional(),
  headline: localizedStringSchema.optional(),
  highlights: z.array(localizedStringSchema).optional(),
  rewards: z.array(localizedStringSchema).optional(),
  warnings: z.array(localizedStringSchema).optional(),
}).superRefine((val, ctx) => {
  if (Date.parse(val.endsAt) <= Date.parse(val.startsAt)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: '`endsAt` must be after `startsAt`', path: ['endsAt'] });
  }
});

export const weeklyEventListSchema = z.array(weeklyEventSchema);
export const donationListSchema = z.array(donationSchema);
export const worldEventListSchema = z.array(worldEventSchema);
