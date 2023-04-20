import { PlutoData } from "@/pages/api/house_data";
import { ErrorCallout, WarningCallout } from "./Callouts";
import { AddressSearchType } from "./AddressSearchOptions";
import { getColumnsForDataSource } from "@/utils/TabularData";

export default function PlutoInfo({
  plutoData,
  searchTypes,
}: {
  plutoData: PlutoData | null;
  searchTypes: Set<AddressSearchType>;
}) {
  const plutoHeaders = getColumnsForDataSource("plutoData");
  return (
    <>
      {!plutoData ? (
        <ErrorCallout text={"No PLUTO data found"} />
      ) : (
        <>
          {!searchTypes.has("bbl") && (
            <div className="mb-4">
              <WarningCallout text="PLUTO data is always based on the BBL of the address." />
            </div>
          )}
          <table className="table-auto border-collapse border w-full">
            <tbody className="px-6 py-4">
              {plutoHeaders.map((c) => (
                <tr key={c.accessor as keyof PlutoData}>
                  <td className="uppercase font-bold px-6 py-4 border">
                    {c.Header as string}
                  </td>
                  <td className="px-6 py-4 border">
                    {plutoData
                      ? plutoData[c.accessor as keyof PlutoData]?.toString() ??
                        ""
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
