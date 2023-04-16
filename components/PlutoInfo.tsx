import { PlutoData } from "@/pages/api/house_data";
import { ErrorCallout } from "./Callouts";

const plutoHeaders: Map<keyof PlutoData, string> = new Map([
  ["ownername", "Owner"],
  ["numfloors", "# floors"],
  ["unitstotal", "# units"],
  ["yearbuilt", "Year built"],
]);

export default function PlutoInfo({
  plutoData,
}: {
  plutoData: PlutoData | null;
}) {
  return (
    <>
      <h1 className="font-bold text-2xl my-8">PLUTO data</h1>
      {!plutoData ? (
        <ErrorCallout text={"No PLUTO data found"} />
      ) : (
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
      )}
    </>
  );
}
