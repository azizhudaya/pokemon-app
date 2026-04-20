"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePokemonIndex } from "@/features/pokemon-data/hooks";
import { useDebouncedValue } from "@/components/ui/hooks/use-debounced-value";
import type { PokemonIndexEntry } from "@/types/pokemon";

interface PokemonPickerProps {
  value: { id: number; name: string } | null;
  onSelect: (payload: { id: number; name: string } | null) => void;
}

const MAX_SUGGESTIONS = 12;

export function PokemonPicker({ value, onSelect }: PokemonPickerProps) {
  const { data: index, isLoading, isError } = usePokemonIndex();
  const [rawQuery, setRawQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const debouncedQuery = useDebouncedValue(rawQuery, 150);

  const suggestions = useMemo(() => {
    if (!index) return [];
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) {
      return index.slice(0, MAX_SUGGESTIONS);
    }
    const matches: PokemonIndexEntry[] = [];
    for (const entry of index) {
      if (entry.name.includes(normalized)) {
        matches.push(entry);
        if (matches.length === MAX_SUGGESTIONS) break;
      }
    }
    return matches;
  }, [index, debouncedQuery]);

  // Reset highlight when the query changes. This is the idiomatic "reset-state-
  // on-prop-change" pattern from the React docs; cheaper than a useEffect
  // cascade and avoids the react-hooks lint rule.
  const [trackedQuery, setTrackedQuery] = useState(debouncedQuery);
  if (trackedQuery !== debouncedQuery) {
    setTrackedQuery(debouncedQuery);
    setActiveIndex(0);
  }

  const handleSelect = useCallback(
    (entry: PokemonIndexEntry) => {
      onSelect({ id: entry.id, name: entry.name });
      setRawQuery("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [onSelect],
  );

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      if (suggestions[activeIndex]) {
        event.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setRawQuery("");
      inputRef.current?.blur();
    }
  };

  const displayValue = value ? toDisplay(value.name) : "";
  const placeholder = isLoading ? "LOADING INDEX..." : "SEARCH POKÉMON...";

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border border-hairline bg-void px-3 py-2">
        <span className="label mono text-fg-muted shrink-0">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={open ? rawQuery : rawQuery || displayValue}
          onChange={(e) => {
            setRawQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          disabled={isLoading || isError}
          aria-label="Pokémon search"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className="mono w-full bg-transparent text-fg text-xs outline-none placeholder:text-fg-muted uppercase tracking-wider"
          role="combobox"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setRawQuery("");
            }}
            aria-label="Clear selection"
            className="label text-fg-muted hover:text-alert transition-colors"
          >
            CLR
          </button>
        ) : null}
      </div>
      {open && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 top-full left-0 right-0 mt-1 max-h-72 overflow-auto bg-panel-elev border border-hairline-strong animate-slide-up"
        >
          {suggestions.map((entry, i) => (
            <li
              key={entry.id}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(entry)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`mono text-xs px-3 py-1.5 cursor-pointer flex items-center justify-between ${
                i === activeIndex ? "bg-hairline text-accent" : "text-fg-dim"
              }`}
            >
              <span className="uppercase tracking-wider">{entry.displayName}</span>
              <span className="label text-fg-muted">#{String(entry.id).padStart(4, "0")}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function toDisplay(name: string): string {
  return name
    .split("-")
    .map((part) => (part.length === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}
