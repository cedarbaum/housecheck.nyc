import { DateTime } from "luxon";

export function formatDbTimeToISODate(
  dateStr: string,
  tz: "UTC" | "America/New_York",
) {
  const dt = DateTime.fromSQL(dateStr, { zone: tz });
  return dt.toJSDate();
}
