import { Link } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";

export default function Home() {
  const { getStats } = useProgress();
  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Graz Straßen-Quiz
          </h1>
          <p className="text-slate-500 text-lg">
            Lerne die {stats.total} wichtigsten Straßen und Plätze von Graz
          </p>
        </div>

        {/* Modi-Karten */}
        <div className="space-y-4">
          <Link to="/wo-liegt" className="block">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-4">
                <div className="text-3xl">📍</div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Wo liegt...?
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Straßenname wird genannt – klicke auf die richtige Stelle
                    auf der Karte
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/wie-heisst" className="block">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-emerald-500">
              <div className="flex items-center gap-4">
                <div className="text-3xl">✏️</div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Wie heißt...?
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Ein Punkt auf der Karte wird markiert – tippe den
                    Straßennamen
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/fortschritt" className="block">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-amber-500">
              <div className="flex items-center gap-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Mein Fortschritt
                  </h2>
                  <p className="text-slate-500 mt-1">
                    {stats.attempted > 0
                      ? `${stats.attempted} von ${stats.total} Straßen gelernt · ${Math.round(stats.avgRate * 100)}% richtig`
                      : "Noch keine Straßen geübt – leg los!"}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-10">
          Daten: OpenStreetMap · Kein Login nötig · Fortschritt wird lokal
          gespeichert
        </p>
      </div>
    </div>
  );
}
