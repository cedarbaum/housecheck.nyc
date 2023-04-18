import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";

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
};

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HpdComplaintProblems | { error: string }>
) {
  let { complaint_id } = req.query;
  if (typeof complaint_id !== "string") {
    res.status(400).json({ error: "Invalid complaint_id" });
    return;
  }

  const hpdComplaintProblems = await prisma.hpd_complaint_problems.findMany({
    ...hpdComplaintProblemsSelectArgs,
    where: {
      complaintid: parseInt(complaint_id),
    },
  });

  res.status(200).json({
    hpdComplaintProblems,
  });
}
