import { useState, useRef, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  function triggerSearch(q: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setError("");

    if (q.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    timerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: q + " Graz",
          format: "json",
          addressdetails: "1",
          limit: "5",
          viewbox: GRAZ_VIEWBOX,
          bounded: "1",
          "accept-language": "de",
        });
        const url = `https://nominatim.openstreetmap.org/search?${params}`;
        console.log("[Stadtplan] Suche:", url);
        const res = await fetch(url);
        console.log("[Stadtplan] Status:", res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: NominatimResult[] = await res.json();
        console.log("[Stadtplan] Ergebnisse:", data.length);
        setResults(data);
        setShowResults(data.length > 0);
        if (data.length === 0) setError("Keine Ergebnisse gefunden");
      } catch (err) {
        console.error("[Stadtplan] Fehler:", err);
        setError("Suche fehlgeschlagen – bitte nochmal versuchen");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  function handleSelect(r: NominatimResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setFlyTo([lat, lng]);
    setMarker([{ lat, lng, color: "#6366f1", label: r.display_name.split(",")[0] }]);
    setQuery(r.display_name.split(",")[0]);
    setShowResults(false);
    setError("");
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
      <div className="bg-white px-4 py-2 border-b shrink-0 relative z-[1000]" ref={wrapperRef}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              triggerSearch(e.target.value);
            }}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Straße suchen…"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              Suche…
            </div>
          )}
        </div>
        {error && !showResults && (
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        )}
        {showResults && (
          <ul className="absolute left-4 right-4 bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-[1000]">
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
