import NycAddressSearch from "@/components/NycAddressSearch";
import Table from "@/components/Table";

import { useEffect, useState } from "react";
import { NycAddress } from "@/components/NycAddressAutocomplate";
import { useQuery } from "react-query";
import { HouseData } from "./api/house_data";
import {
  getColumnsForDataSource,
  getSectionMetadataForDataSource,
} from "@/utils/TabularData";
import { jsonDateParser } from "json-date-parser";
import { InfoCallout } from "@/components/Callouts";
import AddressSearchOptions, {
  AddressSearchType,
} from "@/components/AddressSearchOptions";
import PlutoInfo from "@/components/PlutoInfo";
import Loading from "@/components/Loading";
import { queryTypes, useQueryState, useQueryStates } from "next-usequerystate";

const tabularDataSources: (keyof HouseData)[] = [
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
      <div className="">
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
      </div>
      <div className="mt-4">
        <AddressSearchOptions
          selectedSearchTypes={new Set(searchTypes ?? [])}
          onSelectionsChanged={(newSelections) => {
            setSearchTypes(Array.from(newSelections).sort());
          }}
        />
      </div>
      {isLoading && <Loading />}
      {!isLoading && data && (
        <>
          <section>
            <PlutoInfo plutoData={data?.plutoData} />
          </section>
          {tabularDataSources.map((dataSource) =>
            (() => {
              const { title, noDataDescription } =
                getSectionMetadataForDataSource(dataSource);
              return (
                <section key={dataSource}>
                  <h1 className="font-bold text-2xl my-8">{title}</h1>
                  {data &&
                    ((data[dataSource] as any[]).length === 0 ? (
                      <InfoCallout text={noDataDescription} />
                    ) : (
                      <Table
                        columns={getColumnsForDataSource(dataSource)}
                        data={data[dataSource] as any[]}
                        paginate
                      />
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
