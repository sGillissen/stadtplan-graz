import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import GrazMap from "@/components/GrazMap";
import { useProgress } from "@/hooks/useProgress";
import type { Street } from "@/data/streets";

/** Einfacher Vergleich: Groß-/Kleinschreibung, Leerzeichen, Bindestriche tolerant */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ßẞ]/g, "ss")
    .replace(/[-–—]/g, "")
    .replace(/\s+/g, "")
    .replace(/strasse/g, "straße")
    .replace(/platz$/g, "platz")
    .replace(/gasse$/g, "gasse")
    .trim();
}

function isCorrect(input: string, target: string): boolean {
  const a = normalize(input);
  const b = normalize(target);
  if (a === b) return true;

  // Toleranz: "straße" vs "str" vs "str." am Ende
  const aShort = a.replace(/(straße|strasse|str\.?)$/, "");
  const bShort = b.replace(/(straße|strasse|str\.?)$/, "");
  if (aShort === bShort && aShort.length > 3) return true;

  // Levenshtein-Distanz ≤ 2 für Tippfehler
  if (levenshtein(a, b) <= 2) return true;

  return false;
}

function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[m][n];
}

export default function QuizName() {
  const { getNextStreet, recordAnswer } = useProgress();
  const [currentStreet, setCurrentStreet] = useState<Street>(() =>
    getNextStreet()
  );
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [sessionScore, setSessionScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Input fokussieren
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentStreet]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (answered || !input.trim()) return;

      const ok = isCorrect(input.trim(), currentStreet.name);
      setCorrect(ok);
      setAnswered(true);
      if (ok) setSessionScore((s) => s + 1);
      recordAnswer(currentStreet.name, ok);
    },
    [answered, input, currentStreet, recordAnswer]
  );

  const nextQuestion = useCallback(() => {
    setCurrentStreet(getNextStreet(currentStreet.name));
    setInput("");
    setAnswered(false);
    setCorrect(false);
    setQuestionCount((c) => c + 1);
  }, [getNextStreet, currentStreet.name]);

  // Marker: pulsierender Punkt an der richtigen Stelle
  const markers = [
    {
      lat: currentStreet.lat,
      lng: currentStreet.lng,
      color: answered ? (correct ? "#22c55e" : "#ef4444") : "#6366f1",
      pulse: !answered,
      label: answered ? currentStreet.name : undefined,
    },
  ];

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
          Frage {questionCount} · Richtig: {sessionScore}
        </div>
      </div>

      {/* Frage */}
      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 text-center shrink-0">
        <p className="text-sm text-emerald-700 font-medium">
          Wie heißt die markierte Straße?
        </p>
        {currentStreet.hint && !answered && (
          <p className="text-xs text-emerald-500 mt-1">
            Hinweis: {currentStreet.hint}
          </p>
        )}
      </div>

      {/* Karte */}
      <div className="flex-1 relative">
        <GrazMap markers={markers} flyTo={[currentStreet.lat, currentStreet.lng]} />
      </div>

      {/* Eingabe / Ergebnis */}
      <div className="bg-white border-t px-4 py-4 shrink-0">
        <div className="max-w-lg mx-auto">
          {!answered ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Straßenname eingeben..."
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                Prüfen
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                {correct ? (
                  <span className="text-lg font-bold text-green-600">
                    Richtig! ✓
                  </span>
                ) : (
                  <div>
                    <span className="text-lg font-bold text-red-500">
                      Falsch
                    </span>
                    <span className="text-slate-500 ml-2">
                      Richtig wäre:{" "}
                      <strong className="text-slate-800">
                        {currentStreet.name}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={nextQuestion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                Nächste Frage →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
