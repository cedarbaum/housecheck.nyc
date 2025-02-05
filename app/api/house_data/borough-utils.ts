export function boroughToBoro(borough: string): number {
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

export function boroughToBoroCode(borough: string): string {
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

export function boroughToCapitalizedBorough(borough: string): string {
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