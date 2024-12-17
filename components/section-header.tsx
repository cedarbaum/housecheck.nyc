import { Metadata } from "@/app/api/house_data/route";
import { formatDbTimeToISODate } from "@/lib/date-time";
import { DateTime } from "luxon";
import Link from "next/link";

function formatDataMetadata(metadata: Metadata | null | undefined) {
  if (!metadata) {
    return "";
  }

  if (metadata.startDate && metadata.endDate) {
    const startJSDate = formatDbTimeToISODate(metadata.startDate, "UTC")!;
    const endJSDate = formatDbTimeToISODate(metadata.endDate, "UTC")!;
    if (metadata.dateRangePrecision === "MONTH") {
      return `Data from ${DateTime.fromJSDate(startJSDate)
        .setZone("UTC")
        .toFormat("MM/yyyy")} to ${DateTime.fromJSDate(endJSDate)
        .setZone("UTC")
        .toFormat("MM/yyyy")}`;
    }
    return `Data from ${metadata.startDate} to ${metadata.endDate}`;
  } else if (metadata.version) {
    return `Data version ${metadata.version}`;
  } else if (metadata.lastUpdated) {
    const lastUpdatedJSDate = formatDbTimeToISODate(
      metadata.lastUpdated,
      "UTC",
    )!;
    return `Data last synced ${metadata.lastUpdated ? DateTime.fromJSDate(lastUpdatedJSDate).toLocaleString() : "Unknown"}`;
  }

  return "";
}

export default function SectionHeader({
  title,
  metadata,
}: {
  title: string;
  metadata: Metadata | null | undefined;
}) {
  return (
    <h1 className="flex flex-col md:flex-row items-baseline justify-between font-bold text-2xl py-8">
      <div>{title}</div>
      <div className="text-gray-500 text-base mt-2 md:mt-0">
        {metadata?.href ? (
          <Link href={metadata.href} target="_blank">
            {formatDataMetadata(metadata)}
          </Link>
        ) : (
          <>{formatDataMetadata(metadata)}</>
        )}
      </div>
    </h1>
  );
}
