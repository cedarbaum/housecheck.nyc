import type { NextApiRequest, NextApiResponse } from "next";
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HpdComplaintProblems | { error: string }>,
) {
  let { complaint_id } = req.query;
  if (typeof complaint_id !== "string") {
    res.status(400).json({ error: "Invalid complaint_id" });
    return;
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

  res.status(200).json({
    hpdComplaintProblems: hpdComplaintProblemsData,
    metadata: {
      ...hpdComplaintProblemsMetadata[0]!,
    },
  });
}
