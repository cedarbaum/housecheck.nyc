import { DateTime } from "luxon";

export function formatDbTimeToISODate(
  dateStr: string | null,
  tz: "UTC" | "America/New_York",
) {
  if (!dateStr) return null;
  const dt = DateTime.fromSQL(dateStr, { zone: tz });
  return dt.toJSDate();
}
