import { useState, useCallback } from "react";
import { streets, type Street } from "@/data/streets";

export interface StreetProgress {
  correct: number;
  total: number;
  lastAsked: number; // timestamp
}

type ProgressMap = Record<string, StreetProgress>;

const STORAGE_KEY = "graz-streets-progress";

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(loadProgress);

  /** Antwort aufzeichnen */
  const recordAnswer = useCallback((streetName: string, correct: boolean) => {
    setProgress((prev) => {
      const entry = prev[streetName] || { correct: 0, total: 0, lastAsked: 0 };
      const updated: ProgressMap = {
        ...prev,
        [streetName]: {
          correct: entry.correct + (correct ? 1 : 0),
          total: entry.total + 1,
          lastAsked: Date.now(),
        },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  /**
   * Nächste Straße auswählen (gewichtet):
   * - Nie gefragte Straßen haben höchste Priorität
   * - Straßen mit hoher Fehlerquote kommen öfter
   * - Optional: letzte Straße ausschließen
   */
  const getNextStreet = useCallback(
    (excludeName?: string): Street => {
      const candidates = streets.filter((s) => s.name !== excludeName);

      // Gewichte berechnen
      const weights = candidates.map((s) => {
        const entry = progress[s.name];
        if (!entry || entry.total === 0) return 10; // nie gefragt → höchste Priorität
        const errorRate = 1 - entry.correct / entry.total;
        return 1 + errorRate * 6; // 1 (alles richtig) bis 7 (alles falsch)
      });

      // Gewichteter Zufall
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalWeight;
      for (let i = 0; i < candidates.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return candidates[i];
      }
      return candidates[candidates.length - 1];
    },
    [progress]
  );

  /** Fortschritt für eine Straße abfragen */
  const getStreetProgress = useCallback(
    (streetName: string): StreetProgress | undefined => {
      return progress[streetName];
    },
    [progress]
  );

  /** Alle Statistiken */
  const getStats = useCallback(() => {
    const total = streets.length;
    const attempted = Object.keys(progress).length;
    const totalCorrect = Object.values(progress).reduce((s, p) => s + p.correct, 0);
    const totalAttempts = Object.values(progress).reduce((s, p) => s + p.total, 0);
    const avgRate = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    return { total, attempted, totalCorrect, totalAttempts, avgRate };
  }, [progress]);

  /** Fortschritt zurücksetzen */
  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({});
  }, []);

  return {
    progress,
    recordAnswer,
    getNextStreet,
    getStreetProgress,
    getStats,
    resetProgress,
  };
}
