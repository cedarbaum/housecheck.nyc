import {
  DobComplaint,
  DobVacateOrder,
  DobViolation,
  HpdComplaint,
  HpdLitigation,
  HpdVacateOrder,
  HpdViolation,
  PlutoData,
} from "@/pages/api/house_data";
import { Column, DefaultSortTypes } from "react-table";
import { HouseData } from "@/pages/api/house_data";
import { DateTime } from "luxon";
import Link from "next/link";
import {
  HpdComplaintProblem,
  HpdComplaintProblems,
} from "@/pages/api/hpd_complaint_problems";
import { dobComplaintCodeToDescAndPriorityMap } from "./DobComplaintCodes";
import { AddressSearchType } from "@/components/AddressSearchOptions";
import { ReactNode } from "react";
import { InfoCallout } from "@/components/Callouts";

const DATE_MIN_VALUE = -8640000000000000;

export enum DataSources {
  PLUTO = "pluto",
  HPD_VIOLATIONS = "hpd_violations",
}

enum ColumnDataTypes {
  STRING = "string",
  NUMBER = "number",
  DATE = "date",
}

function columnDataTypeToSortType(dataType: ColumnDataTypes): DefaultSortTypes {
  switch (dataType) {
    case ColumnDataTypes.NUMBER:
      return "basic";
    case ColumnDataTypes.DATE:
      return "datetime";
    case ColumnDataTypes.STRING:
    default:
      return "alphanumeric";
  }
}

type ColumnMetadata<T extends object> = {
  Header: string;
  dataType: ColumnDataTypes;
} & Column<T>;

const plutoColumnMetadata: Map<
  keyof PlutoData,
  ColumnMetadata<PlutoData>
> = new Map([
  [
    "address",
    { Header: "Address (tax lot)", dataType: ColumnDataTypes.STRING },
  ],
  ["ownername", { Header: "Owner", dataType: ColumnDataTypes.STRING }],
  ["numbldgs", { Header: "# buildings", dataType: ColumnDataTypes.NUMBER }],
  ["numfloors", { Header: "# floors", dataType: ColumnDataTypes.NUMBER }],
  ["unitstotal", { Header: "# units", dataType: ColumnDataTypes.NUMBER }],
  ["yearbuilt", { Header: "Year built", dataType: ColumnDataTypes.NUMBER }],
]);

const hpdViolationColumnMetadata: Map<
  keyof HpdViolation | "address",
  ColumnMetadata<HpdViolation>
> = new Map([
  ["violationid", { Header: "Violation ID", dataType: ColumnDataTypes.NUMBER }],
  [
    "address",
    {
      Header: "Address",
      dataType: ColumnDataTypes.STRING,
      accessor: (row: HpdViolation) => row.housenumber + " " + row.streetname,
    },
  ],
  ["apartment", { Header: "Apartment", dataType: ColumnDataTypes.STRING }],
  [
    "inspectiondate",
    { Header: "Inspection date", dataType: ColumnDataTypes.DATE },
  ],
  [
    "novdescription",
    { Header: "Description", dataType: ColumnDataTypes.STRING },
  ],
  ["violationstatus", { Header: "Status", dataType: ColumnDataTypes.STRING }],
]);

const hpdComplaintColumnMetadata: Map<
  keyof HpdComplaint | "address",
  ColumnMetadata<HpdComplaint>
> = new Map([
  [
    "complaintid",
    {
      Header: "Complaint ID",
      dataType: ColumnDataTypes.NUMBER,

      Cell: ({ cell: { value } }: any) => (
        <Link href={`/hpdcomplaint/${value}`}>{value}</Link>
      ),
    },
  ],
  [
    "address",
    {
      Header: "Address",
      dataType: ColumnDataTypes.STRING,
      accessor: (row: HpdComplaint) => row.housenumber + " " + row.streetname,
    },
  ],
  ["apartment", { Header: "Apartment", dataType: ColumnDataTypes.STRING }],
  ["receiveddate", { Header: "Received date", dataType: ColumnDataTypes.DATE }],
  ["status", { Header: "Status", dataType: ColumnDataTypes.STRING }],
]);

const hpdLitigationsColumnMetadata: Map<
  keyof HpdLitigation | "address",
  ColumnMetadata<HpdLitigation>
> = new Map([
  [
    "litigationid",
    { Header: "Complaint ID", dataType: ColumnDataTypes.NUMBER },
  ],
  [
    "address",
    {
      Header: "Address",
      dataType: ColumnDataTypes.STRING,
      accessor: (row: HpdLitigation) => row.housenumber + " " + row.streetname,
    },
  ],
  ["casetype", { Header: "Apartment", dataType: ColumnDataTypes.STRING }],
  ["casestatus", { Header: "Status", dataType: ColumnDataTypes.STRING }],
  ["caseopendate", { Header: "Opened", dataType: ColumnDataTypes.DATE }],
  ["penalty", { Header: "Penalty", dataType: ColumnDataTypes.STRING }],
  [
    "findingofharassment",
    {
      Header: "Finding of harassment",
      dataType: ColumnDataTypes.STRING,
    },
  ],
]);

const hpdVacateOrdersColumnMetadata: Map<
  keyof HpdVacateOrder | "address",
  ColumnMetadata<HpdVacateOrder>
> = new Map([
  [
    "vacateordernumber",
    { Header: "Vacate order number", dataType: ColumnDataTypes.NUMBER },
  ],
  [
    "address",
    {
      Header: "Address",
      dataType: ColumnDataTypes.STRING,
      accessor: (row: HpdVacateOrder) => row.number + " " + row.street,
    },
  ],
  [
    "vacateeffectivedate",
    { Header: "Effective date", dataType: ColumnDataTypes.DATE },
  ],
  ["vacatetype", { Header: "Type", dataType: ColumnDataTypes.STRING }],
  [
    "primaryvacatereason",
    { Header: "Reason", dataType: ColumnDataTypes.STRING },
  ],
  ["rescinddate", { Header: "Rescind date", dataType: ColumnDataTypes.DATE }],
  [
    "numberofvacatedunits",
    { Header: "# units", dataType: ColumnDataTypes.NUMBER },
  ],
]);

const dobViolationsColumnMetadata: Map<
  keyof DobViolation | "address",
  ColumnMetadata<DobViolation>
> = new Map([
  ["number", { Header: "Number", dataType: ColumnDataTypes.STRING }],
  [
    "address",
    {
      Header: "Address",
      dataType: ColumnDataTypes.STRING,
      accessor: (row: DobViolation) => row.housenumber + " " + row.street,
    },
  ],
  ["issuedate", { Header: "Issue date", dataType: ColumnDataTypes.DATE }],
  [
    "violationnumber",
    { Header: "Violation number", dataType: ColumnDataTypes.STRING },
  ],
  [
    "violationtypecode",
    { Header: "Violation type code", dataType: ColumnDataTypes.STRING },
  ],
  [
    "violationcategory",
    { Header: "Violation category", dataType: ColumnDataTypes.STRING },
  ],
  [
    "violationtype",
    { Header: "Violation type", dataType: ColumnDataTypes.STRING },
  ],
  ["description", { Header: "Description", dataType: ColumnDataTypes.STRING }],
]);

const dobComplaintsColumnMetadata: Map<
  keyof DobComplaint | "address",
  ColumnMetadata<DobComplaint>
> = new Map([
  [
    "complaintnumber",
    {
      Header: "Number",
      dataType: ColumnDataTypes.NUMBER,
      Cell: ({ cell: { value } }: any) => (
        <a
          href={`https://a810-bisweb.nyc.gov/bisweb/OverviewForComplaintServlet?complaintno=${value}`}
          target="_blank"
        >
          {value}
        </a>
      ),
    },
  ],
  [
    "address",
    {
      Header: "Address",
      dataType: ColumnDataTypes.STRING,
      accessor: (row: DobComplaint) => row.housenumber + " " + row.housestreet,
    },
  ],
  [
    "complaintcategory",
    {
      Header: "Category",
      dataType: ColumnDataTypes.STRING,
      accessor: (row: DobComplaint) => {
        const complaintDesc = dobComplaintCodeToDescAndPriorityMap.get(
          row.complaintcategory ?? ""
        );

        if (!complaintDesc) {
          return row.complaintcategory;
        }

        return `${row.complaintcategory} - ${complaintDesc[0]}`;
      },
    },
  ],
  ["status", { Header: "Status", dataType: ColumnDataTypes.STRING }],
  ["dateentered", { Header: "Date entered", dataType: ColumnDataTypes.DATE }],
]);

const dobVacateOrdersColumnMetadata: Map<
  keyof DobVacateOrder | "address",
  ColumnMetadata<DobVacateOrder>
> = new Map([
  [
    "address",
    {
      Header: "Address",
      dataType: ColumnDataTypes.STRING,
      accessor: (row: DobVacateOrder) => row.housenumber + " " + row.streetname,
    },
  ],
  [
    "lastdispositiondate",
    { Header: "Last disposition date", dataType: ColumnDataTypes.DATE },
  ],
  [
    "lastdispositioncodedescription",
    {
      Header: "Last disposition description",
      dataType: ColumnDataTypes.STRING,
    },
  ],
  [
    "complaintcategorydescription",
    {
      Header: "Complaint category description",
      dataType: ColumnDataTypes.STRING,
    },
  ],
]);

const hpdComplaintProblemsColumnMetadata: Map<
  keyof HpdComplaintProblem,
  ColumnMetadata<HpdComplaintProblem>
> = new Map([
  ["problemid", { Header: "Problem ID", dataType: ColumnDataTypes.NUMBER }],
  ["unittype", { Header: "Unit type", dataType: ColumnDataTypes.STRING }],
  ["spacetype", { Header: "Space type", dataType: ColumnDataTypes.STRING }],
  [
    "majorcategory",
    { Header: "Major category", dataType: ColumnDataTypes.STRING },
  ],
  [
    "minorcategory",
    { Header: "Minor category", dataType: ColumnDataTypes.STRING },
  ],
  ["code", { Header: "Code", dataType: ColumnDataTypes.STRING }],
  ["status", { Header: "Status", dataType: ColumnDataTypes.STRING }],
  ["statusdescription", { Header: "Status", dataType: ColumnDataTypes.STRING }],
  ["statusdate", { Header: "Status date", dataType: ColumnDataTypes.DATE }],
]);

const dataSourceToHeaders = new Map<
  Exclude<keyof HouseData | keyof HpdComplaintProblems, "metadata">,
  Map<string, any>
>([
  ["plutoData", plutoColumnMetadata],
  ["hpdViolations", hpdViolationColumnMetadata],
  ["hpdComplaints", hpdComplaintColumnMetadata],
  ["hpdLitigations", hpdLitigationsColumnMetadata],
  ["hpdVacateOrders", hpdVacateOrdersColumnMetadata],
  ["dobViolations", dobViolationsColumnMetadata],
  ["dobComplaints", dobComplaintsColumnMetadata],
  ["dobVacateOrders", dobVacateOrdersColumnMetadata],
  ["hpdComplaintProblems", hpdComplaintProblemsColumnMetadata],
]);

export function getSectionMetadataForDataSource(
  dataSource: Exclude<keyof HouseData | keyof HpdComplaintProblems, "metadata">
): {
  title: string;
  noDataDescription: string;
  validSearchTypes: Set<AddressSearchType>;
  notifications?: (
    bbl: string | null | undefined,
    bin: string | null | undefined
  ) => ReactNode[];
} {
  switch (dataSource) {
    case "plutoData":
      return {
        title: "PLUTO data",
        noDataDescription: "No PLUTO data found for this address",
        validSearchTypes: new Set<AddressSearchType>(["bbl"]),
      };
    case "hpdViolations":
      return {
        title: "HPD violations",
        noDataDescription: "No HPD violations found for this address",
        validSearchTypes: new Set<AddressSearchType>(["bbl", "bin", "address"]),
      };
    case "hpdComplaints":
      return {
        title: "HPD complaints",
        noDataDescription: "No HPD complaints found for this address",
        validSearchTypes: new Set<AddressSearchType>(["bbl", "address"]),
      };
    case "hpdLitigations":
      return {
        title: "HPD litigations",
        noDataDescription: "No HPD litigations found for this address",
        validSearchTypes: new Set<AddressSearchType>(["bbl", "bin", "address"]),
      };
    case "hpdVacateOrders":
      return {
        title: "HPD vacate orders",
        noDataDescription: "No HPD vacate orders found for this address",
        validSearchTypes: new Set<AddressSearchType>(["bbl", "bin", "address"]),
      };
    case "dobViolations":
      return {
        title: "DOB violations",
        noDataDescription: "No DOB violations found for this address",
        validSearchTypes: new Set<AddressSearchType>(["bbl", "bin", "address"]),
        notifications: (bbl, bin) => {
          if (!bin) {
            return [];
          }

          const athEcsViolationsCallout = (
            <InfoCallout
              text={
                <a
                  href={`https://a810-bisweb.nyc.gov/bisweb/ECBQueryByLocationServlet?allbin=${bin}`}
                  target="_blank"
                >
                  OATH/ECB Violations for BIN
                  <span aria-hidden="true"> &rarr;</span>
                </a>
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
        validSearchTypes: new Set<AddressSearchType>(["bin", "address"]),
      };
    case "dobVacateOrders":
      return {
        title: "DOB vacate orders",
        noDataDescription: "No DOB vacate orders found for this address",
        validSearchTypes: new Set<AddressSearchType>(["bbl", "address"]),
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

export function getColumnsForDataSource(
  dataSource: Exclude<keyof HouseData | keyof HpdComplaintProblems, "metadata">
): Column<any>[] {
  const headers = dataSourceToHeaders.get(dataSource);
  if (!headers) {
    throw new Error(`No headers found for data source ${dataSource}`);
  }

  // @ts-ignore
  return Array.from(headers).map(([key, { dataType, ...rest }]) => ({
    accessor:
      dataType === ColumnDataTypes.DATE
        ? (row: any) => getDateAccessor(row, key)
        : key,
    sortType: columnDataTypeToSortType(dataType),
    ...(dataType === ColumnDataTypes.DATE && {
      Cell: ({ cell: { value } }) => <div>{formatDate(value)}</div>,
    }),
    ...rest,
  }));
}

function getDateAccessor(row: any, accessor: string): Date {
  const value = row[accessor] as Date | null;
  if (!value) {
    return new Date(DATE_MIN_VALUE);
  }

  return value;
}

function formatDate(date: Date | null): string {
  if (!date || date.getTime() <= DATE_MIN_VALUE) {
    return "";
  }

  return DateTime.fromJSDate(date).toUTC().toFormat("yyyy-MM-dd");
}
