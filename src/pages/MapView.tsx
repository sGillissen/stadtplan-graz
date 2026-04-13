import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import GrazMap from "@/components/GrazMap";
import { streetRoutes, StreetRoute } from "@/data/streetRoutes";

export default function MapView() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<StreetRoute | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "primary" | "secondary">("all");

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
      color: selected.type === "primary" ? "#e63946" : "#f4a261",
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

      {/* Hauptbereich: Sidebar + Karte */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r flex flex-col shrink-0">
          {/* Suchfeld */}
          <div className="p-3 border-b space-y-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Straße suchen…"
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
            </div>
          </div>

          {/* Straßenliste */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelected(s === selected ? null : s)}
                className={`w-full text-left px-3 py-2 text-sm border-b transition-colors flex items-center gap-2 ${
                  selected?.name === s.name
                    ? "bg-violet-50 text-violet-900 font-medium"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                    s.type === "primary" ? "bg-red-500" : "bg-amber-400"
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
          />
        </div>
      </div>
    </div>
  );
}
