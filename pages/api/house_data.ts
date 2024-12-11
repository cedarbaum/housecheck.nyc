import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db/db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import {
  plutoLatest,
  hpdComplaintsAndProblems,
  dobComplaints,
  hpdViolations,
  dobViolations,
  hpdLitigations,
  hpdVacateorders,
  dobVacateOrders,
  metadata,
} from "@/db/migrations/schema";
import { AddressSearchType } from "@/components/AddressSearchOptions";
import { formatDbTimeToISODate } from "@/utils/DateTime";

// Define types for the responses
export type PlutoData = Pick<
  typeof plutoLatest.$inferSelect,
  | "address"
  | "ownername"
  | "numbldgs"
  | "numfloors"
  | "unitstotal"
  | "yearbuilt"
  | "version"
>;
export type HpdComplaint = Pick<
  typeof hpdComplaintsAndProblems.$inferSelect,
  | "complaintid"
  | "housenumber"
  | "streetname"
  | "apartment"
  | "receiveddate"
  | "complaintstatus"
>;
export type DobComplaint = Pick<
  typeof dobComplaints.$inferSelect,
  | "dobrundate"
  | "complaintnumber"
  | "housenumber"
  | "housestreet"
  | "complaintcategory"
  | "status"
  | "dateentered"
>;
export type HpdViolation = Pick<
  typeof hpdViolations.$inferSelect,
  | "violationid"
  | "housenumber"
  | "streetname"
  | "apartment"
  | "inspectiondate"
  | "novdescription"
  | "violationstatus"
>;

export type DobViolation = Pick<
  typeof dobViolations.$inferSelect,
  | "violationnumber"
  | "housenumber"
  | "street"
  | "issuedate"
  | "violationtypecode"
  | "violationcategory"
  | "violationtype"
  | "description"
>;
export type HpdLitigation = Pick<
  typeof hpdLitigations.$inferSelect,
  | "litigationid"
  | "housenumber"
  | "streetname"
  | "casetype"
  | "caseopendate"
  | "casestatus"
  | "penalty"
  | "findingofharassment"
>;
export type HpdVacateOrder = Pick<
  typeof hpdVacateorders.$inferSelect,
  | "vacateordernumber"
  | "number"
  | "street"
  | "vacateeffectivedate"
  | "vacatetype"
  | "primaryvacatereason"
  | "rescinddate"
  | "numberofvacatedunits"
>;

export type DobVacateOrder = Pick<
  typeof dobVacateOrders.$inferSelect,
  | "housenumber"
  | "streetname"
  | "boroughname"
  | "zipcode"
  | "lastdispositiondatedateofissuanceofvacate"
  | "complaintcategorydescription"
  | "lastdispositioncodedescription"
>;
export type Metadata = typeof metadata.$inferSelect;

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

function postprocessDobComplaints(complaints: DobComplaint[]): DobComplaint[] {
  // Go through all complaints and find the max date for each complaint number
  const maxDobRunDateForComplaint = new Map<number, string>();
  for (const complaint of complaints) {
    if (maxDobRunDateForComplaint.has(complaint.complaintnumber)) {
      const maxDate = maxDobRunDateForComplaint.get(complaint.complaintnumber)!;

      const parsedMaxDate = formatDbTimeToISODate(maxDate);
      const parsedComplaintDate = formatDbTimeToISODate(complaint.dobrundate);

      if (parsedComplaintDate > parsedMaxDate) {
        maxDobRunDateForComplaint.set(
          complaint.complaintnumber,
          complaint.dobrundate,
        );
      }
    } else {
      maxDobRunDateForComplaint.set(
        complaint.complaintnumber,
        complaint.dobrundate,
      );
    }
  }

  return complaints.filter(
    (c) => c.dobrundate === maxDobRunDateForComplaint.get(c.complaintnumber),
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HouseData | { error: string }>,
) {
  let { streetname, housenumber, borough, zipcode, bbl, bin, search_types } =
    req.query;

  search_types = search_types as string | undefined;
  const searchTypes = new Set<AddressSearchType>(
    search_types?.split(",").map((s) => s as AddressSearchType) ?? [],
  );

  streetname = (streetname as string).toUpperCase();
  housenumber = (housenumber as string).toUpperCase();
  borough = (borough as string).toUpperCase();
  zipcode = zipcode as string | undefined;
  bbl = bbl as string | undefined;
  bin = bin as string | undefined;

  const plutoData = bbl
    ? await db
        .select({
          address: plutoLatest.address,
          ownername: plutoLatest.ownername,
          numbldgs: plutoLatest.numbldgs,
          numfloors: plutoLatest.numfloors,
          unitstotal: plutoLatest.unitstotal,
          yearbuilt: plutoLatest.yearbuilt,
          version: plutoLatest.version,
        })
        .from(plutoLatest)
        .where(eq(plutoLatest.bbl, bbl))
        .limit(1)
    : null;
  const plutoMetadata = await db
    .select()
    .from(metadata)
    .where(eq(metadata.dataset, "pluto_latest"))
    .limit(1);

  const hpdViolationsData = await db
    .select({
      violationid: hpdViolations.violationid,
      housenumber: hpdViolations.housenumber,
      streetname: hpdViolations.streetname,
      apartment: hpdViolations.apartment,
      inspectiondate: hpdViolations.inspectiondate,
      novdescription: hpdViolations.novdescription,
      violationstatus: hpdViolations.violationstatus,
    })
    .from(hpdViolations)
    .where(
      or(
        bbl && searchTypes.has("bbl") ? eq(hpdViolations.bbl, bbl) : undefined,
        bin && searchTypes.has("bin") ? eq(hpdViolations.bin, bin) : undefined,
        searchTypes.has("address") && streetname && borough && housenumber
          ? and(
              eq(hpdViolations.streetname, streetname),
              eq(hpdViolations.borough, borough),
              or(
                and(
                  sql`${hpdViolations.lowhousenumber} <= ${housenumber}`,
                  sql`${hpdViolations.highhousenumber} >= ${housenumber}`,
                ),
                eq(hpdViolations.housenumber, housenumber),
              ),
            )
          : undefined,
      ),
    )
    .orderBy(desc(hpdViolations.inspectiondate));
  const hpdViolationsMetadata = await db
    .select()
    .from(metadata)
    .where(eq(metadata.dataset, "hpd_violations"))
    .limit(1);

  const hpdComplaintsData = await db
    .selectDistinctOn([hpdComplaintsAndProblems.complaintid], {
      complaintid: hpdComplaintsAndProblems.complaintid,
      housenumber: hpdComplaintsAndProblems.housenumber,
      streetname: hpdComplaintsAndProblems.streetname,
      apartment: hpdComplaintsAndProblems.apartment,
      receiveddate: hpdComplaintsAndProblems.receiveddate,
      complaintstatus: hpdComplaintsAndProblems.complaintstatus,
    })
    .from(hpdComplaintsAndProblems)
    .where(
      or(
        bbl && searchTypes.has("bbl")
          ? eq(hpdComplaintsAndProblems.bbl, bbl)
          : undefined,
        searchTypes.has("address") && streetname && housenumber && borough
          ? and(
              eq(hpdComplaintsAndProblems.streetname, streetname),
              eq(hpdComplaintsAndProblems.housenumber, housenumber),
              eq(hpdComplaintsAndProblems.borough, borough),
            )
          : undefined,
      ),
    );

  hpdComplaintsData.sort((a, b) => {
    if (a.receiveddate === b.receiveddate) {
      return 0;
    }

    if (a.receiveddate === null) {
      return 1;
    }

    if (b.receiveddate === null) {
      return -1;
    }

    return a.receiveddate > b.receiveddate ? -1 : 1;
  });

  const hpdComplaintsMetadata = await db
    .select()
    .from(metadata)
    .where(eq(metadata.dataset, "hpd_complaints"))
    .limit(1);

  const hpdLitigationsData = await db
    .select({
      litigationid: hpdLitigations.litigationid,
      housenumber: hpdLitigations.housenumber,
      streetname: hpdLitigations.streetname,
      casetype: hpdLitigations.casetype,
      caseopendate: hpdLitigations.caseopendate,
      casestatus: hpdLitigations.casestatus,
      penalty: hpdLitigations.penalty,
      findingofharassment: hpdLitigations.findingofharassment,
    })
    .from(hpdLitigations)
    .where(
      or(
        bbl && searchTypes.has("bbl") ? eq(hpdLitigations.bbl, bbl) : undefined,
        bin && searchTypes.has("bin") ? eq(hpdLitigations.bin, bin) : undefined,
        searchTypes.has("address") && streetname && housenumber && borough
          ? and(
              eq(hpdLitigations.streetname, streetname),
              eq(hpdLitigations.housenumber, housenumber),
              eq(hpdLitigations.boro, boroughToBoro(borough)),
            )
          : undefined,
      ),
    )
    .orderBy(desc(hpdLitigations.caseopendate));
  const hpdLitigationsMetadata = await db
    .select()
    .from(metadata)
    .where(eq(metadata.dataset, "hpd_litigations"))
    .limit(1);

  const hpdVacateOrdersData = await db
    .select({
      vacateordernumber: hpdVacateorders.vacateordernumber,
      number: hpdVacateorders.number,
      street: hpdVacateorders.street,
      vacateeffectivedate: hpdVacateorders.vacateeffectivedate,
      vacatetype: hpdVacateorders.vacatetype,
      primaryvacatereason: hpdVacateorders.primaryvacatereason,
      rescinddate: hpdVacateorders.rescinddate,
      numberofvacatedunits: hpdVacateorders.numberofvacatedunits,
    })
    .from(hpdVacateorders)
    .where(
      or(
        bbl && searchTypes.has("bbl")
          ? eq(hpdVacateorders.bbl, bbl)
          : undefined,
        bin && searchTypes.has("bin")
          ? eq(hpdVacateorders.bin, bin)
          : undefined,
        searchTypes.has("address") && streetname && housenumber && borough
          ? and(
              eq(hpdVacateorders.street, streetname),
              eq(hpdVacateorders.number, housenumber),
              eq(hpdVacateorders.borough, boroughToBoroCode(borough)),
            )
          : undefined,
      ),
    )
    .orderBy(desc(hpdVacateorders.vacateeffectivedate));

  const hpdVacateOrdersMetadata = await db
    .select()
    .from(metadata)
    .where(eq(metadata.dataset, "hpd_vacateorders"))
    .limit(1);

  const dobComplaintsData = await db
    .select({
      dobrundate: dobComplaints.dobrundate,
      complaintnumber: dobComplaints.complaintnumber,
      housenumber: dobComplaints.housenumber,
      housestreet: dobComplaints.housestreet,
      complaintcategory: dobComplaints.complaintcategory,
      status: dobComplaints.status,
      dateentered: dobComplaints.dateentered,
    })
    .from(dobComplaints)
    .where(
      or(
        bin && searchTypes.has("bin") ? eq(dobComplaints.bin, bin) : undefined,
        searchTypes.has("address") && streetname && housenumber && zipcode
          ? and(
              eq(dobComplaints.housestreet, streetname),
              eq(dobComplaints.housenumber, housenumber),
              eq(dobComplaints.zipcode, zipcode),
            )
          : undefined,
      ),
    )
    .orderBy(desc(dobComplaints.dateentered));

  const dobComplaintsMetadata = await db
    .select()
    .from(metadata)
    .where(eq(metadata.dataset, "dob_complaints"))
    .limit(1);

  const dobViolationsData = await db
    .select({
      violationnumber: dobViolations.violationnumber,
      housenumber: dobViolations.housenumber,
      street: dobViolations.street,
      issuedate: dobViolations.issuedate,
      violationtypecode: dobViolations.violationtypecode,
      violationcategory: dobViolations.violationcategory,
      violationtype: dobViolations.violationtype,
      description: dobViolations.description,
    })
    .from(dobViolations)
    .where(
      or(
        bbl && searchTypes.has("bbl") ? eq(dobViolations.bbl, bbl) : undefined,
        bin && searchTypes.has("bin") ? eq(dobViolations.bin, bin) : undefined,
        searchTypes.has("address") && streetname && housenumber && borough
          ? and(
              eq(dobViolations.street, streetname),
              eq(dobViolations.housenumber, housenumber),
              eq(dobViolations.boro, boroughToBoro(borough).toString()),
            )
          : undefined,
      ),
    )
    .orderBy(desc(dobViolations.issuedate));

  const dobViolationsMetadata = await db
    .select()
    .from(metadata)
    .where(eq(metadata.dataset, "dob_violations"))
    .limit(1);

  const dobVacateOrdersData = await db
    .select({
      housenumber: dobVacateOrders.housenumber,
      streetname: dobVacateOrders.streetname,
      boroughname: dobVacateOrders.boroughname,
      zipcode: dobVacateOrders.zipcode,
      lastdispositiondatedateofissuanceofvacate:
        dobVacateOrders.lastdispositiondatedateofissuanceofvacate,
      complaintcategorydescription:
        dobVacateOrders.complaintcategorydescription,
      lastdispositioncodedescription:
        dobVacateOrders.lastdispositioncodedescription,
    })
    .from(dobVacateOrders)
    .where(
      or(
        bbl && searchTypes.has("bbl")
          ? eq(dobVacateOrders.bbl, bbl)
          : undefined,
        searchTypes.has("address") &&
          streetname &&
          housenumber &&
          borough &&
          zipcode
          ? and(
              eq(dobVacateOrders.streetname, streetname),
              eq(dobVacateOrders.housenumber, housenumber),
              eq(
                dobVacateOrders.boroughname,
                boroughToCapitalizedBorough(borough),
              ),
              eq(dobVacateOrders.zipcode, zipcode),
            )
          : undefined,
      ),
    )
    .orderBy(desc(dobVacateOrders.lastdispositiondatedateofissuanceofvacate));

  const dobVacateOrdersMetadata = await db
    .select()
    .from(metadata)
    .where(eq(metadata.dataset, "dob_vacate_orders"))
    .limit(1);

  res.status(200).json({
    plutoData: plutoData ? plutoData[0] : null,
    hpdViolations: hpdViolationsData,
    hpdComplaints: hpdComplaintsData,
    hpdLitigations: hpdLitigationsData,
    hpdVacateOrders: hpdVacateOrdersData,
    dobViolations: dobViolationsData,
    dobComplaints: postprocessDobComplaints(dobComplaintsData),
    dobVacateOrders: dobVacateOrdersData,
    metadata: {
      plutoData: plutoMetadata[0]!,
      hpdViolations: hpdViolationsMetadata[0]!,
      hpdComplaints: hpdComplaintsMetadata[0]!,
      hpdLitigations: hpdLitigationsMetadata[0]!,
      hpdVacateOrders: hpdVacateOrdersMetadata[0]!,
      dobViolations: dobViolationsMetadata[0]!,
      dobComplaints: dobComplaintsMetadata[0]!,
      dobVacateOrders: dobVacateOrdersMetadata[0]!,
    },
  });
}
