import { HouseData } from "@/app/api/house_data/route";
import { HpdComplaintProblems } from "@/app/api/hpd_complaint_problems/route";
import { AddressSearchType } from "@/components/address-search-options";
import { ReactNode } from "react";
import { InfoCallout } from "@/components/callouts";
import Link from "next/link";

export function getSectionMetadataForDataSource(
  dataSource: Exclude<keyof HouseData | keyof HpdComplaintProblems, "metadata">,
): {
  title: string;
  noDataDescription: string;
  validSearchTypes: Set<AddressSearchType>;
  notifications?: (
    bbl: string | null | undefined,
    bin: string | null | undefined,
  ) => ReactNode[];
} {
  switch (dataSource) {
    case "plutoData":
      return {
        title: "PLUTO data",
        noDataDescription: "No PLUTO data found for this address",
        validSearchTypes: new Set<AddressSearchType>([AddressSearchType.BBL]),
      };
    case "hpdViolations":
      return {
        title: "HPD violations",
        noDataDescription: "No HPD violations found for this address",
        validSearchTypes: new Set<AddressSearchType>([
          AddressSearchType.BBL,
          AddressSearchType.BIN,
          AddressSearchType.Address,
        ]),
      };
    case "hpdComplaints":
      return {
        title: "HPD complaints",
        noDataDescription: "No HPD complaints found for this address",
        validSearchTypes: new Set<AddressSearchType>([
          AddressSearchType.BBL,
          AddressSearchType.Address,
        ]),
      };
    case "hpdLitigations":
      return {
        title: "HPD litigations",
        noDataDescription: "No HPD litigations found for this address",
        validSearchTypes: new Set<AddressSearchType>([
          AddressSearchType.BBL,
          AddressSearchType.BIN,
          AddressSearchType.Address,
        ]),
      };
    case "hpdVacateOrders":
      return {
        title: "HPD vacate orders",
        noDataDescription: "No HPD vacate orders found for this address",
        validSearchTypes: new Set<AddressSearchType>([
          AddressSearchType.BBL,
          AddressSearchType.BIN,
          AddressSearchType.Address,
        ]),
      };
    case "dobViolations":
      return {
        title: "DOB violations",
        noDataDescription: "No DOB violations found for this address",
        validSearchTypes: new Set<AddressSearchType>([
          AddressSearchType.BBL,
          AddressSearchType.BIN,
          AddressSearchType.Address,
        ]),
        notifications: (_bbl, bin) => {
          if (!bin) {
            return [];
          }

          const athEcsViolationsCallout = (
            <InfoCallout
              text={
                <Link
                  href={`https://a810-bisweb.nyc.gov/bisweb/ECBQueryByLocationServlet?allbin=${bin}`}
                  target="_blank"
                >
                  OATH/ECB Violations for BIN
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              }
            />
          );
          return [athEcsViolationsCallout];
        },
      };
    case "dobComplaints":
      return {
        title: "DOB complaints",
        noDataDescription: "No DOB complaints found for this address",
        validSearchTypes: new Set<AddressSearchType>([
          AddressSearchType.BIN,
          AddressSearchType.Address,
        ]),
      };
    case "dobVacateOrders":
      return {
        title: "DOB vacate orders",
        noDataDescription: "No DOB vacate orders found for this address",
        validSearchTypes: new Set<AddressSearchType>([
          AddressSearchType.BBL,
          AddressSearchType.Address,
        ]),
      };
    case "hpdComplaintProblems":
      return {
        title: "HPD complaint problems",
        noDataDescription:
          "No HPD complaint problems found for this complaint ID",
        validSearchTypes: new Set<AddressSearchType>([]),
      };
    default:
      return { title: "", noDataDescription: "", validSearchTypes: new Set() };
  }
}
