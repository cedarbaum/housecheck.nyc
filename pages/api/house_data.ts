import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { AddressSearchType } from "@/components/AddressSearchOptions";

const plutoSelectArgs = Prisma.validator<Prisma.pluto_latestArgs>()({
  select: {
    ownername: true,
    numfloors: true,
    unitstotal: true,
    yearbuilt: true,
    version: true,
  },
});

export type PlutoData = Prisma.pluto_latestGetPayload<typeof plutoSelectArgs>;

const hpdComplaintsSelectArgs = Prisma.validator<Prisma.hpd_complaintsArgs>()({
  select: {
    complaintid: true,
    apartment: true,
    receiveddate: true,
    status: true,
  },
});

export type HpdComplaint = Prisma.hpd_complaintsGetPayload<
  typeof hpdComplaintsSelectArgs
>;

const dobComplaintsSelectArgs = Prisma.validator<Prisma.dob_complaintsArgs>()({
  select: {
    complaintnumber: true,
    complaintcategory: true,
    status: true,
    dateentered: true,
  },
});

export type DobComplaint = Prisma.dob_complaintsGetPayload<
  typeof dobComplaintsSelectArgs
>;

const hpdViolationSelectArgs = Prisma.validator<Prisma.hpd_violationsArgs>()({
  select: {
    violationid: true,
    inspectiondate: true,
    novdescription: true,
    violationstatus: true,
  },
});

export type HpdViolation = Prisma.hpd_violationsGetPayload<
  typeof hpdViolationSelectArgs
>;

const dobViolationsSelectArgs = Prisma.validator<Prisma.dob_violationsArgs>()({
  select: {
    number: true,
    issuedate: true,
    violationnumber: true,
    violationtypecode: true,
    violationcategory: true,
    violationtype: true,
    description: true,
  },
});

export type DobViolation = Prisma.dob_violationsGetPayload<
  typeof dobViolationsSelectArgs
>;

const hpdLitigaionSelectArgs = Prisma.validator<Prisma.hpd_litigationsArgs>()({
  select: {
    litigationid: true,
    casetype: true,
    caseopendate: true,
    casestatus: true,
    penalty: true,
    findingofharassment: true,
  },
});

export type HpdLitigation = Prisma.hpd_litigationsGetPayload<
  typeof hpdLitigaionSelectArgs
>;

const hptVactateOrderSelectArgs =
  Prisma.validator<Prisma.hpd_vacateordersArgs>()({
    select: {
      vacateordernumber: true,
      vacateeffectivedate: true,
      vacatetype: true,
      primaryvacatereason: true,
      rescinddate: true,
      numberofvacatedunits: true,
    },
  });

export type HpdVacateOrder = Prisma.hpd_vacateordersGetPayload<
  typeof hptVactateOrderSelectArgs
>;

const dobVacateOrdersSelectArgs =
  Prisma.validator<Prisma.dob_vacate_ordersArgs>()({
    select: {
      lastdispositiondate: true,
      complaintcategorydescription: true,
      lastdispositioncodedescription: true,
    },
  });

export type DobVacateOrder = Prisma.dob_vacate_ordersGetPayload<
  typeof dobVacateOrdersSelectArgs
>;

export type HouseData = {
  plutoData: PlutoData | null;
  hpdViolations: HpdViolation[];
  hpdComplaints: HpdComplaint[];
  hpdLitigations: HpdLitigation[];
  hpdVacateOrders: HpdVacateOrder[];
  dobViolations: DobViolation[];
  dobComplaints: DobComplaint[];
  dobVacateOrders: DobVacateOrder[];
};

function boroughToBoro(borough: string): number {
  switch (borough) {
    case "MANHATTAN":
      return 1;
    case "BRONX":
      return 2;
    case "BROOKLYN":
      return 3;
    case "QUEENS":
      return 4;
    case "STATEN ISLAND":
      return 5;
    default:
      throw new Error("Invalid borough");
  }
}

function boroughToBoroCode(borough: string): string {
  switch (borough) {
    case "MANHATTAN":
      return "MN";
    case "BRONX":
      return "BX";
    case "BROOKLYN":
      return "BK";
    case "QUEENS":
      return "QN";
    case "STATEN ISLAND":
      return "SI";
    default:
      throw new Error("Invalid borough");
  }
}

function boroughToCapitalizedBorough(borough: string): string {
  switch (borough) {
    case "MANHATTAN":
      return "Manhattan";
    case "BRONX":
      return "Bronx";
    case "BROOKLYN":
      return "Brooklyn";
    case "QUEENS":
      return "Queens";
    case "STATEN ISLAND":
      return "Staten Island";
    default:
      throw new Error("Invalid borough");
  }
}

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HouseData | { error: string }>
) {
  let { streetname, housenumber, borough, zipcode, bbl, bin, search_types } =
    req.query;

  search_types = search_types as string | undefined;
  const searchTypes = new Set<AddressSearchType>(
    search_types?.split(",").map((s) => s as AddressSearchType) ?? []
  );

  streetname = (streetname as string).toUpperCase();
  housenumber = (housenumber as string).toUpperCase();
  borough = (borough as string).toUpperCase();
  zipcode = zipcode as string | undefined;
  bbl = bbl as string | undefined;
  bin = bin as string | undefined;

  const plutoData = await prisma.pluto_latest.findFirst({
    ...plutoSelectArgs,
    where: {
      bbl: { equals: bbl as string },
    },
  });

  const hpdViolations = await prisma.hpd_violations.findMany({
    ...hpdViolationSelectArgs,
    where: {
      OR: [
        { ...(bbl && searchTypes.has("bbl") && { bbl: { equals: bbl } }) },
        { ...(bin && searchTypes.has("bin") && { bin: { equals: bin } }) },
        {
          ...(streetname &&
            borough &&
            housenumber &&
            searchTypes.has("address") && {
              streetname: { equals: streetname },
              borough: { equals: borough },
              OR: [
                {
                  AND: [
                    { lowhousenumber: { lte: housenumber } },
                    { highhousenumber: { gte: housenumber } },
                  ],
                },
                {
                  housenumber: {
                    equals: housenumber,
                  },
                },
              ],
            }),
        },
      ],
    },
    orderBy: {
      inspectiondate: "desc",
    },
  });

  const hpdComplaints = await prisma.hpd_complaints.findMany({
    ...hpdComplaintsSelectArgs,
    where: {
      OR: [
        { ...(bbl && searchTypes.has("bbl") && { bbl: { equals: bbl } }) },
        {
          ...(streetname &&
            borough &&
            housenumber &&
            searchTypes.has("address") && {
              AND: {
                streetname: { equals: streetname },
                housenumber: { equals: housenumber },
                borough: { equals: borough },
              },
            }),
        },
      ],
    },
    orderBy: {
      receiveddate: "desc",
    },
  });

  const hpdLitigations = await prisma.hpd_litigations.findMany({
    ...hpdLitigaionSelectArgs,
    where: {
      OR: [
        { ...(bbl && searchTypes.has("bbl") && { bbl: { equals: bbl } }) },
        { ...(bin && searchTypes.has("bin") && { bin: { equals: bin } }) },
        {
          ...(streetname &&
            borough &&
            housenumber &&
            searchTypes.has("address") && {
              AND: {
                streetname: { equals: streetname },
                housenumber: { equals: housenumber },
                boro: { equals: boroughToBoro(borough) },
              },
            }),
        },
      ],
    },
    orderBy: {
      caseopendate: "desc",
    },
  });

  const hpdVacateOrders = await prisma.hpd_vacateorders.findMany({
    ...hptVactateOrderSelectArgs,
    where: {
      OR: [
        { ...(bbl && searchTypes.has("bbl") && { bbl: { equals: bbl } }) },
        { ...(bin && searchTypes.has("bin") && { bin: { equals: bin } }) },
        {
          ...(streetname &&
            borough &&
            housenumber &&
            searchTypes.has("address") && {
              AND: {
                street: { equals: streetname },
                number: { equals: housenumber },
                borough: { equals: boroughToBoroCode(borough) },
              },
            }),
        },
      ],
    },
    orderBy: {
      vacateeffectivedate: "desc",
    },
  });

  const dobComplaints = await prisma.dob_complaints.findMany({
    ...dobComplaintsSelectArgs,
    where: {
      OR: [
        { ...(bin && searchTypes.has("bin") && { bin: { equals: bin } }) },
        {
          ...(streetname &&
            zipcode &&
            housenumber &&
            searchTypes.has("address") && {
              AND: {
                housestreet: { equals: streetname },
                housenumber: { equals: housenumber },
                zipcode: { equals: zipcode },
              },
            }),
        },
      ],
    },
    orderBy: {
      dateentered: "desc",
    },
  });

  const dobViolations = await prisma.dob_violations.findMany({
    ...dobViolationsSelectArgs,
    where: {
      OR: [
        { ...(bbl && searchTypes.has("bbl") && { bbl: { equals: bbl } }) },
        { ...(bin && searchTypes.has("bin") && { bin: { equals: bin } }) },
        {
          ...(streetname &&
            borough &&
            housenumber &&
            searchTypes.has("address") && {
              AND: {
                street: { equals: streetname },
                housenumber: { equals: housenumber },
                boro: { equals: boroughToBoro(borough).toString() },
              },
            }),
        },
      ],
    },
    orderBy: {
      issuedate: "desc",
    },
  });

  const dobVacateOrders = await prisma.dob_vacate_orders.findMany({
    ...dobVacateOrdersSelectArgs,
    where: {
      OR: [
        { ...(bbl && searchTypes.has("bbl") && { bbl: { equals: bbl } }) },
        {
          ...(streetname &&
            borough &&
            housenumber &&
            zipcode &&
            searchTypes.has("address") && {
              AND: {
                streetname: { equals: streetname },
                housenumber: { equals: housenumber },
                boroughname: { equals: boroughToCapitalizedBorough(borough) },
                zipcode: { equals: zipcode },
              },
            }),
        },
      ],
    },
    orderBy: {
      lastdispositiondate: "desc",
    },
  });

  res.status(200).json({
    plutoData,
    hpdViolations,
    hpdComplaints,
    hpdLitigations,
    hpdVacateOrders,
    dobViolations,
    dobComplaints,
    dobVacateOrders,
  });
}
