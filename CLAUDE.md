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
- `GrazMap.tsx` – Wiederverwendbare Leaflet-Karte mit Props: `markers`, `polylines`, `polygons`, `poiMarkers`, `flyTo`, `fitBounds`, `onMapClick`, `crosshair`, `clickDisabled`
- `MapView.tsx` – Stadtplan-Ansicht mit zwei Suchfeldern (Nominatim + Listen-Filter), Sidebar (Straßenliste mit Checkboxen für „bekannt"), POI-Toggle-Buttons und Karte. Auf Mobile: Karte vollflächig + Bottom-Sheet für Sidebar.

### Daten
- `src/data/streetRoutes.ts` – 147 Straßenverläufe aus OpenStreetMap Overpass API (primary + secondary + tertiary/residential); statisch generiert, 3.063 Segmente als Koordinaten-Arrays
- `src/data/seniorenheime.ts` – 26 Pflegeheime/Seniorenheime in Graz (4 GGZ + 22 privat); Koordinaten via Nominatim geocodiert
- `src/data/spitaeler.ts` – 11 Krankenhäuser in Graz (7 öffentlich + 4 privat); Koordinaten via Nominatim geocodiert
- `src/data/bezirke.ts` – 17 Grazer Stadtbezirke als Polygon-Ringe `[lat,lng][][]`; aus OSM Overpass (relation 34719, `admin_level=9`); nummeriert I–XVII nach amtlicher Reihenfolge (Innere Stadt=1 … Puntigam=17); ~150 kB statisch im Repo
- `src/data/streetRoutesAll.ts` – 1.997 weitere Straßen (tertiary, residential, living_street, unclassified, pedestrian) aus Overpass API; wird per Lazy-Load erst bei Klick auf "Alle" geladen → eigener Vite-Chunk (1,5 MB / 411 KB gzip)
- `src/data/schulen.ts` – 146 Schulen in Graz (7 Kategorien: Volksschule, Sonderschule, Mittelschule, Gymnasium, BHS, Hochschule, Musikschule); Koordinaten via Nominatim geocodiert; Quelle: schulverzeichnis.eu

### POI-System (Points of Interest)
- Generische `poiMarkers`-Prop auf GrazMap: Array von `{ lat, lng, name, details, color }`
- SVG-Pin-Icons via `L.divIcon` mit konfigurierbarer Farbe (`createColorIcon()`)
- Popup mit Name + mehrzeiligen Details (Adresse, Telefon, Kategorie)
- Toggle-Buttons im Header: jeder POI-Layer einzeln ein/ausschaltbar
- Farbschema: Seniorenheime grün (GGZ) / blau (privat); Spitäler rot (öffentlich) / violett (privat); Schulen nach Typ (amber/violet/cyan/blue/emerald/red/pink)
- **Neue Kategorien ergänzen:** Datendatei anlegen → in MapView importieren → State + Button + poiMarkers-Logik ergänzen

### Straßen-Filter (4 Buttons)
- **H+N** (Default): primary + secondary aus `streetRoutes.ts` (147 Straßen)
- **Haupt**: nur primary
- **Neben**: nur secondary
- **Alle**: primary + secondary + Lazy-Load von `streetRoutesAll.ts` (1.997 weitere Straßen). Erster Klick triggert `import()`, danach gecacht. TypeFilter-State: `"hn" | "primary" | "secondary" | "alle"`

### Bekannte Straßen markieren („Lern-Modus")
- Checkbox pro Listeneintrag in der Sidebar; Klick auf Checkbox = toggelt „bekannt", Klick auf Rest = Straße auf Karte zeigen (`stopPropagation` auf Checkbox-Events)
- Persistenz: `localStorage`-Key `stadtplan_known_streets` als JSON-Array von Straßennamen (Name = unique Key, da pro Straße alle Segmente gruppiert sind)
- Visuelles Feedback: bekannte Straßen werden in der Liste gedimmt (`text-slate-400`)
- Filter „Nur unbekannte" als eigene Zeile unter den Typ-Filtern – kostet keine Breite und blendet bekannte Straßen aus der Liste aus
- Footer zeigt zusätzlich die Anzahl bekannter Straßen

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

### ⚠️ Graz ist in OSM `admin_level=6` (Statutarstadt!), nicht 8
- Graz ist eine Statutarstadt → in OpenStreetMap als `admin_level=6` getaggt, nicht als 8 wie normale Städte
- Queries wie `area["name"="Graz"]["admin_level"="8"]` finden **nichts**
- **Lösung:** Direkt mit Relation-ID arbeiten: Graz = `relation 34719` → Area-ID = `3600034719`
  ```
  area(3600034719)->.g;
  rel(area.g)["admin_level"="9"]["boundary"="administrative"];
  ```
- **Hierarchie in Graz:** `admin_level=6` = Stadt Graz, `admin_level=9` = 17 Stadtbezirke
- Alternativ kann `area["name"="Graz"]["admin_level"="6"]` verwendet werden
- Nominatim Lookup: `https://nominatim.openstreetmap.org/search?q=Graz&format=json` liefert `osm_id: 34719`

### Polygon-Rendering (Bezirke, Flächen)
- `GrazMap` hat eine `polygons`-Prop: Array von `{ rings: [number,number][][], color, fillColor, fillOpacity, weight, label }`
- Rings sind verschachtelte Arrays (`[lat,lng][][]`) – React-Leaflet `Polygon` akzeptiert das direkt, auch mehrere Ringe (Multipolygon) oder Löcher
- Polygone werden VOR den Polylines/Markern gerendert → Straßen und Pins liegen darüber
- Ring-Rekonstruktion aus OSM-Ways: Ways haben keine Reihenfolge, müssen an gemeinsamen Endpunkten verkettet werden (Python-Skript im Session-14-Log)
- Farbpalette für viele Polygone: rotierende 6-Farben-Palette (`i % 6`) mit 18% Füllung und 2px Rand – unterscheidbar ohne visuell zu überladen

### Mobile-Layout (Bottom-Sheet-Pattern)
- **Breakpoint:** Tailwind `md` (768 px). Unter md = Mobile, ab md = Desktop.
- **Layout:** Auf Mobile wird die Sidebar als Bottom-Sheet (absolute, bottom-0) über die vollflächige Karte gelegt; auf Desktop bleibt sie als statische Spalte links.
- **3 Sheet-States** via Toggle-Button (kein Drag): `closed` (h-12, nur Griff), `peek` (h-[260px], Suche+Filter), `full` (h-[75vh], inkl. Liste). Default auf Mobile = `full`. Cycle-Reihenfolge: closed → peek → full → closed.
- **Auto-Collapse** nach Klick auf Straße/Suchergebnis: `if (window.innerWidth < 768) setSheetState("closed")` → Karte wird sofort sichtbar.
- **Header auf Mobile:** Buttons als Icon-only-Chips (Emoji + Zahl), horizontal scrollbar (`overflow-x-auto`); Titel mit `hidden sm:block`, voller Button-Text mit `hidden md:inline`.
- **Touch-Targets:** Listeneintrag `py-3 md:py-2`, Checkbox `w-5 h-5`, sonst inneres `py-1` für Klick-Bereich.
- **Adress-Suche (Nominatim) auf Mobile ausgeblendet** (`hidden md:block`); Mobile-User sucht ausschließlich über das Listen-Filter-Feld.
- **iOS Auto-Zoom verhindern:** Globale CSS-Regel in `index.css` zwingt Inputs auf Mobile auf `font-size: 16px` (sonst zoomt iOS Safari beim Fokus rein).
- **⚠️ Tailwind position-Konflikt:** `absolute` und `relative` gleichzeitig in className → die Klasse, die in Tailwind's Stylesheet später kommt, gewinnt (= `relative`). Stattdessen sauber: `absolute md:static`.

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
