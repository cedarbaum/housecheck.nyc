import { PlutoData } from "@/pages/api/house_data";
import { ErrorCallout, WarningCallout } from "./Callouts";
import { AddressSearchType } from "./AddressSearchOptions";

const plutoHeaders: Map<keyof PlutoData, string> = new Map([
  ["ownername", "Owner"],
  ["numfloors", "# floors"],
  ["unitstotal", "# units"],
  ["yearbuilt", "Year built"],
]);

export default function PlutoInfo({
  plutoData,
  searchTypes,
}: {
  plutoData: PlutoData | null;
  searchTypes: Set<AddressSearchType>;
}) {
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
              {Array.from(plutoHeaders).map(([key, value]) => (
                <tr key={key}>
                  <td className="uppercase font-bold px-6 py-4 border">
                    {value}
                  </td>
                  <td className="px-6 py-4 border">
                    {plutoData ? plutoData[key]?.toString() ?? "" : ""}
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
