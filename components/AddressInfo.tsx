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
    <table className="border border-collapse w-full">
      <tbody>
        <tr>
          <Td title="BBL" value={bbl} />
          <Td title="BIN" value={bin} />
          <Td title="Postal code" value={postalcode} />
        </tr>
      </tbody>
    </table>
  );
}

function Td({ title, value }: { title: string; value: string }) {
  return (
    <td className="p-4">
      <span className="font-bold">{`${title}: `}</span>
      {value}
    </td>
  );
}
