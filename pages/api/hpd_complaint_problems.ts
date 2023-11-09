import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const hpdComplaintProblemsSelectArgs =
  Prisma.validator<Prisma.hpd_complaint_problemsArgs>()({
    select: {
      problemid: true,
      unittype: true,
      spacetype: true,
      type: true,
      majorcategory: true,
      minorcategory: true,
      code: true,
      status: true,
      statusdate: true,
      statusdescription: true,
    },
  });

export type HpdComplaintProblem = Prisma.hpd_complaint_problemsGetPayload<
  typeof hpdComplaintProblemsSelectArgs
>;

export type HpdComplaintProblems = {
  hpdComplaintProblems: HpdComplaintProblem[];
  metadata: Metadata;
};

const metadataSelectArgs = Prisma.validator<Prisma.metadataArgs>()({
  select: {
    last_updated: true,
    version: true,
    start_date: true,
    end_date: true,
    data_range_precision: true,
    href: true,
  },
});

export type Metadata = Prisma.metadataGetPayload<typeof metadataSelectArgs>;

const prisma = new PrismaClient().$extends(withAccelerate())

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HpdComplaintProblems | { error: string }>
) {
  let { complaint_id } = req.query;
  if (typeof complaint_id !== "string") {
    res.status(400).json({ error: "Invalid complaint_id" });
    return;
  }

  const [hpdComplaintProblems, hpdComplaintProblemsMetadata] =
    await prisma.$transaction([
      prisma.hpd_complaint_problems.findMany({
        ...hpdComplaintProblemsSelectArgs,
        where: {
          complaintid: parseInt(complaint_id),
        },
      }),
      prisma.metadata.findUnique({
        ...metadataSelectArgs,
        where: {
          dataset: "hpd_complaints",
        },
      }),
    ]);

  res.status(200).json({
    hpdComplaintProblems,
    metadata: {
      ...hpdComplaintProblemsMetadata!,
      // TODO: This is a hack to get around the fact that the metadata table only stores 1 href
      // per dataset and hpd_complaints has 2 tables.
      href: "https://data.cityofnewyork.us/Housing-Development/Complaint-Problems/a2nx-4u46",
    },
  });
}
