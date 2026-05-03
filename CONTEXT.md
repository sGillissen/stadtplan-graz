# Stadtplan Graz — Kontext

Interaktiver Stadtplan von Graz mit Straßenverläufen, Adress-Suche und POI-Layern (Seniorenheime, Spitäler, Schulen, Stadtbezirke).

## Steckbrief

| | |
|---|---|
| **Slug** | `stadtplan-graz` |
| **Tech** | Vite + React + TypeScript + Tailwind (SPA), Leaflet + OpenStreetMap, Supabase (Backend, aktuell nicht aktiv) |
| **Deploy** | [stadtplan-graz.pages.dev](https://stadtplan-graz.pages.dev) (Cloudflare Pages, Auto-Deploy bei Push auf `main`) |
| **GitHub** | sGillissen/stadtplan-graz |
| **Status** | Aktiv |

## Datenquellen

- **Straßen:** Overpass API (primary + secondary + tertiary/residential/living_street/unclassified/pedestrian)
- **Schulen:** schulverzeichnis.eu (Koordinaten via Nominatim geocodiert)
- **POI-System:** generischer `poiMarkers`-Layer, leicht erweiterbar (Apotheken, Kindergärten etc.)

## Notizen

Aktueller Stand + offene Punkte: `STATUS.md`.
