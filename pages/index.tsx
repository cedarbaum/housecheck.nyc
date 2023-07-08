import { useEffect, useRef, useState } from "react";

import { useQuery } from "react-query";
import NycAddressSearch from "@/components/NycAddressSearch";
import Table from "@/components/Table";
import { Feature, NycAddress } from "@/components/NycAddressAutocomplate";
import { HouseData } from "@/pages/api/house_data";
import {
  getColumnsForDataSource,
  getSectionMetadataForDataSource,
} from "@/utils/TabularData";
import { jsonDateParser } from "json-date-parser";
import {
  ErrorCallout,
  InfoCallout,
  WarningCallout,
} from "@/components/Callouts";
import AddressSearchOptions, {
  AddressSearchType,
} from "@/components/AddressSearchOptions";
import PlutoInfo from "@/components/PlutoInfo";
import Loading from "@/components/Loading";
import { queryTypes, useQueryState, useQueryStates } from "next-usequerystate";
import SectionHeader from "@/components/SectionHeader";
import AddressInfo from "@/components/AddressInfo";
import * as turf from "@turf/turf";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const tabularDataSources: Exclude<keyof HouseData, "metadata">[] = [
  "hpdViolations",
  "hpdComplaints",
  "hpdLitigations",
  "hpdVacateOrders",
  "dobViolations",
  "dobComplaints",
  "dobVacateOrders",
];

export default function Home() {
  const [
    {
      label,
      streetname,
      housenumber,
      borough,
      postalcode,
      bbl,
      bin,
      geometryType,
      geometryCoordiantes: geometryCoordinates,
    },
    setAddressData,
  ] = useQueryStates({
    label: queryTypes.string,
    streetname: queryTypes.string,
    housenumber: queryTypes.string,
    borough: queryTypes.string,
    postalcode: queryTypes.string,
    bbl: queryTypes.string,
    bin: queryTypes.string,
    geometryType: queryTypes.string,
    geometryCoordiantes: queryTypes.array(queryTypes.float),
  });

  const [searchTypes, setSearchTypes] = useQueryState(
    "search_types",
    queryTypes
      .array(
        queryTypes.stringEnum<AddressSearchType>(["bbl", "bin", "address"])
      )
      .withDefault(["bbl", "bin", "address"])
  );

  const [queryEnabled, setQueryEnabled] = useState(false);

  useEffect(() => {
    setQueryEnabled(
      (!!streetname && !!housenumber && !!borough && !!postalcode) ||
        !!bbl ||
        !!bin
    );
  }, [streetname, housenumber, borough, postalcode, bbl, bin]);

  let { data, isLoading, error } = useQuery(
    [
      "house_data",
      streetname,
      housenumber,
      borough,
      bbl,
      searchTypes?.length > 0 ? searchTypes.sort().join(",") : null,
    ],
    async () => {
      const resp = await fetch(
        "/api/house_data?" +
          new URLSearchParams({
            streetname: streetname!,
            housenumber: housenumber!,
            borough: borough!,
            zipcode: postalcode!,
            bbl: bbl!,
            bin: bin!,
            search_types: searchTypes.join(","),
          })
      );

      if (!resp.ok) {
        throw new Error("Failed to fetch housing data");
      }

      return JSON.parse(await resp.text(), jsonDateParser) as HouseData;
    },
    {
      enabled: queryEnabled,
    }
  );

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!map.current) return;
    if (!map.current.loaded()) return;
    if (!geometryCoordinates || !geometryType) return;

    const pointSource = map.current.getSource(
      "address-source"
    ) as mapboxgl.GeoJSONSource;
    pointSource.setData({
      type: "Feature",
      geometry: {
        type: geometryType as any,
        coordinates: geometryCoordinates,
      },
      properties: {},
    });

    map.current.setCenter(
      turf.centroid({
        type: geometryType as any,
        coordinates: geometryCoordinates,
      }).geometry.coordinates as [number, number]
    );
  }, [map.current, geometryCoordinates, geometryType]);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;
    if (!geometryCoordinates || !geometryType) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: turf.centroid({
        type: geometryType as any,
        coordinates: geometryCoordinates,
      }).geometry.coordinates as [number, number],
      zoom: 15,
    });

    // Add GeoJSON data
    map.current.on("load", function () {
      map.current!.addSource("address-source", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: geometryType as any,
            coordinates: geometryCoordinates,
          },
          properties: {},
        },
      });

      if (geometryType === "Point") {
        map.current!.addLayer({
          id: "point",
          type: "circle",
          source: "address-source",
          paint: {
            "circle-radius": 10,
            "circle-color": "#2563eb",
          },
        });
      } else if (geometryType === "LineString") {
        map.current!.addLayer({
          id: "line",
          type: "line",
          source: "address-source",
          paint: {
            "line-color": "#2563eb",
            "line-width": 5,
          },
        });
      } else if (geometryType === "Polygon") {
        map.current!.addLayer({
          id: "polygon",
          type: "fill",
          source: "address-source",
          paint: {
            "fill-color": "#2563eb",
            "fill-opacity": 0.5,
          },
        });
      }
    });
  });

  return (
    <>
      <section>
        <NycAddressSearch
          initialAddress={label ?? undefined}
          onSelect={(address: Feature) => {
            setAddressData({
              label: address.properties.label,
              streetname: address.properties.street,
              housenumber: address.properties.housenumber,
              borough: address.properties.borough,
              postalcode: address.properties.postalcode,
              bbl: address.properties.addendum?.pad?.bbl,
              bin: address.properties.addendum?.pad?.bin,
              geometryType: address.geometry.type,
              geometryCoordiantes: address.geometry.coordinates,
            });
          }}
        />
        <div className="mt-4">
          <AddressSearchOptions
            selectedSearchTypes={new Set(searchTypes ?? [])}
            onSelectionsChanged={(newSelections) => {
              setSearchTypes(Array.from(newSelections).sort());
            }}
          />
        </div>
        {queryEnabled && bbl && bin && postalcode && (
          <div className="mt-6">
            <AddressInfo bbl={bbl} bin={bin} postalcode={postalcode} />
          </div>
        )}
        <div>
          <div ref={mapContainer} className="h-[250px] my-2" />
        </div>
        {!!error && (
          <div className="mt-4">
            <ErrorCallout text="Failed to retrieve house data." />
          </div>
        )}
        {isLoading && <Loading />}
      </section>
      {!isLoading && data && (
        <>
          <section>
            <div className="sticky top-0 bg-white z-[10] border-b mb-4">
              <SectionHeader
                title="PLUTO data"
                metadata={data!.metadata!["plutoData"]}
              />
            </div>
            <PlutoInfo
              plutoData={data?.plutoData}
              searchTypes={new Set(searchTypes ?? [])}
            />
          </section>
          {tabularDataSources.map((dataSource, dataSourceIdx) =>
            (() => {
              const {
                title,
                noDataDescription,
                validSearchTypes,
                notifications,
              } = getSectionMetadataForDataSource(dataSource);

              function formatSearchType(st: AddressSearchType): any {
                switch (st) {
                  case "address":
                    return "Address";
                  case "bbl":
                    return "BBL";
                  case "bin":
                    return "BIN";
                }
              }

              return (
                <section key={dataSource}>
                  <div
                    className="sticky top-0 bg-white border-b mb-4"
                    style={{ zIndex: 10 + dataSourceIdx + 1 }}
                  >
                    <SectionHeader
                      title={title}
                      metadata={data!.metadata![dataSource]}
                    />
                  </div>
                  {data &&
                    ((data[dataSource] as any[]).length === 0 ? (
                      searchTypes.filter((st) => validSearchTypes.has(st))
                        .length ? (
                        <InfoCallout text={noDataDescription} />
                      ) : (
                        <WarningCallout
                          text={`This data source requires one of the following search types: ${Array.from(
                            validSearchTypes
                          )
                            .map((st) => formatSearchType(st))
                            .join(", ")}.`}
                        />
                      )
                    ) : (
                      <>
                        {notifications
                          ?.apply(null, [bbl, bin])
                          .map((callout, calloutIdx) => (
                            <div className="my-4" key={calloutIdx}>
                              {callout}
                            </div>
                          ))}
                        <Table
                          columns={getColumnsForDataSource(dataSource)}
                          data={data[dataSource] as any[]}
                          paginate
                        />
                      </>
                    ))}
                </section>
              );
            })()
          )}
        </>
      )}
    </>
  );
}
