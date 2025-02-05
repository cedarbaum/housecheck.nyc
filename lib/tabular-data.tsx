import {
  DobComplaint,
  DobVacateOrder,
  DobViolation,
  HpdComplaint,
  HpdLitigation,
  HpdVacateOrder,
  HpdViolation,
  PlutoData,
} from "@/app/api/house_data/datasets";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { DateTime } from "luxon";
import Link from "next/link";
import {
  HpdComplaintProblem,
  HpdComplaintProblems,
} from "@/app/api/hpd_complaint_problems/route";
import { dobComplaintCodeToDescAndPriorityMap } from "@/lib/dob-complaint-codes";
import { formatDbTimeToISODate } from "@/lib/date-time";
import { HouseData } from "@/app/api/house_data/route";

const DATE_MIN_VALUE = -8640000000000000;

const plutoColumnsHelper = createColumnHelper<PlutoData>();
export const plutoColumns = [
  plutoColumnsHelper.accessor("address", {
    header: "Address (tax lot)",
  }),
  plutoColumnsHelper.accessor("ownername", {
    header: "Owner",
  }),
  plutoColumnsHelper.accessor("numbldgs", {
    header: "# buildings",
  }),
  plutoColumnsHelper.accessor("numfloors", {
    header: "# floors",
  }),
  plutoColumnsHelper.accessor("unitstotal", {
    header: "# units",
  }),
  plutoColumnsHelper.accessor("yearbuilt", {
    header: "Year built",
  }),
];

const hptViolationsColumnsHelper = createColumnHelper<HpdViolation>();
const hpdViolationsColumns = [
  hptViolationsColumnsHelper.accessor("violationid", {
    header: "Violation ID",
  }),
  hptViolationsColumnsHelper.accessor(
    (row) => row.housenumber + " " + row.streetname,
    {
      id: "address",
      header: "Address",
    },
  ),
  hptViolationsColumnsHelper.accessor("apartment", {
    header: "Apartment",
  }),
  hptViolationsColumnsHelper.accessor(
    (row) => formatDbTimeToISODate(row.inspectiondate, "America/New_York"),
    {
      id: "inspectiondate",
      header: "Inspection date",
      cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
    },
  ),
  hptViolationsColumnsHelper.accessor("novdescription", {
    header: "Description",
  }),
  hptViolationsColumnsHelper.accessor("violationstatus", {
    header: "Status",
  }),
];

const hpdComplaintColumnsHelper = createColumnHelper<HpdComplaint>();
const hpdComplaintColumns = [
  hpdComplaintColumnsHelper.accessor("complaintid", {
    header: "Complaint ID",
    cell: ({ getValue }) => (
      <Link href={`/hpdcomplaint/${getValue()}`}>{getValue()}</Link>
    ),
  }),
  hpdComplaintColumnsHelper.accessor(
    (row) => row.housenumber + " " + row.streetname,
    {
      id: "address",
      header: "Address",
    },
  ),
  hpdComplaintColumnsHelper.accessor("apartment", {
    header: "Apartment",
  }),
  hpdComplaintColumnsHelper.accessor(
    (row) => formatDbTimeToISODate(row.receiveddate, "America/New_York"),
    {
      id: "receiveddate",
      header: "Received date",
      cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
    },
  ),
  hpdComplaintColumnsHelper.accessor("complaintstatus", {
    header: "Status",
  }),
];

const hpdLitigationsColumnsHelper = createColumnHelper<HpdLitigation>();
const hpdLitigationsColumns = [
  hpdLitigationsColumnsHelper.accessor("litigationid", {
    header: "Complaint ID",
  }),
  hpdLitigationsColumnsHelper.accessor(
    (row) => row.housenumber + " " + row.streetname,
    {
      id: "address",
      header: "Address",
    },
  ),
  hpdLitigationsColumnsHelper.accessor("casetype", {
    header: "Apartment",
  }),
  hpdLitigationsColumnsHelper.accessor("casestatus", {
    header: "Status",
  }),
  hpdLitigationsColumnsHelper.accessor(
    (row) => formatDbTimeToISODate(row.caseopendate, "America/New_York"),
    {
      id: "caseopendate",
      header: "Opened",
      cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
    },
  ),
  hpdLitigationsColumnsHelper.accessor("penalty", {
    header: "Penalty",
  }),
  hpdLitigationsColumnsHelper.accessor("findingofharassment", {
    header: "Finding of harassment",
  }),
];

const hpdVacateOrdersColumnsHelper = createColumnHelper<HpdVacateOrder>();
const hpdVacateOrdersColumns = [
  hpdVacateOrdersColumnsHelper.accessor("vacateordernumber", {
    header: "Vacate order number",
  }),
  hpdVacateOrdersColumnsHelper.accessor(
    (row) => row.number + " " + row.street,
    {
      id: "address",
      header: "Address",
    },
  ),
  hpdVacateOrdersColumnsHelper.accessor(
    (row) => formatDbTimeToISODate(row.vacateeffectivedate, "America/New_York"),
    {
      id: "vacateeffectivedate",
      header: "Effective date",
      cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
    },
  ),
  hpdVacateOrdersColumnsHelper.accessor("vacatetype", {
    header: "Type",
  }),
  hpdVacateOrdersColumnsHelper.accessor("primaryvacatereason", {
    header: "Reason",
  }),
  hpdVacateOrdersColumnsHelper.accessor(
    (row) => formatDbTimeToISODate(row.rescinddate, "America/New_York"),
    {
      id: "rescinddate",
      header: "Rescind date",
      cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
    },
  ),
  hpdVacateOrdersColumnsHelper.accessor("numberofvacatedunits", {
    header: "# units",
  }),
];

const dobViolationsColumnsHelper = createColumnHelper<DobViolation>();
const dobViolationsColumns = [
  dobViolationsColumnsHelper.accessor("number", {
    header: "Number",
  }),
  dobViolationsColumnsHelper.accessor(
    (row) => row.housenumber + " " + row.street,
    {
      id: "address",
      header: "Address",
    },
  ),
  dobViolationsColumnsHelper.accessor(
    (row) => formatDbTimeToISODate(row.issuedate, "America/New_York"),
    {
      id: "issuedate",
      header: "Issue date",
      cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
    },
  ),
  dobViolationsColumnsHelper.accessor("violationnumber", {
    header: "Violation number",
  }),
  dobViolationsColumnsHelper.accessor("violationtypecode", {
    header: "Violation type code",
  }),
  dobViolationsColumnsHelper.accessor("violationcategory", {
    header: "Violation category",
  }),
  dobViolationsColumnsHelper.accessor("violationtype", {
    header: "Violation type",
  }),
  dobViolationsColumnsHelper.accessor("description", {
    header: "Description",
  }),
];

const dobComplaintsColumnsHelper = createColumnHelper<DobComplaint>();
const dobComplaintsColumns = [
  dobComplaintsColumnsHelper.accessor("complaintnumber", {
    header: "Number",
    cell: ({ getValue }) => (
      <Link
        href={`https://a810-bisweb.nyc.gov/bisweb/OverviewForComplaintServlet?complaintno=${getValue()}`}
        target="_blank"
      >
        {getValue()}
      </Link>
    ),
  }),
  dobComplaintsColumnsHelper.accessor(
    (row) => row.housenumber + " " + row.housestreet,
    {
      id: "address",
      header: "Address",
    },
  ),
  dobComplaintsColumnsHelper.accessor("complaintcategory", {
    header: "Category",
    cell: ({ getValue }) => {
      const complaintDesc = dobComplaintCodeToDescAndPriorityMap.get(
        getValue() ?? "",
      );

      if (!complaintDesc) {
        return getValue();
      }

      return `${getValue()} - ${complaintDesc[0]}`;
    },
  }),
  dobComplaintsColumnsHelper.accessor("status", {
    header: "Status",
  }),
  dobComplaintsColumnsHelper.accessor(
    (row) => formatDbTimeToISODate(row.dateentered, "America/New_York"),
    {
      id: "dateentered",
      header: "Date entered",
      cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
    },
  ),
];

const dobVacateOrdersColumnsHelper = createColumnHelper<DobVacateOrder>();
const dobVacateOrdersColumns = [
  dobVacateOrdersColumnsHelper.accessor(
    (row) => row.housenumber + " " + row.streetname,
    {
      id: "address",
      header: "Address",
    },
  ),
  dobVacateOrdersColumnsHelper.accessor(
    (row) =>
      formatDbTimeToISODate(
        row.lastdispositiondatedateofissuanceofvacate,
        "America/New_York",
      ),
    {
      id: "lastdispositiondatedateofissuanceofvacate",
      header: "Last disposition date",
      cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
    },
  ),
  dobVacateOrdersColumnsHelper.accessor("lastdispositioncodedescription", {
    header: "Last disposition description",
  }),
  dobVacateOrdersColumnsHelper.accessor("complaintcategorydescription", {
    header: "Complaint category description",
  }),
];

const hpdComplaintProblemsColumnsHelper =
  createColumnHelper<HpdComplaintProblem>();
const hpdComplaintProblemsColumns = [
  hpdComplaintProblemsColumnsHelper.accessor("problemid", {
    header: "Problem ID",
  }),
  hpdComplaintProblemsColumnsHelper.accessor("unittype", {
    header: "Unit type",
  }),
  hpdComplaintProblemsColumnsHelper.accessor("spacetype", {
    header: "Space type",
  }),
  hpdComplaintProblemsColumnsHelper.accessor("majorcategory", {
    header: "Major category",
  }),
  hpdComplaintProblemsColumnsHelper.accessor("minorcategory", {
    header: "Minor category",
  }),
  hpdComplaintProblemsColumnsHelper.accessor("problemcode", {
    header: "Code",
  }),
  hpdComplaintProblemsColumnsHelper.accessor("complaintstatus", {
    header: "Status",
  }),
  hpdComplaintProblemsColumnsHelper.accessor("statusdescription", {
    header: "Description",
  }),
  hpdComplaintProblemsColumnsHelper.accessor(
    (row) => formatDbTimeToISODate(row.complaintstatusdate, "America/New_York"),
    {
      id: "complaintstatusdate",
      header: "Status date",
      cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
    },
  ),
];

const dataSourceToColumns = new Map<
  Exclude<keyof HouseData | keyof HpdComplaintProblems, "metadata">,
  ColumnDef<any, any>[]
>([
  ["plutoData", plutoColumns],
  ["hpdViolations", hpdViolationsColumns],
  ["hpdComplaints", hpdComplaintColumns],
  ["hpdLitigations", hpdLitigationsColumns],
  ["hpdVacateOrders", hpdVacateOrdersColumns],
  ["dobViolations", dobViolationsColumns],
  ["dobComplaints", dobComplaintsColumns],
  ["dobVacateOrders", dobVacateOrdersColumns],
  ["hpdComplaintProblems", hpdComplaintProblemsColumns],
]);

export function getColumnsForDataSource(
  dataSource: Exclude<keyof HouseData | keyof HpdComplaintProblems, "metadata">,
): ColumnDef<any, any>[] {
  const columns = dataSourceToColumns.get(dataSource);
  if (!columns) {
    throw new Error(`No headers found for data source ${dataSource}`);
  }
  return columns;
}

function formatDate(date: Date | string | null): string {
  let parsedDate;
  if (typeof date === "string") {
    parsedDate = formatDbTimeToISODate(date, "America/New_York");
  } else {
    parsedDate = date;
  }

  if (!parsedDate || parsedDate.getTime() <= DATE_MIN_VALUE) {
    return "";
  }

  return DateTime.fromJSDate(parsedDate).toLocaleString(DateTime.DATE_SHORT);
}
