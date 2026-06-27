export type Granularity = "month" | "week";

export interface PeriodRange {
  start: Date;
  end: Date;
  label: string;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

// Monday-based week start, since that's the convention used in Brazil for
// weekly planning (and matches ISO 8601 week definitions).
function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(startOfDay(date), diff);
}

function isoWeekLabel(start: Date): string {
  const year = start.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const weekNumber = Math.ceil(((start.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, "0")}`;
}

export function getCurrentAndPreviousPeriod(
  granularity: Granularity,
  reference: Date = new Date()
): { current: PeriodRange; previous: PeriodRange } {
  if (granularity === "week") {
    const currentStart = startOfWeek(reference);
    const currentEnd = addDays(currentStart, 7);
    const previousStart = addDays(currentStart, -7);
    const previousEnd = currentStart;
    return {
      current: { start: currentStart, end: currentEnd, label: isoWeekLabel(currentStart) },
      previous: { start: previousStart, end: previousEnd, label: isoWeekLabel(previousStart) },
    };
  }

  const currentStart = startOfMonth(reference);
  const currentEnd = addMonths(currentStart, 1);
  const previousStart = addMonths(currentStart, -1);
  const previousEnd = currentStart;
  const monthLabel = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return {
    current: { start: currentStart, end: currentEnd, label: monthLabel(currentStart) },
    previous: { start: previousStart, end: previousEnd, label: monthLabel(previousStart) },
  };
}
