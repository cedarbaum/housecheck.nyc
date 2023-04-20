import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { AddressSearchType } from "@/components/AddressSearchOptions";

const plutoSelectArgs = Prisma.validator<Prisma.pluto_latestArgs>()({
  select: {
    address: true,
    ownername: true,
    numbldgs: true,
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
    housenumber: true,
    streetname: true,
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
    housenumber: true,
    housestreet: true,
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
    housenumber: true,
    streetname: true,
    apartment: true,
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
    housenumber: true,
    street: true,
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
    housenumber: true,
    streetname: true,
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
      number: true,
      street: true,
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
      housenumber: true,
      streetname: true,
      lastdispositiondate: true,
      complaintcategorydescription: true,
      lastdispositioncodedescription: true,
    },
  });

export type DobVacateOrder = Prisma.dob_vacate_ordersGetPayload<
  typeof dobVacateOrdersSelectArgs
>;

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

export type HouseData = {
  plutoData: PlutoData | null;
  hpdViolations: HpdViolation[];
  hpdComplaints: HpdComplaint[];
  hpdLitigations: HpdLitigation[];
  hpdVacateOrders: HpdVacateOrder[];
  dobViolations: DobViolation[];
  dobComplaints: DobComplaint[];
  dobVacateOrders: DobVacateOrder[];
  metadata?: Record<Exclude<keyof HouseData, "metadata">, Metadata>;
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

  const [plutoData, plutoDataMetadata] = await prisma.$transaction([
    prisma.pluto_latest.findFirst({
      ...plutoSelectArgs,
      where: {
        bbl: { equals: bbl as string },
      },
    }),
    prisma.metadata.findUnique({
      ...metadataSelectArgs,
      where: {
        dataset: "pluto_latest",
      },
    }),
  ]);

  const [hpdViolations, hpdViolationsMetadata] = await prisma.$transaction([
    prisma.hpd_violations.findMany({
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
    }),
    prisma.metadata.findUnique({
      ...metadataSelectArgs,
      where: {
        dataset: "hpd_violations",
      },
    }),
  ]);

  const [hpdComplaints, hpdComplaintsMetadata] = await prisma.$transaction([
    prisma.hpd_complaints.findMany({
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
    }),
    prisma.metadata.findUnique({
      ...metadataSelectArgs,
      where: {
        dataset: "hpd_complaints",
      },
    }),
  ]);

  const [hpdLitigations, hpdLitigationsMetadata] = await prisma.$transaction([
    prisma.hpd_litigations.findMany({
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
    }),
    prisma.metadata.findUnique({
      ...metadataSelectArgs,
      where: {
        dataset: "hpd_litigations",
      },
    }),
  ]);

  const [hpdVacateOrders, hpdVacateOrdersMetadata] = await prisma.$transaction([
    prisma.hpd_vacateorders.findMany({
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
    }),
    prisma.metadata.findUnique({
      ...metadataSelectArgs,
      where: {
        dataset: "hpd_vacateorders",
      },
    }),
  ]);

  const [dobComplaints, dobComplaintsMetadata] = await prisma.$transaction([
    prisma.dob_complaints.findMany({
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
    }),
    prisma.metadata.findUnique({
      ...metadataSelectArgs,
      where: {
        dataset: "dob_complaints",
      },
    }),
  ]);

  const [dobViolations, dobViolationsMetadata] = await prisma.$transaction([
    prisma.dob_violations.findMany({
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
    }),
    prisma.metadata.findUnique({
      ...metadataSelectArgs,
      where: {
        dataset: "dob_violations",
      },
    }),
  ]);

  const [dobVacateOrders, dobVacateOrdersMetadata] = await prisma.$transaction([
    prisma.dob_vacate_orders.findMany({
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
    }),
    prisma.metadata.findUnique({
      ...metadataSelectArgs,
      where: {
        dataset: "dob_vacate_orders",
      },
    }),
  ]);

  res.status(200).json({
    plutoData,
    hpdViolations,
    hpdComplaints,
    hpdLitigations,
    hpdVacateOrders,
    dobViolations,
    dobComplaints,
    dobVacateOrders,
    metadata: {
      plutoData: plutoDataMetadata!,
      hpdViolations: hpdViolationsMetadata!,
      hpdComplaints: hpdComplaintsMetadata!,
      hpdLitigations: hpdLitigationsMetadata!,
      hpdVacateOrders: hpdVacateOrdersMetadata!,
      dobViolations: dobViolationsMetadata!,
      dobComplaints: dobComplaintsMetadata!,
      dobVacateOrders: dobVacateOrdersMetadata!,
    },
  });
}
