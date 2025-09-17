import { NextResponse } from 'next/server';
import { dbListWeekly } from '@/db/sqlite';
import { weeklyEventListSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export async function GET() {
  const data = dbListWeekly();
  return NextResponse.json(weeklyEventListSchema.parse(data));
}
