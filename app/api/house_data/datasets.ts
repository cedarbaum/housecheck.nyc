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
import { AddressSearchType } from "@/components/address-search-options";
import { boroughToBoro, boroughToBoroCode, boroughToCapitalizedBorough } from "@/lib/borough-utils";
import { formatDbTimeToISODate } from "@/lib/date-time";

export type DatasetParams = {
  streetname?: string;
  housenumber?: string;
  borough?: string;
  zipcode?: string;
  bbl?: string;
  bin?: string;
  searchTypes: Set<AddressSearchType>;
};

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
  | "number"
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

export function fetchPlutoData({ bbl }: DatasetParams) {
  return db.transaction(async (tx) => {
    const plutoData = bbl
      ? await tx
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

    const plutoMetadata = await tx
      .select()
      .from(metadata)
      .where(eq(metadata.dataset, "pluto_latest"))
      .limit(1);

    return {
      plutoData: plutoData?.[0] || null,
      plutoMetadata: plutoMetadata[0] || null,
    };
  });
}

export function fetchHpdViolations({ bbl, bin, streetname, borough, housenumber, searchTypes }: DatasetParams) {
  return db.transaction(async (tx) => {
    const hpdViolationsData = await tx
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
        and(
          or(
            bbl && searchTypes.has(AddressSearchType.BBL)
              ? eq(hpdViolations.bbl, bbl)
              : sql`FALSE`,
            bin && searchTypes.has(AddressSearchType.BIN)
              ? eq(hpdViolations.bin, bin)
              : sql`FALSE`,
            searchTypes.has(AddressSearchType.Address) &&
              streetname &&
              borough &&
              housenumber
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
              : sql`FALSE`,
          ),
        ),
      )
      .orderBy(desc(hpdViolations.inspectiondate));

    const hpdViolationsMetadata = await tx
      .select()
      .from(metadata)
      .where(eq(metadata.dataset, "hpd_violations"))
      .limit(1);

    return {
      hpdViolationsData,
      hpdViolationsMetadata: hpdViolationsMetadata[0] || null,
    };
  });
}

export function fetchHpdComplaints({ bbl, streetname, housenumber, borough, searchTypes }: DatasetParams) {
  return db.transaction(async (tx) => {
    const hpdComplaintsData = await tx
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
          bbl && searchTypes.has(AddressSearchType.BBL)
            ? eq(hpdComplaintsAndProblems.bbl, bbl)
            : sql`FALSE`,
          searchTypes.has(AddressSearchType.Address) &&
            streetname &&
            housenumber &&
            borough
            ? and(
                eq(hpdComplaintsAndProblems.streetname, streetname),
                eq(hpdComplaintsAndProblems.housenumber, housenumber),
                eq(hpdComplaintsAndProblems.borough, borough),
              )
            : sql`FALSE`,
        ),
      );

    hpdComplaintsData.sort((a, b) => {
      if (a.receiveddate === b.receiveddate) return 0;
      if (a.receiveddate === null) return 1;
      if (b.receiveddate === null) return -1;
      return a.receiveddate > b.receiveddate ? -1 : 1;
    });

    const hpdComplaintsMetadata = await tx
      .select()
      .from(metadata)
      .where(eq(metadata.dataset, "hpd_complaints"))
      .limit(1);

    return {
      hpdComplaintsData,
      hpdComplaintsMetadata: hpdComplaintsMetadata[0] || null,
    };
  });
}

export function fetchHpdLitigations({ bbl, bin, streetname, housenumber, borough, searchTypes }: DatasetParams) {
  return db.transaction(async (tx) => {
    const hpdLitigationsData = await tx
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
          bbl && searchTypes.has(AddressSearchType.BBL)
            ? eq(hpdLitigations.bbl, bbl)
            : sql`FALSE`,
          bin && searchTypes.has(AddressSearchType.BIN)
            ? eq(hpdLitigations.bin, bin)
            : sql`FALSE`,
          searchTypes.has(AddressSearchType.Address) &&
            streetname &&
            housenumber &&
            borough
            ? and(
                eq(hpdLitigations.streetname, streetname),
                eq(hpdLitigations.housenumber, housenumber),
                eq(hpdLitigations.boro, boroughToBoro(borough)),
              )
            : sql`FALSE`,
        ),
      )
      .orderBy(desc(hpdLitigations.caseopendate));

    const hpdLitigationsMetadata = await tx
      .select()
      .from(metadata)
      .where(eq(metadata.dataset, "hpd_litigations"))
      .limit(1);

    return {
      hpdLitigationsData,
      hpdLitigationsMetadata: hpdLitigationsMetadata[0] || null,
    };
  });
}

export function fetchHpdVacateOrders({ bbl, bin, streetname, housenumber, borough, searchTypes }: DatasetParams) {
  return db.transaction(async (tx) => {
    const hpdVacateOrdersData = await tx
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
          bbl && searchTypes.has(AddressSearchType.BBL)
            ? eq(hpdVacateorders.bbl, bbl)
            : sql`FALSE`,
          bin && searchTypes.has(AddressSearchType.BIN)
            ? eq(hpdVacateorders.bin, bin)
            : sql`FALSE`,
          searchTypes.has(AddressSearchType.Address) &&
            streetname &&
            housenumber &&
            borough
            ? and(
                eq(hpdVacateorders.street, streetname),
                eq(hpdVacateorders.number, housenumber),
                eq(hpdVacateorders.borough, boroughToBoroCode(borough)),
              )
            : sql`FALSE`,
        ),
      )
      .orderBy(desc(hpdVacateorders.vacateeffectivedate));

    const hpdVacateOrdersMetadata = await tx
      .select()
      .from(metadata)
      .where(eq(metadata.dataset, "hpd_vacateorders"))
      .limit(1);

    return {
      hpdVacateOrdersData,
      hpdVacateOrdersMetadata: hpdVacateOrdersMetadata[0] || null,
    };
  });
}

export function fetchDobComplaints({ bin, streetname, housenumber, zipcode, searchTypes }: DatasetParams) {
  return db.transaction(async (tx) => {
    const dobComplaintsData = await tx
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
          bin && searchTypes.has(AddressSearchType.BIN)
            ? eq(dobComplaints.bin, bin)
            : sql`FALSE`,
          searchTypes.has(AddressSearchType.Address) &&
            streetname &&
            housenumber &&
            zipcode
            ? and(
                eq(dobComplaints.housestreet, streetname),
                eq(dobComplaints.housenumber, housenumber),
                eq(dobComplaints.zipcode, zipcode),
              )
            : sql`FALSE`,
        ),
      )
      .orderBy(desc(dobComplaints.dateentered));

    const dobComplaintsMetadata = await tx
      .select()
      .from(metadata)
      .where(eq(metadata.dataset, "dob_complaints"))
      .limit(1);

    return {
      dobComplaintsData: postprocessDobComplaints(dobComplaintsData),
      dobComplaintsMetadata: dobComplaintsMetadata[0] || null,
    };
  });
}

function postprocessDobComplaints(complaints: DobComplaint[]): DobComplaint[] {
  // Go through all complaints and find the max date for each complaint number
  const maxDobRunDateForComplaint = new Map<number, string>();
  for (const complaint of complaints) {
    if (maxDobRunDateForComplaint.has(complaint.complaintnumber)) {
      const maxDate = maxDobRunDateForComplaint.get(complaint.complaintnumber)!;

      const parsedMaxDate = formatDbTimeToISODate(maxDate, "America/New_York");
      const parsedComplaintDate = formatDbTimeToISODate(
        complaint.dobrundate,
        "America/New_York",
      );

      if (!parsedMaxDate || !parsedComplaintDate) {
        continue;
      }

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


export function fetchDobViolations({ bbl, bin, streetname, housenumber, borough, searchTypes }: DatasetParams) {
  return db.transaction(async (tx) => {
    const dobViolationsData = await tx
      .select({
        number: dobViolations.number,
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
          bbl && searchTypes.has(AddressSearchType.BBL)
            ? eq(dobViolations.bbl, bbl)
            : sql`FALSE`,
          bin && searchTypes.has(AddressSearchType.BIN)
            ? eq(dobViolations.bin, bin)
            : sql`FALSE`,
          searchTypes.has(AddressSearchType.Address) &&
            streetname &&
            housenumber &&
            borough
            ? and(
                eq(dobViolations.street, streetname),
                eq(dobViolations.housenumber, housenumber),
                eq(dobViolations.boro, boroughToBoro(borough).toString()),
              )
            : sql`FALSE`,
        ),
      )
      .orderBy(desc(dobViolations.issuedate));

    const dobViolationsMetadata = await tx
      .select()
      .from(metadata)
      .where(eq(metadata.dataset, "dob_violations"))
      .limit(1);

    return {
      dobViolationsData,
      dobViolationsMetadata: dobViolationsMetadata[0] || null,
    };
  });
}

export function fetchDobVacateOrders({ bbl, streetname, housenumber, borough, zipcode, searchTypes }: DatasetParams) {
  return db.transaction(async (tx) => {
    const dobVacateOrdersData = await tx
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
          bbl && searchTypes.has(AddressSearchType.BBL)
            ? eq(dobVacateOrders.bbl, bbl)
            : sql`FALSE`,
          searchTypes.has(AddressSearchType.Address) &&
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
            : sql`FALSE`,
        ),
      )
      .orderBy(desc(dobVacateOrders.lastdispositiondatedateofissuanceofvacate));

    const dobVacateOrdersMetadata = await tx
      .select()
      .from(metadata)
      .where(eq(metadata.dataset, "dob_vacate_orders"))
      .limit(1);

    return {
      dobVacateOrdersData,
      dobVacateOrdersMetadata: dobVacateOrdersMetadata[0] || null,
    };
  });
} 