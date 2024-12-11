export function formatDbTimeToISODate(dateStr: string) {
  const timestamp = Date.parse(dateStr.replace(" ", "T"));
  const parsedDate = new Date(timestamp);
  return parsedDate;
}
