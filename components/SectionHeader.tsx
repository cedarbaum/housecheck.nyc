import { Metadata } from "@/pages/api/house_data";
import { DateTime } from "luxon";

function formatDataMetadata(metadata: Metadata | undefined) {
  if (!metadata) {
    return "";
  }

  if (metadata.start_date && metadata.end_date) {
    if (metadata.data_range_precision === "MONTH") {
      return `Data from ${DateTime.fromJSDate(metadata.start_date)
        .setZone("UTC")
        .toFormat("MM/yyyy")} to ${DateTime.fromJSDate(metadata.end_date)
        .setZone("UTC")
        .toFormat("MM/yyyy")}`;
    }
    return `Data from ${metadata.start_date.toLocaleDateString()} to ${metadata.end_date.toLocaleDateString()}`;
  } else if (metadata.version) {
    return `Data version ${metadata.version}`;
  } else {
    return `Data last synced ${DateTime.fromJSDate(metadata.last_updated)
      .setZone("UTC")
      .toLocaleString()}`;
  }
}

export default function SectionHeader({
  title,
  metadata,
}: {
  title: string;
  metadata: Metadata | undefined;
}) {
  return (
    <h1 className="flex flex-col md:flex-row items-baseline justify-between font-bold text-2xl py-8">
      <div>{title}</div>
      <div className="text-gray-500 text-base mt-2 md:mt-0">
        {metadata?.href ? (
          <a href={metadata.href} target="_blank">
            {formatDataMetadata(metadata)}
          </a>
        ) : (
          <>{formatDataMetadata(metadata)}</>
        )}
      </div>
    </h1>
  );
}
