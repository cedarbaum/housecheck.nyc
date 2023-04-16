export interface NycAddressAutocomplate {
  geocoding: Geocoding;
  type: string;
  features: Feature[];
  bbox: number[];
}

export interface Feature {
  type: string;
  geometry: Geometry;
  properties: NycAddress;
}

export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface NycAddress {
  id: string;
  gid: string;
  layer: string;
  source: string;
  source_id: string;
  country_code: string;
  name: string;
  housenumber: string;
  street: string;
  postalcode: string;
  accuracy: string;
  country: string;
  country_gid: string;
  country_a: string;
  region: string;
  region_gid: string;
  region_a: string;
  county: string;
  county_gid: string;
  locality: string;
  locality_gid: string;
  locality_a: string;
  borough: string;
  borough_gid: string;
  neighbourhood: string;
  neighbourhood_gid: string;
  label: string;
  addendum: Addendum;
}

export interface Addendum {
  pad: Pad;
}

export interface Pad {
  bbl: string;
  bin: string;
  version: string;
}

export interface Geocoding {
  version: string;
  attribution: string;
  query: Query;
  warnings: string[];
  engine: Engine;
  timestamp: number;
}

export interface Engine {
  name: string;
  author: string;
  version: string;
}

export interface Query {
  text: string;
  parser: string;
  parsed_text: ParsedText;
  size: number;
  layers: string[];
  private: boolean;
  lang: Lang;
  querySize: number;
}

export interface Lang {
  name: string;
  iso6391: string;
  iso6393: string;
  via: string;
  defaulted: boolean;
}

export interface ParsedText {
  subject: string;
}
