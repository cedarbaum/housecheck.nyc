"use client";

import { useQuery } from "@tanstack/react-query";
import { HpdComplaintProblems } from "@/app/api/hpd_complaint_problems/route";
import { useParams } from "next/navigation";
import { getColumnsForDataSource } from "@/lib/tabular-data";
import { ErrorCallout, InfoCallout } from "@/components/callouts";
import Table from "@/components/data-table";
import { jsonDateParser } from "json-date-parser";
import { getSectionMetadataForDataSource } from "@/lib/section-metadata";
import SectionLoader from "@/components/section-loader";

export default function HpdComplaintProblems() {
  const params = useParams();
  const complaintId = params.slug as string | undefined;

  const queryEnabled = !!complaintId;
  const { data, error, isLoading } = useQuery({
    queryKey: ["hpd_complaint_problems", complaintId],
    queryFn: async () => {
      const complaintProblems = await fetch(
        "/api/hpd_complaint_problems?" +
          new URLSearchParams({
            complaint_id: complaintId!,
          }),
      );

      if (!complaintProblems.ok) {
        throw new Error("Failed to fetch complaint problems");
      }

      return JSON.parse(
        await complaintProblems.text(),
        jsonDateParser,
      ) as HpdComplaintProblems;
    },
    enabled: queryEnabled,
  });

  const { noDataDescription } = getSectionMetadataForDataSource(
    "hpdComplaintProblems",
  );

  const showLoadingState = queryEnabled && (isLoading || (!data && !error));

  return (
    <div>
      {!!error && (
        <ErrorCallout text="Failed to retrieve complaint problems." />
      )}
      <section>
        <SectionLoader
          title={`Problems for HPD complaint ${complaintId}`}
          metadata={data?.metadata}
          isLoading={showLoadingState}
        >
          {data &&
            (data?.hpdComplaintProblems?.length === 0 ? (
              <InfoCallout text={noDataDescription} />
            ) : (
              <Table
                columns={getColumnsForDataSource("hpdComplaintProblems")}
                data={data.hpdComplaintProblems}
                paginate
              />
            ))}
        </SectionLoader>
      </section>
    </div>
  );
}
