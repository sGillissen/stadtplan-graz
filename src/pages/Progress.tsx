import { Link } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import { streets } from "@/data/streets";

export default function Progress() {
  const { progress, getStats, resetProgress } = useProgress();
  const stats = getStats();

  // Alle Straßen mit ihrem Fortschritt, sortiert nach Fehlerquote (schlechteste zuerst)
  const streetList = streets
    .map((s) => {
      const p = progress[s.name];
      const rate = p && p.total > 0 ? p.correct / p.total : -1; // -1 = nie versucht
      return { ...s, progress: p, rate };
    })
    .sort((a, b) => {
      // Nie versucht ans Ende
      if (a.rate === -1 && b.rate === -1) return 0;
      if (a.rate === -1) return 1;
      if (b.rate === -1) return -1;
      return a.rate - b.rate; // Schlechteste zuerst
    });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="text-slate-500 hover:text-slate-700 text-sm font-medium"
          >
            ← Zurück
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Mein Fortschritt</h1>
          <div className="w-16" />
        </div>

        {/* Statistik-Karten */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {stats.attempted}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              von {stats.total} geübt
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.totalAttempts > 0
                ? Math.round(stats.avgRate * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-slate-500 mt-1">Trefferquote</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-amber-600">
              {stats.totalAttempts}
            </div>
            <div className="text-xs text-slate-500 mt-1">Versuche gesamt</div>
          </div>
        </div>

        {/* Fortschrittsbalken */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Gesamtfortschritt</span>
            <span>
              {stats.attempted} / {stats.total}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{
                width: `${(stats.attempted / stats.total) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Straßen-Liste */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h2 className="font-semibold text-slate-700 text-sm">
              Alle Straßen (schwächste zuerst)
            </h2>
          </div>
          <div className="divide-y max-h-[50vh] overflow-y-auto">
            {streetList.map((s) => (
              <div
                key={s.name}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-slate-800 text-sm">
                    {s.name}
                  </div>
                  <div className="text-xs text-slate-400">{s.district}</div>
                </div>
                <div className="text-right">
                  {s.progress ? (
                    <div>
                      <span
                        className={`text-sm font-semibold ${
                          s.rate >= 0.8
                            ? "text-green-600"
                            : s.rate >= 0.5
                              ? "text-yellow-600"
                              : "text-red-500"
                        }`}
                      >
                        {Math.round(s.rate * 100)}%
                      </span>
                      <div className="text-xs text-slate-400">
                        {s.progress.correct}/{s.progress.total}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">Noch nicht geübt</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        {stats.totalAttempts > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Wirklich den gesamten Fortschritt zurücksetzen?"
                  )
                ) {
                  resetProgress();
                }
              }}
              className="text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              Fortschritt zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
