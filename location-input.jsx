"use client";

import { useState, useRef, useCallback } from "react";
import { MapPin, Loader2, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { suggestCorrections } from "@/lib/indian-cities";

export function LocationInput({ label, placeholder, value, onChange, icon }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const debounceRef = useRef(null);

  const searchLocation = useCallback(
    async (q) => {
      if (q.length < 2) {
        setResults([]);
        setSuggestions([]);
        setShowDropdown(false);
        setNoResults(false);
        return;
      }

      setIsLoading(true);
      setNoResults(false);
      setSuggestions([]);

      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(q)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);

          if (data.length > 0) {
            setShowDropdown(true);
            setSuggestions([]);
            setNoResults(false);
          } else {
            // No results found -- provide "Did you mean?" corrections
            const corrections = suggestCorrections(q);
            setSuggestions(corrections);
            setShowDropdown(corrections.length > 0);
            setNoResults(true);
          }
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(null);
    setNoResults(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchLocation(val);
    }, 350);
  };

  const handleSelect = (result) => {
    setQuery(result.displayName.split(",").slice(0, 2).join(","));
    onChange(result);
    setShowDropdown(false);
    setResults([]);
    setSuggestions([]);
    setNoResults(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowDropdown(false);
    setSuggestions([]);
    setNoResults(false);
    onChange(null);
    // Trigger a new search with the corrected name
    searchLocation(suggestion);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setResults([]);
    setSuggestions([]);
    setShowDropdown(false);
    setNoResults(false);
  };

  return (
    <div className="relative">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
        {icon}
        {label}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value ? value.displayName.split(",").slice(0, 2).join(",") : query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0 || suggestions.length > 0) setShowDropdown(true);
          }}
          className="pl-10 pr-10 bg-card text-card-foreground border-border focus:border-primary focus:ring-primary"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
        )}
        {!isLoading && (value || query) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Clear ${label}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {/* "Did you mean?" suggestions for misspelled queries */}
          {noResults && suggestions.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs text-muted-foreground bg-secondary flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>No results found. Did you mean:</span>
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2.5 text-sm text-primary font-medium hover:bg-secondary transition-colors flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </>
          )}

          {/* Normal geocode results */}
          {!noResults &&
            results.map((result, index) => (
              <button
                key={`${result.lat}-${result.lon}-${index}`}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-2.5 text-sm text-card-foreground hover:bg-secondary transition-colors flex items-start gap-2"
              >
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="line-clamp-2">{result.displayName}</span>
              </button>
            ))}
        </div>
      )}

      {/* No results and no suggestions either */}
      {noResults && suggestions.length === 0 && !isLoading && query.length >= 2 && (
        <p className="mt-1 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          No location found. Please check the spelling.
        </p>
      )}

      {value && (
        <p className="mt-1 text-xs text-primary flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
          Location confirmed
        </p>
      )}
    </div>
  );
}
