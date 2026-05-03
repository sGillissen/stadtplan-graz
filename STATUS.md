# Stadtplan Graz — Status

**Letzte Aktualisierung:** 03.05.2026
**Slug:** `stadtplan-graz`
**Kontext:** `./CONTEXT.md`
**Repo:** GitHub `sGillissen/stadtplan-graz`
**Deployment:** [stadtplan-graz.pages.dev](https://stadtplan-graz.pages.dev) (Cloudflare Pages, Auto-Deploy bei Push auf `main`)

## Aktueller Stand

Interaktiver Stadtplan von Graz mit Straßenverläufen, Adress-Suche und POI-Layern (Seniorenheime, Spitäler, Schulen, Stadtbezirke). Startseite zeigt direkt die Kartenansicht.

**Architektur:** Vite + React + TypeScript + Tailwind (SPA), Leaflet für die Karte (OpenStreetMap-Tiles), Supabase als Backend (Auth + DB, aktuell nicht aktiv genutzt).

## Offene Punkte

| Prio | Thema |
|---|---|
| niedrig | **Quiz-Dateien aufräumen** — `Home.tsx`, `QuizLocation.tsx`, `QuizName.tsx`, `Progress.tsx`, `useProgress.ts`, `streets.ts` liegen noch im Repo (tree-shaked) |
| optional | **Weitere POI-Layer** — Apotheken, Kindergärten etc. leicht ergänzbar dank generischem `poiMarkers`-System |
| optional | **Bekannte Straßen geräteübergreifend** — aktuell nur localStorage; bei Bedarf Supabase-Anbindung |
| optional | **Bottom-Sheet Drag-Geste** — derzeit nur Toggle-Button (3 States); Drag-Geste später nachrüstbar |

## Verlauf

### 03.05.2026 — Session 16
- ✅ **Bekannte Straßen markieren:** Checkbox pro Straße in der Sidebar (links neben Typ-Punkt); Persistenz in `localStorage` (Key `stadtplan_known_streets`); bekannte Straßen werden in der Liste gedimmt; neuer Filter-Button „Nur unbekannte" als eigene Zeile unter den Typ-Filtern (kostet keine Breite); Footer zeigt Anzahl bekannter Straßen
- ✅ **Mobile-Layout (Bottom-Sheet-Pattern):** Karte vollflächig, Sidebar als Bottom-Sheet mit 3 States (zu/peek/voll) per Toggle-Button; Auto-Collapse nach Klick auf Straße oder Suchergebnis; Header auf Mobile mit Icon-only-Chips; Touch-Targets vergrößert (Listeneintrag py-3, Checkbox 20×20); iOS-Auto-Zoom auf Inputs verhindert (font-size 16px); Default-Sheet-State auf Mobile = voll; Adress-Suche (Nominatim) auf Mobile ausgeblendet (Suche läuft nur via Listen-Filter)

### 16.04.2026 — Session 15
- ✅ **Alle Straßen als 4. Button:** 1.997 zusätzliche Straßen (tertiary, residential, living_street, unclassified, pedestrian) aus Overpass API; neue Datei `streetRoutesAll.ts` (1,4 MB) wird per Lazy-Load (`import()`) erst beim Klick auf „Alle" geladen → eigener Vite-Chunk, kein Impact auf initiale Ladezeit; Buttons umbenannt: H+N / Haupt / Neben / Alle
- ✅ **146 Schulen als neuer POI-Layer:** Daten extrahiert von schulverzeichnis.eu; 7 Kategorien (Volksschule, Sonderschule, Mittelschule, Gymnasium, BHS, Hochschule, Musikschule) mit je eigener Pin-Farbe; Toggle-Button `🎓 Schulen (146)` im Header; Koordinaten via Nominatim geocodiert

### 14.04.2026 — Session 14
- ✅ **Layout-Bug-Fix beim Zoomen mit Pins:** Header + Sidebar verschwanden beim Zoomen, wenn POI-Layer aktiv waren. Ursache: Flex-Kinder haben per Default `min-width/min-height: auto` → Leaflet-Inhalte konnten den Flex-Container aufblasen und Geschwister-Elemente aus dem Viewport drücken. Fix: `min-w-0 min-h-0` auf beide `flex-1`-Container, zusätzlich `overflow-hidden` auf den Map-Wrapper und global `overflow:hidden` auf `html/body` als Sicherheitsnetz
- ✅ **17 Stadtbezirke als neuer Layer:** Toggle-Button `🏛 Bezirke (17)` im Header; Polygone aus OSM Overpass (relation 34719, `admin_level=9`); statische Datei `src/data/bezirke.ts` (~150 kB) mit 6-Farben-Palette (rotierend), 18% Füllung, Tooltip „Nr. Name"
- ✅ **Wichtige OSM-Erkenntnis:** Graz ist „Statutarstadt" → OSM-`admin_level=6` (nicht 8!). Deshalb schlugen die ersten Overpass-Queries mit `area["name"="Graz"]["admin_level"="8"]` fehl. Lösung: Relation-ID direkt verwenden (`area(3600034719)`). Für alle künftigen OSM-Abfragen auf Graz gilt: Graz = `admin_level=6`, Stadtbezirke = `admin_level=9`
- ✅ **GrazMap erweitert:** Neue Prop `polygons` (React-Leaflet `Polygon` mit `rings: [number,number][][]`); zuerst gerendert, damit Straßen + Marker darüber liegen

### 14.04.2026 — Session 13
- ✅ **Straßenverläufe vervollständigt:** Overpass-Abfrage auf alle Highway-Typen erweitert (primary, secondary, tertiary, residential, unclassified); 3.063 Segmente; Straßen wie Jahngasse jetzt komplett dargestellt
- ✅ **Favicon + Titel:** Neues SVG-Karten-Icon statt Lovable-Logo; Titel „Stadtplan Graz"
- ✅ **26 Seniorenheime als POI-Layer:** Toggle-Button im Header; grüne Marker (GGZ/städtisch) + blaue Marker (privat); Klick → Popup mit Name, Adresse, Telefon, Kategorie; Quellen: PDF Sozialamt + kliniken.de
- ✅ **11 Spitäler als POI-Layer:** Zweiter Toggle-Button; rote Marker (öffentlich) + violette Marker (Privatkliniken); Klick → Popup; Quelle: kliniken.de
- ✅ **Leaflet z-Index-Fix:** `isolation: isolate` auf dem Karten-Container verhindert, dass Leaflet-Panes (z-200 bis z-800) Header/Sidebar überdecken
- ✅ **Sonstige-Filter entfernt:** Keine tertiary-Straßen in den Daten, Button hatte keine Funktion
- ✅ **GrazMap um `poiMarkers`-Prop erweitert:** Generische POI-Marker mit SVG-Pin-Icons und Popup-Support; weitere Kategorien leicht ergänzbar

### 14.04.2026 — Session 12
- ✅ Quiz-Bereich komplett entfernt; `/` zeigt direkt MapView; Nominatim-Suche wiederhergestellt

### 14.04.2026 — Session 11
- ✅ Stadtplan-Menüpunkt; 130+ Straßenverläufe via Overpass API; Sidebar mit Filter + Typ-Buttons; GrazMap-Erweiterung
