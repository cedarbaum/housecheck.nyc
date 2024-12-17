import { PlutoData } from "@/app/api/house_data/route";
import { ErrorCallout, WarningCallout } from "./callouts";
import { AddressSearchType } from "./address-search-options";
import { plutoColumns } from "@/lib/tabular-data";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./ui/table";
import { useMemo } from "react";

export default function PlutoInfo({
  plutoData,
  searchTypes,
}: {
  plutoData: PlutoData | null;
  searchTypes: Set<AddressSearchType>;
}) {
  const plutoTableData = useMemo(() => {
    return plutoData ? [plutoData] : [];
  }, [plutoData]);

  const table = useReactTable({
    data: plutoTableData,
    columns: plutoColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { getHeaderGroups, getRowModel } = table;

  const headers = getHeaderGroups().flatMap(
    (headerGroup) => headerGroup.headers,
  );
  const cells = getRowModel().rows.flatMap((row) => row.getVisibleCells());

  return (
    <>
      {!plutoData ? (
        <ErrorCallout text={"No PLUTO data found"} />
      ) : (
        <>
          {!searchTypes.has(AddressSearchType.BBL) && (
            <div className="mb-4">
              <WarningCallout text="PLUTO data is always based on the BBL of the address." />
            </div>
          )}
          <div className="border rounded-md">
            <Table className="table-auto border-collapse rounded-md w-full">
              <TableBody className="px-6 py-4">
                {headers.map((header) => (
                  <TableRow key={header.id}>
                    <TableHead className="text-left uppercase font-bold px-6 py-4">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                    {cells
                      .filter((cell) => cell.column.id === header.column.id)
                      .map((cell) => (
                        <TableCell key={cell.id} className="px-6 py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  );
}
