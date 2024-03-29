export const dobComplaintCodeToDescAndPriorityMap = new Map<string, [string, string]>([
  ["01", ["Accident – Construction/Plumbing", "A"]],
  ["03", ["Adjacent Buildings - Not Protected", "A"]],
  ["04", ["After Hours Work – Illegal", "B"]],
  ["05", ["Permit – None (Building/PA/Demo etc.)", "B"]],
  ["06", ["Construction – Change Grade/Change Watercourse", "B"]],
  ["09", ["Debris – Excessive", "B"]],
  ["10", ["Debris/Building -Falling or In Danger of Falling", "A"]],
  ["12", ["Demolition-Unsafe/Illegal/Mechanical Demo", "A"]],
  ["13", ["Elevator In (FDNY) Readiness-None", "A"]],
  ["14", ["Excavation - Undermining Adjacent Building", "A"]],
  ["15", ["Fence - None/Inadequate/Illegal", "B"]],
  ["16", ["Inadequate Support/Shoring", "A"]],
  ["18", ["Material Storage – Unsafe", "A"]],
  ["20", ["Landmark Building – Illegal Work", "A"]],
  [
    "21",
    ["Safety Net/Guardrail-Damaged/Inadequate/None (over 6 Story/75 ft.)", "B"],
  ],
  [
    "23",
    [
      "Sidewalk Shed/Supported Scaffold/Inadequate/Defective/None/No Permit/No Cert",
      "B",
    ],
  ],
  ["29", ["Building – Vacant, Open and Unguarded", "C"]],
  ["30", ["Building Shaking/Vibrating/Structural Stability Affected", "A"]],
  ["31", ["Certificate of Occupancy – None/Illegal/Contrary to Co", "C"]],
  ["35", ["Curb Cut/Driveway/Carport – Illegal", "D"]],
  ["37", ["Egress – Locked/Blocked/Improper/No Secondary Means", "A"]],
  ["45", ["Illegal Conversion", "B"]],
  ["49", ["Storefront or Business Sign/Awning/Marquee/Canopy – Illegal", "C"]],
  [
    "50",
    [
      "Sign Falling - Danger/Sign Erection or Display In Progress – Illegal",
      "A",
    ],
  ],
  ["52", ["Sprinkler System – Inadequate", "B"]],
  ["53", ["Vent/Exhaust – Illegal/Improper", "D"]],
  ["54", ["Wall/Retaining Wall – Bulging/Cracked", "B"]],
  ["55", ["Zoning – Non-conforming", "D"]],
  ["56", ["Boiler – Fumes/Smoke/Carbon Monoxide", "A"]],
  ["58", ["Boiler – Defective/Non-operative/No Permit", "B"]],
  ["59", ["Electrical Wiring – Defective/Exposed, In Progress", "B"]],
  ["62", ["Elevator-Danger Condition/Shaft Open/Unguarded", "A"]],
  ["63", ["Elevator-Danger Condition/Shaft Open/Unguarded", "B"]],
  ["65", ["Gas Hook-Up/Piping – Illegal or Defective", "A"]],
  ["66", ["Plumbing Work – Illegal/No Permit(Also Sprinkler/Standpipe)", "B"]],
  ["67", ["Crane – No Permit/License/Cert/Unsafe/Illegal", "A"]],
  ["71", ["SRO – Illegal Work/No Permit/Change In Occupancy Use", "B"]],
  ["73", ["Failure to Maintain", "C"]],
  ["74", ["Illegal Commercial/Manufacturing Use In Residential Zone", "C"]],
  ["75", ["Adult Establishment", "B"]],
  ["76", ["Unlicensed/Illegal/Improper Plumbing Work In Progress", "A"]],
  ["77", ["Contrary To Ll58/87 (Handicap Access)", "C"]],
  ["78", ["Privately Owned Public Space/Non-Compliance", "B"]],
  ["79", ["Lights from Parking Lot Shining on Building", "C"]],
  ["80", ["Elevator Not Inspected/Illegal/No Permit", "D"]],
  ["81", ["Elevator – Accident", "A"]],
  ["82", ["Boiler – Accident/Explosion", "A"]],
  ["83", ["Construction – Contrary/Beyond Approved Plans/Permits", "B"]],
  ["85", ["Failure to Retain Water/Improper Drainage (LL103/89)", "C"]],
  ["86", ["Work Contrary to Stop Work Order", "A"]],
  ["88", ["Safety Net/Guard Rail-Dam/Inadequate/None(6fl.75ft. or less)", "B"]],
  ["89", ["Accident – Cranes/Derricks/Suspension", "A"]],
  ["90", ["Unlicensed/Illegal Activity", "C"]],
  ["91", ["Site Conditions Endangering Workers", "A"]],
  ["92", ["Illegal Conversion of Manufacturing/Industrial Space", "B"]],
  ["93", ["Request for Retaining Wall Safety Inspection", "B"]],
  ["94", ["Plumbing-Defective/Leaking/Not Maintained", "C"]],
  [
    "1A",
    ["Illegal Conversion Commercial Building/Space to Dwelling Units", "B"],
  ],
  ["1B", ["Illegal Tree Removal/Topo. Change In SNAD", "B"]],
  ["1D", ["Con Edison Referral", "B"]],
  [
    "1E",
    [
      "Suspended (Hanging) Scaffolds- No Permit/License/Dangerous/Accident",
      "A",
    ],
  ],
  ["1G", ["Stalled Construction Site", "B"]],
  ["1K", ["Bowstring Truss Tracking Complaint", "D"]],
  ["1Z", ["Enforcement Work Order (DOB)", "D"]],
  ["2A", ["Posted Notice or Order Removed/Tampered With", "B"]],
  ["2B", ["Failure to Comply with Vacate Order", "A"]],
  ["2C", ["Smoking Ban – Smoking on Construction Site", "B"]],
  [
    "2D",
    [
      "Smoking Signs – 'No Smoking Signs' Not Observed on Construction Site",
      "B",
    ],
  ],
  ["2E", ["Demolition Notification Received", "A"]],
  ["2F", ["Building Under Structural Monitoring", "D"]],
  ["2G", ["Advertising Sign/Billboard/Posters/Flexible Fabric – Illegal", "C"]],
  ["2H", ["Second Avenue Subway Construction", "D"]],
  ["2J", ["Sandy: Building Destroyed", "D"]],
  ["2K", ["Structurally Compromised Building (LL33/08)", "D"]],
  ["2L", ["Façade (LL11/98) – Unsafe Notification", "D"]],
  ["2M", ["Monopole Tracking Complaint", "D"]],
  ["3A", ["Unlicensed/Illegal/Improper Electrical Work In Progress", "B"]],
  ["4A", ["Illegal Hotel Rooms In Residential Buildings", "B"]],
  ["4B", ["SEP – Professional Certification Compliance Audit", "B"]],
  ["4C", ["Excavation Tracking Complaint", "D"]],
  ["4D", ["Interior Demo Tracking Complaint", "D"]],
  ["4F", ["SST Tracking Complaint", "D"]],
  ["4G", ["Illegal Conversion No Access Follow-Up", "B"]],
  ["4J", ["M.A.R.C.H. Program (Interagency)", "D"]],
  ["4K", ["CSC – DM Tracking Complaint", "D"]],
  ["4L", ["CSC – High-Rise Tracking Complaint", "D"]],
  ["4M", ["CSC – Low-Rise Tracking Complaint", "D"]],
  ["4N", ["Retaining Wall Tracking Complaint", "D"]],
  ["4P", ["Legal/Padlock Tracking Complaint", "D"]],
  ["4W", ["Woodside Settlement Project", "C"]],
  ["5A", ["Request for Joint FDNY/DOB Inspection", "B"]],
  ["5B", ["Non-Compliance with Lightweight Materials", "A"]],
  [
    "5C",
    ["Structural Stability Impacted – New Building Under Construction", "A"],
  ],
  ["5E", ["Amusement Ride Accident/Incident", "A"]],
  ["5F", ["Compliance Inspection", "B"]],
  ["5G", ["Unlicensed/Illegal/Improper Work In Progress", "B"]],
  ["6A", ["Vesting Inspection", "C"]],
]);
