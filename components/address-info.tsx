import { Table, TableBody, TableCell, TableRow } from "./ui/table";

export default function AddressInfo({
  bbl,
  bin,
  postalcode,
}: {
  bbl: string;
  bin: string;
  postalcode: string;
}) {
  return (
    <div className="border rounded-md">
      <Table className="border-collapse w-full">
        <TableBody>
          <TableRow>
            <TitledTableCell title="BBL" value={bbl} />
            <TitledTableCell title="BIN" value={bin} />
            <TitledTableCell title="Postal code" value={postalcode} />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function TitledTableCell({ title, value }: { title: string; value: string }) {
  return (
    <TableCell className="p-4">
      <span className="font-bold">{`${title}: `}</span>
      {value}
    </TableCell>
  );
}
