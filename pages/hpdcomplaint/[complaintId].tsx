import { useQuery } from "react-query";
import { HpdComplaintProblems } from "@/pages/api/hpd_complaint_problems";
import { useRouter } from "next/router";
import {
  getColumnsForDataSource,
  getSectionMetadataForDataSource,
} from "@/utils/TabularData";
import Loading from "@/components/Loading";
import { InfoCallout } from "@/components/Callouts";
import Table from "@/components/Table";
import { jsonDateParser } from "json-date-parser";

export default function HpdComplaintProblems() {
  const router = useRouter();
  const complaintId = router.query.complaintId as string | undefined;

  const { data, error, isLoading } = useQuery(
    ["hpd_complaint_problems", complaintId],
    async () => {
      const complaintProblems = await fetch(
        "/api/hpd_complaint_problems?" +
          new URLSearchParams({
            complaint_id: complaintId!,
          })
      );

      if (!complaintProblems.ok) {
        throw new Error("Failed to fetch complaint problems");
      }

      return JSON.parse(
        await complaintProblems.text(),
        jsonDateParser
      ) as HpdComplaintProblems;
    },
    {
      enabled: !!complaintId,
    }
  );

  const { title, noDataDescription } = getSectionMetadataForDataSource(
    "hpdComplaintProblems"
  );

  return (
    <div>
      {isLoading && <Loading />}
      {!isLoading && data && (
        <section>
          <h1 className="font-bold text-2xl my-8">{`Problems for HPD complaint ${complaintId}`}</h1>
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
        </section>
      )}
    </div>
  );
}
