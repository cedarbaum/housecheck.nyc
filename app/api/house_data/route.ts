import { NextResponse } from "next/server";
import { AddressSearchType } from "@/components/address-search-options";
import { HpdViolation,
  HpdComplaint,
  HpdLitigation,
  HpdVacateOrder,
  DobViolation,
  DobComplaint,
  DobVacateOrder,
  PlutoData,
  Metadata,
  DatasetParams,
  fetchPlutoData,
  fetchHpdViolations,
  fetchHpdComplaints,
  fetchHpdLitigations,
  fetchHpdVacateOrders,
  fetchDobViolations,
  fetchDobComplaints,
  fetchDobVacateOrders,
} from "./datasets";

export type HouseData = {
  plutoData: PlutoData | null;
  hpdViolations: HpdViolation[];
  hpdComplaints: HpdComplaint[];
  hpdLitigations: HpdLitigation[];
  hpdVacateOrders: HpdVacateOrder[];
  dobViolations: DobViolation[];
  dobComplaints: DobComplaint[];
  dobVacateOrders: DobVacateOrder[];
  metadata?: Record<Exclude<keyof HouseData, "metadata">, Metadata | null>;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const streetname = searchParams.get("streetname")?.toUpperCase();
  const housenumber = searchParams.get("housenumber")?.toUpperCase();
  const borough = searchParams.get("borough")?.toUpperCase();
  const zipcode = searchParams.get("zipcode") || undefined;
  const bbl = searchParams.get("bbl") || undefined;
  const bin = searchParams.get("bin") || undefined;
  const search_types = searchParams.get("search_types") || undefined;

  const datasetParams: DatasetParams = {
    streetname,
    housenumber,
    borough,
    zipcode,
    bbl,
    bin,
    searchTypes: new Set(search_types?.split(",") || []) as Set<AddressSearchType>,
  }

  // HACK: Fetch Pluto data first to warmup DB
  let startTime = performance.now();
  const {plutoData, plutoMetadata} = await fetchPlutoData(datasetParams);
  let endTime = performance.now();
  console.log(`Time taken for Pluto data: ${endTime - startTime} milliseconds`);

  // Fetch remaining datasets in parallel
  startTime = performance.now();
  const [
    { hpdViolationsData, hpdViolationsMetadata },
    { hpdComplaintsData, hpdComplaintsMetadata },
    { hpdLitigationsData, hpdLitigationsMetadata },
    { hpdVacateOrdersData, hpdVacateOrdersMetadata },
    { dobViolationsData, dobViolationsMetadata },
    { dobComplaintsData, dobComplaintsMetadata },
    { dobVacateOrdersData, dobVacateOrdersMetadata },
  ] = await Promise.all([
    fetchHpdViolations(datasetParams),
    fetchHpdComplaints(datasetParams),
    fetchHpdLitigations(datasetParams),
    fetchHpdVacateOrders(datasetParams),
    fetchDobViolations(datasetParams),
    fetchDobComplaints(datasetParams),
    fetchDobVacateOrders(datasetParams),
  ]);
  endTime = performance.now();
  console.log(`Time taken for all datasets: ${endTime - startTime} milliseconds`);

  return NextResponse.json<HouseData>({
    plutoData: plutoData,
    hpdViolations: hpdViolationsData,
    hpdComplaints: hpdComplaintsData,
    hpdLitigations: hpdLitigationsData,
    hpdVacateOrders: hpdVacateOrdersData,
    dobViolations: dobViolationsData,
    dobComplaints: dobComplaintsData,
    dobVacateOrders: dobVacateOrdersData,
    metadata: {
      plutoData: plutoMetadata,
      hpdViolations: hpdViolationsMetadata,
      hpdComplaints: hpdComplaintsMetadata,
      hpdLitigations: hpdLitigationsMetadata,
      hpdVacateOrders: hpdVacateOrdersMetadata,
      dobViolations: dobViolationsMetadata,
      dobComplaints: dobComplaintsMetadata,
      dobVacateOrders: dobVacateOrdersMetadata,
    },
  });
}
