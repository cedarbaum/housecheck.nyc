import { Metadata } from "@/app/api/house_data/route";
import SectionHeader from "./section-header";
import { DataTableSkeleton } from "./data-table-skeleton";

export default function SectionLoader({
  title,
  metadata,
  children,
  isLoading,
  sectionZIndex,
}: {
  title: string;
  metadata: Metadata | undefined;
  children: React.ReactNode;
  isLoading: boolean;
  sectionZIndex?: number;
}) {
  if (isLoading) {
    return (
      <>
        <div
          className="sticky top-0 bg-white border-b mb-4"
          style={{ zIndex: sectionZIndex }}
        >
          <SectionHeader title={title} metadata={metadata} />
        </div>
        <DataTableSkeleton />
      </>
    );
  }

  if (!children) {
    return null;
  }

  return (
    <>
      <div
        className="sticky top-0 bg-white border-b mb-4"
        style={{ zIndex: sectionZIndex }}
      >
        <SectionHeader title={title} metadata={metadata} />
      </div>
      {children}
    </>
  );
}