import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import GrazMap from "@/components/GrazMap";
import { streetRoutes, StreetRoute } from "@/data/streetRoutes";
import { seniorenheime } from "@/data/seniorenheime";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function MapView() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<StreetRoute | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "primary" | "secondary" | "tertiary">("all");

  // Seniorenheime anzeigen
  const [showSeniorenheime, setShowSeniorenheime] = useState(false);

  // Nominatim-Suche
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | undefined>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Klick außerhalb schließt Dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Nominatim-Abfrage mit Debounce
  const doSearch = useCallback((q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(q + " Graz")}` +
      `&format=json&limit=6&countrycodes=at&accept-language=de` +
      `&viewbox=15.35,47.12,15.55,47.02&bounded=1`;
    fetch(url)
      .then((r) => r.json())
      .then((data: NominatimResult[]) => {
        setSearchResults(data);
        setShowDropdown(data.length > 0);
      })
      .catch(() => {
        setSearchResults([]);
        setShowDropdown(false);
      });
  }, []);

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    // Kurzname: erster Teil vor dem Komma
    const label = r.display_name.split(",")[0].trim();
    setSearchMarker({ lat, lng, label });
    setFlyTarget([lat, lng]);
    setSearchQuery(label);
    setShowDropdown(false);
    // Auswahl in der Straßenliste aufheben
    setSelected(null);
  };

  // Gefilterte Straßenliste
  const filtered = useMemo(() => {
    return streetRoutes
      .filter((s) => {
        if (typeFilter !== "all" && s.type !== typeFilter) return false;
        if (filter.trim().length > 0) {
          return s.name.toLowerCase().includes(filter.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [filter, typeFilter]);

  // Polylines für die Karte
  const polylines = useMemo(() => {
    if (!selected) return [];
    return selected.segments.map((seg) => ({
      positions: seg as [number, number][],
      color: selected.type === "primary" ? "#e63946" : selected.type === "secondary" ? "#f4a261" : "#8b9dc3",
      weight: 5,
      label: selected.name,
    }));
  }, [selected]);

  // Bounds berechnen für fitBounds
  const fitBounds = useMemo<[[number, number], [number, number]] | undefined>(() => {
    if (!selected) return undefined;
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const seg of selected.segments) {
      for (const [lat, lng] of seg) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
    }
    return [[minLat, minLng], [maxLat, maxLng]];
  }, [selected]);

  // POI-Marker für Seniorenheime
  const poiMarkers = useMemo(() => {
    if (!showSeniorenheime) return [];
    return seniorenheime.map((h) => ({
      lat: h.lat,
      lng: h.lng,
      name: h.name,
      details: `${h.adresse}, ${h.plz} Graz\n📞 ${h.telefon}\n${h.kategorie === "ggz" ? "🏥 GGZ (städtisch)" : "🏠 Privat"}`,
      color: h.kategorie === "ggz" ? "#16a34a" : "#2563eb",
    }));
  }, [showSeniorenheime]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">
          🗺️ Stadtplan Graz
        </h1>
        <button
          onClick={() => setShowSeniorenheime(!showSeniorenheime)}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
            showSeniorenheime
              ? "bg-green-600 text-white"
              : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
          }`}
        >
          🏥 Seniorenheime ({seniorenheime.length})
        </button>
      </div>

      {/* Hauptbereich: Sidebar + Karte */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r flex flex-col shrink-0">
          {/* Allgemeine Suche (Nominatim) */}
          <div ref={wrapperRef} className="p-3 border-b relative z-[1000]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              placeholder="🔍 Adresse / Ort suchen…"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {showDropdown && (
              <ul className="absolute left-3 right-3 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((r) => (
                  <li
                    key={r.place_id}
                    onClick={() => handleSelectResult(r)}
                    className="px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  >
                    {r.display_name.length > 60
                      ? r.display_name.substring(0, 60) + "…"
                      : r.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Liste filtern */}
          <div className="p-3 border-b space-y-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Liste filtern…"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            {/* Typ-Filter */}
            <div className="flex gap-1">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  typeFilter === "all"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Alle ({streetRoutes.length})
              </button>
              <button
                onClick={() => setTypeFilter("primary")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  typeFilter === "primary"
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                Hauptstraßen
              </button>
              <button
                onClick={() => setTypeFilter("secondary")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  typeFilter === "secondary"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Nebenstraßen
              </button>
              <button
                onClick={() => setTypeFilter("tertiary")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  typeFilter === "tertiary"
                    ? "bg-slate-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Sonstige
              </button>
            </div>
          </div>

          {/* Straßenliste */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  setSelected(s === selected ? null : s);
                  setSearchMarker(null);
                  setFlyTarget(undefined);
                }}
                className={`w-full text-left px-3 py-2 text-sm border-b transition-colors flex items-center gap-2 ${
                  selected?.name === s.name
                    ? "bg-violet-50 text-violet-900 font-medium"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                    s.type === "primary" ? "bg-red-500" : s.type === "secondary" ? "bg-amber-400" : "bg-slate-400"
                  }`}
                />
                {s.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-sm text-slate-400 text-center">
                Keine Straßen gefunden
              </p>
            )}
          </div>

          {/* Info */}
          <div className="p-3 border-t text-xs text-slate-400">
            {selected
              ? `${selected.name} · ${selected.segments.length} Segmente`
              : `${filtered.length} Straßen · Klicke zum Anzeigen`}
          </div>
        </div>

        {/* Karte */}
        <div className="flex-1">
          <GrazMap
            clickDisabled
            polylines={polylines}
            fitBounds={fitBounds}
            flyTo={flyTarget}
            markers={
              searchMarker
                ? [{ lat: searchMarker.lat, lng: searchMarker.lng, color: "#3b82f6", label: searchMarker.label }]
                : []
            }
            poiMarkers={poiMarkers}
          />
        </div>
      </div>
    </div>
  );
}
