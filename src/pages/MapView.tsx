import { Link } from "react-router-dom";
import GrazMap from "@/components/GrazMap";

export default function MapView() {
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

      {/* Karte */}
      <div className="flex-1">
        <GrazMap clickDisabled />
      </div>
    </div>
  );
}
