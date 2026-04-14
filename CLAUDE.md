# Stadtplan Graz – Straßen-Quiz

## Projekt-Info
- **Repo:** sGillissen/stadtplan-graz
- **URL:** stadtplan-graz.pages.dev
- **Stack:** Vite + React + TypeScript + Tailwind + Leaflet
- **Deployment:** Cloudflare Pages via GitHub Actions (Push auf `main`)
- **Backend:** Supabase (Auth + DB)

## Architektur

### Seiten (React Router)
| Route | Seite | Beschreibung |
|-------|-------|-------------|
| `/` | Home | Startseite mit Menükarten |
| `/stadtplan` | MapView | Interaktiver Stadtplan mit Straßenliste |
| `/wo-liegt` | QuizLocation | Quiz: Name → Klick auf Karte |
| `/wie-heisst` | QuizName | Quiz: Marker → Name eintippen |
| `/fortschritt` | Progress | Lernfortschritt-Übersicht |

### Wichtige Komponenten
- `GrazMap.tsx` – Wiederverwendbare Leaflet-Karte mit Props: `markers`, `polylines`, `flyTo`, `fitBounds`, `onMapClick`, `crosshair`, `clickDisabled`
- `MapView.tsx` – Stadtplan-Ansicht mit Sidebar (Straßenliste + Filter) und Karte

### Daten
- `src/data/streets.ts` – Quiz-Straßen mit Name + Koordinaten (für Quiz-Modi)
- `src/data/streetRoutes.ts` – 130+ Straßenverläufe aus OpenStreetMap Overpass API (primary + secondary Roads); statisch generiert, Segmente als Koordinaten-Arrays

## Patterns & Konventionen

### Leaflet z-Index
- Leaflet-Karten-Elemente haben z-Index 200-400+
- UI-Elemente die über der Karte schweben müssen `z-[1000]` oder höher haben
- Stacking Context beachten: Kind-Elemente können nie über dem z-Index ihres Eltern-Elements hinausragen

### Overpass API (OpenStreetMap-Daten)
- Für statische Straßendaten: `[out:json]` Query mit `area["name"="Graz"]` Filter
- `highway=primary` = gelbe Hauptstraßen, `highway=secondary` = wichtige Nebenstraßen
- Ways bestehen aus Node-IDs → separate Auflösung zu Koordinaten nötig (`>;out skel qt;`)
- Daten werden als TypeScript-Datei generiert (kein Runtime-API-Call)

### Nominatim API (Geocoding)
- Freiform-Suche: `q=Suchbegriff Graz` funktioniert besser als strukturierte `street=` Parameter
- `accept-language=de` als URL-Parameter (nicht als Header, wegen CORS)
- `viewbox` + `bounded=1` schränkt Ergebnisse auf Graz ein
- Rate-Limit beachten: max 1 Request/Sekunde, Debounce 350-400ms reicht

## Deployment
- GitHub Actions: `.github/workflows/deploy.yml`
- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Cloudflare Pages Projekt: `stadtplan-graz`
- SPA-Routing funktioniert automatisch (Cloudflare Pages liefert index.html für alle Routen)
