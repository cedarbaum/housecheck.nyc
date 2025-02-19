"use client";

import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import NycAddressSearch from "@/components/nyc-address-search";
import DataTable from "@/components/data-table";
import { Feature } from "@/lib/nyc-address-autocomplete";
import { HouseData } from "@/app/api/house_data/route";
import { getColumnsForDataSource } from "@/lib/tabular-data";
import { jsonDateParser } from "json-date-parser";
import {
  ErrorCallout,
  InfoCallout,
  WarningCallout,
} from "@/components/callouts";
import AddressSearchOptions, {
  AddressSearchType,
} from "@/components/address-search-options";
import PlutoInfo from "@/components/pluto-info";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";
import AddressInfo from "@/components/address-info";
import * as turf from "@turf/turf";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { getSectionMetadataForDataSource } from "@/lib/section-metadata";
import SectionLoader from "@/components/section-loader";
import { cn } from "@/lib/utils";
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

type AddressMetadata = {
  streetname: string | undefined | null;
  housenumber: string | undefined | null;
  borough: string | undefined | null;
  postalcode: string | undefined | null;
  bbl: string | undefined | null;
  bin: string | undefined | null;
  geometryType: string | undefined | null;
  geometryCoordinates: number[] | undefined | null;
};

export default function Home() {
  const [
    {
      streetname,
      housenumber,
      borough,
      postalcode,
      bbl,
      bin,
      geometryType,
      geometryCoordinates,
    },
    setAddressData,
  ] = useState<AddressMetadata>({} as AddressMetadata);

  const [text, setText] = useQueryState("text", parseAsString);
  const [searchTypes, setSearchTypes] = useQueryState(
    "search_types",
    parseAsArrayOf(
      parseAsStringEnum<AddressSearchType>(Object.values(AddressSearchType)),
    ).withDefault([
      AddressSearchType.Address,
      AddressSearchType.BBL,
      AddressSearchType.BIN,
    ]),
  );

  const queryEnabled =
    (!!streetname && !!housenumber && !!borough && !!postalcode) ||
    !!bbl ||
    !!bin;
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "house_data",
      queryEnabled,
      streetname,
      housenumber,
      borough,
      postalcode,
      bbl,
      bin,
      searchTypes?.length > 0 ? searchTypes.sort().join(",") : null,
    ],
    queryFn: async () => {
      if (!queryEnabled) {
        return null;
      }

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000);

      try {
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
          }),
          { signal: abortController.signal },
        );

        clearTimeout(timeoutId);

        if (!resp.ok) {
          throw new Error("Failed to fetch housing data");
        }

        return JSON.parse(await resp.text(), jsonDateParser) as HouseData;
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: 3,
    retryDelay: 100,
  });

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const showMap = !!geometryCoordinates && !!geometryType;

  useEffect(() => {
    if (!map.current) return;
    if (!map.current.loaded()) return;
    if (!geometryCoordinates || !geometryType) return;

    const pointSource = map.current.getSource(
      "address-source",
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
      }).geometry.coordinates as [number, number],
    );
  }, [geometryCoordinates, geometryType]);

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

  const showLoadingState = queryEnabled && (isLoading || (!data && !error));

  return (
    <>
      <section>
        <NycAddressSearch
          initialAddress={text ?? undefined}
          onSelect={(address: Feature | null) => {
            if (!address) {
              setAddressData({} as AddressMetadata);
              setText(null);
              return;
            }

            setText(address.properties.label);
            setAddressData({
              streetname: address.properties.street,
              housenumber: address.properties.housenumber,
              borough: address.properties.borough,
              postalcode: address.properties.postalcode,
              bbl: address.properties.addendum?.pad?.bbl,
              bin: address.properties.addendum?.pad?.bin,
              geometryType: address.geometry.type,
              geometryCoordinates: address.geometry.coordinates,
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
        {bbl && bin && postalcode && (
          <div className="mt-6">
            <AddressInfo bbl={bbl} bin={bin} postalcode={postalcode} />
          </div>
        )}
        <div className={cn(!showMap && "invisible h-0")}>
          <div ref={mapContainer} className="h-[150px] md:h-[250px] my-2" />
        </div>
        {!!error && (
          <div className="mt-4">
            <ErrorCallout text="Failed to retrieve house data." />
          </div>
        )}
      </section>
      {!error && (
        <>
          <section>
            <SectionLoader
              title="PLUTO data"
              metadata={data?.metadata?.["plutoData"]}
              sectionZIndex={10}
              isLoading={showLoadingState}
            >
              {data && data.plutoData && (
                <PlutoInfo
                  plutoData={data?.plutoData}
                  searchTypes={new Set(searchTypes ?? [])}
                />
              )}
            </SectionLoader>
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
                  <SectionLoader
                    title={title}
                    metadata={data?.metadata?.[dataSource]}
                    sectionZIndex={10 + dataSourceIdx + 1}
                    isLoading={showLoadingState}
                  >
                    {data &&
                      ((data[dataSource] as any[]).length === 0 ? (
                        searchTypes.filter((st) => validSearchTypes.has(st))
                          .length ? (
                          <InfoCallout text={noDataDescription} />
                        ) : (
                          <WarningCallout
                            text={`This data source requires one of the following search types: ${Array.from(
                              validSearchTypes,
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
                          <DataTable
                            columns={getColumnsForDataSource(dataSource)}
                            data={data[dataSource] as any[]}
                            paginate
                          />
                        </>
                      ))}
                  </SectionLoader>
                </section>
              );
            })(),
          )}
        </>
      )}
    </>
  );
}
