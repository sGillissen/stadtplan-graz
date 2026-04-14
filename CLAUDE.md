# Stadtplan Graz

## Projekt-Info
- **Repo:** sGillissen/stadtplan-graz
- **URL:** stadtplan-graz.pages.dev
- **Stack:** Vite + React + TypeScript + Tailwind + Leaflet
- **Deployment:** Cloudflare Pages via GitHub Actions (Push auf `main`)
- **Backend:** Supabase (Auth + DB) – aktuell nicht aktiv genutzt

## Architektur

### Seiten (React Router)
| Route | Seite | Beschreibung |
|-------|-------|-------------|
| `/` | MapView | Interaktiver Stadtplan (Startseite) |
| `/stadtplan` | Redirect → `/` | Alte URL, leitet um |

### Wichtige Komponenten
- `GrazMap.tsx` – Wiederverwendbare Leaflet-Karte mit Props: `markers`, `polylines`, `poiMarkers`, `flyTo`, `fitBounds`, `onMapClick`, `crosshair`, `clickDisabled`
- `MapView.tsx` – Stadtplan-Ansicht mit zwei Suchfeldern (Nominatim + Listen-Filter), Sidebar (Straßenliste), POI-Toggle-Buttons und Karte

### Daten
- `src/data/streetRoutes.ts` – 147 Straßenverläufe aus OpenStreetMap Overpass API (primary + secondary + tertiary/residential); statisch generiert, 3.063 Segmente als Koordinaten-Arrays
- `src/data/seniorenheime.ts` – 26 Pflegeheime/Seniorenheime in Graz (4 GGZ + 22 privat); Koordinaten via Nominatim geocodiert
- `src/data/spitaeler.ts` – 11 Krankenhäuser in Graz (7 öffentlich + 4 privat); Koordinaten via Nominatim geocodiert

### POI-System (Points of Interest)
- Generische `poiMarkers`-Prop auf GrazMap: Array von `{ lat, lng, name, details, color }`
- SVG-Pin-Icons via `L.divIcon` mit konfigurierbarer Farbe (`createColorIcon()`)
- Popup mit Name + mehrzeiligen Details (Adresse, Telefon, Kategorie)
- Toggle-Buttons im Header: jeder POI-Layer einzeln ein/ausschaltbar
- Farbschema: Seniorenheime grün (GGZ) / blau (privat); Spitäler rot (öffentlich) / violett (privat)
- **Neue Kategorien ergänzen:** Datendatei anlegen → in MapView importieren → State + Button + poiMarkers-Logik ergänzen

### Nicht mehr genutzte Dateien (Quiz-Überreste)
- `src/pages/Home.tsx`, `QuizLocation.tsx`, `QuizName.tsx`, `Progress.tsx` – alte Quiz-Seiten, nicht importiert
- `src/data/streets.ts` – Quiz-Straßendaten, nicht importiert
- `src/hooks/useProgress.ts` – Quiz-Fortschritt, nicht importiert

## Patterns & Konventionen

### Leaflet z-Index / Stacking Context
- Leaflet-Panes haben z-Index 200-800 (Tiles 200, Marker 600, Popup 700, Controls 800)
- **Lösung:** Karten-Container bekommt `isolation: isolate` (Tailwind-Klasse `isolate`) → erzeugt eigenen Stacking Context, Leaflet-z-Indices können nicht über Header/Sidebar hinauswachsen
- Header bekommt `relative z-20`, Sidebar `relative z-10` als zusätzliche Absicherung
- Such-Dropdown über der Karte braucht `z-[1000]` auf dem **Wrapper-Div** (nicht nur auf dem Dropdown-Element selbst – Kind-Elemente können nie über dem Stacking Context des Eltern-Elements hinaus)
- `z-index: 0` allein reicht NICHT als Stacking-Context-Fix (hat in Produktion nicht funktioniert), `isolation: isolate` ist zuverlässiger

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
