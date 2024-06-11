import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const hpdComplaintProblemsSelectArgs =
  Prisma.validator<Prisma.hpd_complaints_and_problemsDefaultArgs>()({
    select: {
      problemid: true,
      unittype: true,
      spacetype: true,
      type: true,
      majorcategory: true,
      minorcategory: true,
      problemcode: true,
      complaintstatus: true,
      complaintstatusdate: true,
      statusdescription: true,
    },
  });

export type HpdComplaintProblem = Prisma.hpd_complaints_and_problemsGetPayload<
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
      prisma.hpd_complaints_and_problems.findMany({
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
    },
  });
}
