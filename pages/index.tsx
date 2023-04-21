import { useEffect, useState } from "react";

import { useQuery } from "react-query";
import NycAddressSearch from "@/components/NycAddressSearch";
import Table from "@/components/Table";
import { NycAddress } from "@/components/NycAddressAutocomplate";
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
    { label, streetname, housenumber, borough, postalcode, bbl, bin },
    setAddressData,
  ] = useQueryStates({
    label: queryTypes.string,
    streetname: queryTypes.string,
    housenumber: queryTypes.string,
    borough: queryTypes.string,
    postalcode: queryTypes.string,
    bbl: queryTypes.string,
    bin: queryTypes.string,
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

  return (
    <>
      <section>
        <NycAddressSearch
          initialAddress={label ?? undefined}
          onSelect={(address: NycAddress) => {
            setAddressData({
              label: address.label,
              streetname: address.street,
              housenumber: address.housenumber,
              borough: address.borough,
              postalcode: address.postalcode,
              bbl: address.addendum?.pad?.bbl,
              bin: address.addendum?.pad?.bin,
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
            <SectionHeader
              title="PLUTO data"
              metadata={data!.metadata!["plutoData"]}
            />
            <PlutoInfo
              plutoData={data?.plutoData}
              searchTypes={new Set(searchTypes ?? [])}
            />
          </section>
          {tabularDataSources.map((dataSource) =>
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
                  <SectionHeader
                    title={title}
                    metadata={data!.metadata![dataSource]}
                  />
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
