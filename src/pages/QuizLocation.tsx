import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import GrazMap from "@/components/GrazMap";
import { useProgress } from "@/hooks/useProgress";
import { distanceMeters, scoreFromDistance, type Street } from "@/data/streets";

export default function QuizLocation() {
  const { getNextStreet, recordAnswer } = useProgress();
  const [currentStreet, setCurrentStreet] = useState<Street>(() =>
    getNextStreet()
  );
  const [answered, setAnswered] = useState(false);
  const [clickPos, setClickPos] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [result, setResult] = useState<{
    distance: number;
    score: number;
    label: string;
    color: string;
  } | null>(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [sessionScore, setSessionScore] = useState(0);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (answered) return;

      const dist = distanceMeters(
        lat,
        lng,
        currentStreet.lat,
        currentStreet.lng
      );
      const res = scoreFromDistance(dist);

      setClickPos({ lat, lng });
      setResult({ distance: Math.round(dist), ...res });
      setAnswered(true);
      setSessionScore((s) => s + res.score);

      recordAnswer(currentStreet.name, res.score >= 2);
    },
    [answered, currentStreet, recordAnswer]
  );

  const nextQuestion = useCallback(() => {
    setCurrentStreet(getNextStreet(currentStreet.name));
    setAnswered(false);
    setClickPos(null);
    setResult(null);
    setQuestionCount((c) => c + 1);
  }, [getNextStreet, currentStreet.name]);

  // Marker für die Karte
  const markers = [];
  if (clickPos) {
    markers.push({
      lat: clickPos.lat,
      lng: clickPos.lng,
      color: "#ef4444",
      label: "Dein Klick",
    });
  }
  if (answered) {
    markers.push({
      lat: currentStreet.lat,
      lng: currentStreet.lng,
      color: "#22c55e",
      label: currentStreet.name,
    });
  }

  const line =
    answered && clickPos
      ? {
          from: [clickPos.lat, clickPos.lng] as [number, number],
          to: [currentStreet.lat, currentStreet.lng] as [number, number],
          color: "#94a3b8",
        }
      : undefined;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <Link
          to="/"
          className="text-slate-500 hover:text-slate-700 text-sm font-medium"
        >
          ← Zurück
        </Link>
        <div className="text-sm text-slate-400">
          Frage {questionCount} · Punkte: {sessionScore}
        </div>
      </div>

      {/* Frage */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-4 text-center shrink-0">
        <p className="text-sm text-blue-600 font-medium mb-1">
          Wo liegt diese Straße?
        </p>
        <h2 className="text-2xl font-bold text-blue-900">
          {currentStreet.name}
        </h2>
        {currentStreet.hint && (
          <p className="text-sm text-blue-500 mt-1">{currentStreet.hint}</p>
        )}
        {!answered && (
          <p className="text-xs text-blue-400 mt-2">
            Klicke auf die Karte, wo du die Straße vermutest
          </p>
        )}
      </div>

      {/* Karte */}
      <div className="flex-1 relative">
        <GrazMap
          onMapClick={handleMapClick}
          markers={markers}
          line={line}
          clickDisabled={answered}
          flyTo={
            answered
              ? [currentStreet.lat, currentStreet.lng]
              : undefined
          }
          crosshair={!answered}
        />
      </div>

      {/* Ergebnis-Leiste */}
      {answered && result && (
        <div className="bg-white border-t px-4 py-4 shrink-0">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <span className={`text-lg font-bold ${result.color}`}>
                {result.label}
              </span>
              <span className="text-slate-400 text-sm ml-2">
                ({result.distance} m entfernt)
              </span>
            </div>
            <button
              onClick={nextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Nächste Frage →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
