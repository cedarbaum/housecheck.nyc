import { useCallback, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import debounce from "lodash.debounce";
import {
  NycAddressAutocomplate,
  NycAddress,
  Feature,
} from "./NycAddressAutocomplate";
import { classNames } from "@/utils/Styling";
import useAsyncEffect from "use-async-effect";

export default function NycAddressSearch({
  initialAddress,
  onSelect,
}: {
  initialAddress?: string;
  onSelect: (placeDetails: Feature) => void;
}) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<Feature | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<Feature[] | null>(null);

  const debouncedChangeHandler = useCallback(
    debounce(async (text: string) => {
      if (!text || text === "") {
        setSuggestions(null);
        return;
      }

      const suggesstionsResp = await fetch(
        "https://geosearch.planninglabs.nyc/v2/autocomplete?" +
          new URLSearchParams({ text })
      );

      const suggestions =
        (await suggesstionsResp.json()) as NycAddressAutocomplate;
      setSuggestions(suggestions.features);
    }, 300),
    []
  );

  useAsyncEffect(async () => {
    if (!initialAddress || initialAddress === "") {
      return;
    }

    const searchResp = await fetch(
      "https://geosearch.planninglabs.nyc/v2/search?" +
        new URLSearchParams({ text: initialAddress, size: "1" })
    );

    if (!searchResp.ok) {
      return;
    }

    const searchResults = (await searchResp.json()) as NycAddressAutocomplate;
    if (searchResults?.features?.length === 0) {
      return;
    }

    handleSelect(searchResults.features[0]);
  }, [initialAddress]);

  const handleSelect = (suggestion: Feature) => {
    setSelectedSuggestion(suggestion);
    setSuggestions(null);
    onSelect(suggestion);
  };

  const renderSuggestions = () => {
    if (!suggestions || suggestions.length === 0 || selectedSuggestion) {
      return null;
    }

    return (
      <Combobox.Options
        static
        className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800 border focus:ring-0 focus:ring-offset-0"
      >
        {suggestions?.map((suggestion) => {
          return (
            <Combobox.Option
              key={suggestion.properties.id}
              value={suggestion}
              className={({ active }) =>
                classNames(
                  "cursor-default select-none px-4 py-2 focus:ring-0 focus:ring-offset-0",
                  active && "bg-blue-400 text-white"
                )
              }
            >
              {({ active, selected }) => (
                <span>{suggestion.properties.label}</span>
              )}
            </Combobox.Option>
          );
        })}
      </Combobox.Options>
    );
  };

  return (
    <>
      <div className="relative inset-0 z-10 overflow-y-auto w-full">
        <Combobox
          onChange={(suggestion: Feature) => {
            handleSelect(suggestion);
          }}
          value={selectedSuggestion}
        >
          <div className="relative">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-4 h-16 w-5 text-gray-400"
              aria-hidden="true"
            />
            <Combobox.Input
              className="h-16 text-md md:text-xl w-full border bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0"
              style={{ outline: "none" }}
              placeholder="Search NYC addresses"
              onChange={(event) => {
                setSelectedSuggestion(null);
                debouncedChangeHandler(event.target.value);
              }}
              displayValue={(s) =>
                (s as NycAddress | null)?.label ?? initialAddress ?? ""
              }
            />
          </div>
          {renderSuggestions()}
        </Combobox>
      </div>
    </>
  );
}
