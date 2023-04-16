import NycAddressSearch from "@/components/NycAddressSearch";
import Table from "@/components/Table";

import { useState } from "react";
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
  const [selectedAddressSearchTypes, setSelectedAddressSearchTypes] = useState<
    Set<AddressSearchType>
  >(new Set<AddressSearchType>(["bbl", "bin", "address"]));
  const [address, setAddress] = useState<NycAddress | null>(null);

  let { data, isLoading, error } = useQuery(
    [
      "hpd_violations",
      address?.street,
      address?.housenumber,
      address?.borough,
      address?.addendum?.pad?.bbl,
      selectedAddressSearchTypes.size > 0
        ? Array.from(selectedAddressSearchTypes).sort().join(",")
        : null,
    ],
    async () => {
      const resp = await fetch(
        "/api/house_data?" +
          new URLSearchParams({
            streetname: address!.street,
            housenumber: address!.housenumber,
            borough: address!.borough,
            zipcode: address!.postalcode,
            bbl: address!.addendum?.pad?.bbl,
            bin: address!.addendum?.pad?.bin,
            search_types: Array.from(selectedAddressSearchTypes).join(","),
          })
      );

      if (!resp.ok) {
        throw new Error("Failed to fetch housing data");
      }

      return JSON.parse(await resp.text(), jsonDateParser) as HouseData;
    },
    {
      enabled: address !== null,
    }
  );

  return (
    <main className="flex flex-col justify-between p-8 w-full">
      <div className="">
        <NycAddressSearch onSelect={setAddress} />
      </div>
      <div className="mt-4">
        <AddressSearchOptions
          selectedSearchTypes={selectedAddressSearchTypes}
          onSelectionsChanged={setSelectedAddressSearchTypes}
        />
      </div>
      {isLoading && <Loading />}
      {!isLoading && address && data && (
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
    </main>
  );
}
