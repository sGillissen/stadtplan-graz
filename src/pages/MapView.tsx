import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import GrazMap from "@/components/GrazMap";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

/** Nominatim-Suche auf Graz einschränken (Bounding-Box) */
const GRAZ_VIEWBOX = "15.35,47.02,15.52,47.12";

export default function MapView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [flyTo, setFlyTo] = useState<[number, number] | undefined>();
  const [marker, setMarker] = useState<
    { lat: number; lng: number; color: string; label: string }[]
  >([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Klick außerhalb schließt die Vorschlagsliste
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Nominatim-Abfrage
  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: q + ", Graz",
          format: "json",
          addressdetails: "1",
          limit: "5",
          viewbox: GRAZ_VIEWBOX,
          bounded: "1",
          "accept-language": "de",
        });
        const url = `https://nominatim.openstreetmap.org/search?${params}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setShowResults(data.length > 0);
      } catch (err) {
        console.error("Nominatim-Suche fehlgeschlagen:", err);
        setResults([]);
      }
    }, 350);
  }, []);

  function handleSelect(r: NominatimResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setFlyTo([lat, lng]);
    setMarker([{ lat, lng, color: "#6366f1", label: r.display_name.split(",")[0] }]);
    setQuery(r.display_name.split(",")[0]);
    setShowResults(false);
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">
          🗺️ Stadtplan Graz
        </h1>
        <Link
          to="/"
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Zurück
        </Link>
      </div>

      {/* Suchfeld */}
      <div className="bg-white px-4 py-2 border-b shrink-0 relative z-40" ref={wrapperRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Straße suchen…"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        {showResults && (
          <ul className="absolute left-4 right-4 bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
            {results.map((r) => (
              <li
                key={r.place_id}
                onClick={() => handleSelect(r)}
                className="px-3 py-2 text-sm hover:bg-violet-50 cursor-pointer border-b last:border-b-0"
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Karte */}
      <div className="flex-1">
        <GrazMap clickDisabled flyTo={flyTo} markers={marker} />
      </div>
    </div>
  );
}
