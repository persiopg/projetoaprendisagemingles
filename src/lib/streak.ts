import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getUserActivityDates(userId: number): Promise<Set<string>> {
  const dates = new Set<string>();

  // Collect dates from multiple progress tables
  const queries = [
    ["SELECT DATE(last_reviewed) as d FROM shadowing_progress WHERE user_id = ?", [userId]],
    ["SELECT DATE(last_reviewed) as d FROM flashcard_progress WHERE user_id = ?", [userId]],
    ["SELECT DATE(created_at) as d FROM dictation_progress WHERE user_id = ?", [userId]],
    ["SELECT DATE(created_at) as d FROM reverse_translation_progress WHERE user_id = ?", [userId]],
  ] as const;

  for (const [q, vals] of queries) {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(q, vals as any);
      for (const r of rows) {
        if (r && r.d) dates.add(formatDate(new Date(r.d)));
      }
    } catch (err) {
      // ignore missing tables
      // console.debug("streak: query failed", q, err);
    }
  }

  return dates;
}

export function computeStreakFromDates(datesSet: Set<string>, today: Date = new Date(), lookbackDays = 14) {
  const days: { date: string; active: 0 | 1 }[] = [];

  // Build last N days array (descending from today - lookbackDays+1 to today)
  for (let i = lookbackDays - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - i);
    const ds = formatDate(d);
    days.push({ date: ds, active: datesSet.has(ds) ? 1 : 0 });
  }

  // Compute streak: count consecutive active days from today backwards
  let streak = 0;
  let cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  while (true) {
    const ds = formatDate(cursor);
    if (datesSet.has(ds)) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  const lastActive = Array.from(datesSet).sort().pop() ?? null;

  return { streak, lastActiveDate: lastActive, days };
}

export async function getUserStreak(userId: number, lookbackDays = 14) {
  const dates = await getUserActivityDates(userId);
  return computeStreakFromDates(dates, new Date(), lookbackDays);
}
