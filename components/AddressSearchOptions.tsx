import { useEffect, useState } from "react";

export type AddressSearchType = "address" | "bbl" | "bin";

export default function AddressSearchOptions({
  selectedSearchTypes,
  onSelectionsChanged,
}: {
  selectedSearchTypes: Set<AddressSearchType>;
  onSelectionsChanged: (selections: Set<AddressSearchType>) => void;
}) {
  const searchTypes = [
    {
      id: "address",
      label: "Address",
      description: "Search by address",
    },
    {
      id: "bbl",
      label: "BBL",
      description: "Search by BBL",
    },
    {
      id: "bin",
      label: "BIN",
      description: "Search by BIN",
    },
  ];

  return (
    <fieldset>
      <legend className="sr-only">Search types</legend>
      <div className="flex justify-between md:justify-end">
        <label>
          <span className="text-gray-700 font-medium md:mr-4">Search using:</span>
        </label>
        <div className="flex justify-between space-x-4">
          {searchTypes.map((searchType) => (
            <div key={searchType.id} className="flex items-center">
              <input
                id={searchType.id}
                aria-describedby={searchType.id + "-description"}
                name="candidates"
                type="checkbox"
                checked={
                  selectedSearchTypes.has(searchType.id as AddressSearchType)
                }
                className="h-6 w-6 border-gray-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    onSelectionsChanged(
                      new Set([
                        ...Array.from(selectedSearchTypes),
                        searchType.id as AddressSearchType,
                      ])
                    );
                  } else {
                    onSelectionsChanged(
                      new Set([
                        ...Array.from(selectedSearchTypes).filter(
                          (type) => type !== searchType.id
                        ),
                      ])
                    );
                  }
                }}
              />
              <div className="ml-2 text-sm leading-6">
                <label
                  htmlFor={searchType.id}
                  className="font-medium text-gray-900"
                >
                  {searchType.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
