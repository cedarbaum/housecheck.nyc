import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  NycAddressAutocomplate,
  Feature,
} from "@/lib/nyc-address-autocomplete";
import debounce from "lodash.debounce";
import useAsyncEffect from "use-async-effect";
import { cn } from "@/lib/utils";

interface NycAddressSearchProps {
  initialAddress?: string;
  onSelect: (placeDetails: Feature | null) => void;
}

export default function NycAddressSearch({
  initialAddress,
  onSelect,
}: NycAddressSearchProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [addressInput, setAddressInput] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Feature[]>([]);

  const debouncedFetchSuggestions = React.useMemo(
    () =>
      debounce(async (text: string) => {
        if (!text) {
          setSuggestions([]);
          return;
        }

        const suggestionsResp = await fetch(
          `https://geosearch.planninglabs.nyc/v2/autocomplete?${new URLSearchParams({ text })}`,
        );

        const suggestions =
          (await suggestionsResp.json()) as NycAddressAutocomplate;
        setSuggestions(suggestions.features);
      }, 300),
    [],
  );

  useAsyncEffect(async () => {
    if (!initialAddress) return;

    const searchResp = await fetch(
      `https://geosearch.planninglabs.nyc/v2/search?${new URLSearchParams({
        text: initialAddress,
        size: "1",
      })}`,
    );

    if (!searchResp.ok) return;

    const searchResults = (await searchResp.json()) as NycAddressAutocomplate;
    if (searchResults?.features?.length === 0) return;

    handleSelect(searchResults.features[0]);
  }, [initialAddress]);

  const handleSelect = (suggestion: Feature | null) => {
    setAddressInput(suggestion?.properties?.label ?? "");
    setShowSuggestions(false);
    setSuggestions([]);
    onSelect(suggestion);
  };

  return (
    <>
      <Command className="rounded-md border">
        <CommandInput
          className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-lg"
          wrapperClassName={cn(showSuggestions && "border-b")}
          placeholder="Search NYC addresses"
          value={addressInput}
          onValueChange={(text) => {
            setAddressInput(text);
            setShowSuggestions(true);
            debouncedFetchSuggestions(text);
          }}
          showClearButton={addressInput?.length > 0}
          onClear={() => {
            handleSelect(null);
          }}
        />
        <CommandList className="border-0">
          {showSuggestions && suggestions.length === 0 && addressInput && (
            <CommandEmpty>No address found.</CommandEmpty>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <CommandGroup className="border-0">
              {suggestions.map((suggestion) => (
                <CommandItem
                  className="text-md py-4 md:py-2"
                  key={suggestion.properties.id}
                  onSelect={() => handleSelect(suggestion)}
                >
                  {suggestion.properties.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </>
  );
}
