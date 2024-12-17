import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { hpdComplaintsAndProblems, metadata } from "@/db/migrations/schema";

export type HpdComplaintProblem = Pick<
  typeof hpdComplaintsAndProblems.$inferSelect,
  | "problemid"
  | "unittype"
  | "spacetype"
  | "type"
  | "majorcategory"
  | "minorcategory"
  | "problemcode"
  | "complaintstatus"
  | "complaintstatusdate"
  | "statusdescription"
>;
export type Metadata = typeof metadata.$inferSelect;

export type HpdComplaintProblems = {
  hpdComplaintProblems: HpdComplaintProblem[];
  metadata: Metadata;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const complaint_id = searchParams.get("complaint_id");

  if (!complaint_id || isNaN(Number(complaint_id))) {
    return NextResponse.json(
      { error: "Invalid complaint_id" },
      { status: 400 },
    );
  }

  const hpdComplaintProblemsData = await db
    .select({
      problemid: hpdComplaintsAndProblems.problemid,
      unittype: hpdComplaintsAndProblems.unittype,
      spacetype: hpdComplaintsAndProblems.spacetype,
      type: hpdComplaintsAndProblems.type,
      majorcategory: hpdComplaintsAndProblems.majorcategory,
      minorcategory: hpdComplaintsAndProblems.minorcategory,
      problemcode: hpdComplaintsAndProblems.problemcode,
      complaintstatus: hpdComplaintsAndProblems.complaintstatus,
      complaintstatusdate: hpdComplaintsAndProblems.complaintstatusdate,
      statusdescription: hpdComplaintsAndProblems.statusdescription,
    })
    .from(hpdComplaintsAndProblems)
    .where(eq(hpdComplaintsAndProblems.complaintid, parseInt(complaint_id)));

  const hpdComplaintProblemsMetadata = await db
    .select()
    .from(metadata)
    .where(eq(metadata.dataset, "hpd_complaints"))
    .limit(1);

  return NextResponse.json({
    hpdComplaintProblems: hpdComplaintProblemsData,
    metadata: {
      ...hpdComplaintProblemsMetadata[0]!,
    },
  });
}
