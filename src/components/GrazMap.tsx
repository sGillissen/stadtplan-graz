import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Polyline,
  Polygon,
  Popup,
  Tooltip,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/** Graz Zentrum */
const GRAZ_CENTER: [number, number] = [47.0707, 15.4387];
const DEFAULT_ZOOM = 13;

interface GrazMapProps {
  /** Wird aufgerufen wenn der User auf die Karte klickt */
  onMapClick?: (lat: number, lng: number) => void;
  /** Markierung auf der Karte anzeigen (z.B. richtige Position) */
  markers?: Array<{
    lat: number;
    lng: number;
    color: string;
    label?: string;
    pulse?: boolean;
  }>;
  /** Linie zwischen zwei Punkten */
  line?: { from: [number, number]; to: [number, number]; color?: string };
  /** Mehrere Polylines (z.B. Straßenverläufe) */
  polylines?: Array<{
    positions: [number, number][];
    color?: string;
    weight?: number;
    label?: string;
  }>;
  /** Klick deaktivieren */
  clickDisabled?: boolean;
  /** Karte nach Antwort auf bestimmten Punkt zentrieren */
  flyTo?: [number, number];
  /** Auf Bounds zoomen (statt flyTo-Punkt) */
  fitBounds?: [[number, number], [number, number]];
  /** POI-Marker mit Popup (z.B. Seniorenheime) */
  poiMarkers?: Array<{
    lat: number;
    lng: number;
    name: string;
    details?: string;
    color?: string;
  }>;
  /** Polygone (z.B. Stadtbezirke) */
  polygons?: Array<{
    rings: [number, number][][];
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
    weight?: number;
    label?: string;
  }>;
  /** Cursor-Stil */
  crosshair?: boolean;
}

/** Klick-Handler als Leaflet-Hook */
function ClickHandler({
  onClick,
  disabled,
}: {
  onClick?: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled && onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

/** Fly-to Animation */
function FlyToHandler({ position }: { position?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

/** Fit-Bounds Animation */
function FitBoundsHandler({ bounds }: { bounds?: [[number, number], [number, number]] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, duration: 0.8 });
    }
  }, [bounds, map]);
  return null;
}

/** Farbiger SVG-Marker als Leaflet-Icon */
function createColorIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="11" r="4.5" fill="#fff"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -32],
  });
}

export default function GrazMap({
  onMapClick,
  markers = [],
  line,
  polylines = [],
  poiMarkers = [],
  polygons = [],
  clickDisabled,
  flyTo,
  fitBounds,
  crosshair,
}: GrazMapProps) {
  return (
    <MapContainer
      center={GRAZ_CENTER}
      zoom={DEFAULT_ZOOM}
      className={`w-full h-full rounded-lg ${crosshair ? "cursor-crosshair" : ""}`}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Polygone (z.B. Stadtbezirke) – zuerst gezeichnet, damit Straßen & Marker darüber liegen */}
      {polygons.map((p, i) => (
        <Polygon
          key={`poly-${i}`}
          positions={p.rings}
          pathOptions={{
            color: p.color || "#7c3aed",
            fillColor: p.fillColor || p.color || "#7c3aed",
            fillOpacity: p.fillOpacity ?? 0.15,
            weight: p.weight || 2,
          }}
        >
          {p.label && (
            <Tooltip sticky>
              <span className="font-semibold">{p.label}</span>
            </Tooltip>
          )}
        </Polygon>
      ))}

      <ClickHandler onClick={onMapClick} disabled={clickDisabled} />
      <FlyToHandler position={flyTo} />
      <FitBoundsHandler bounds={fitBounds} />

      {/* Polylines (Straßenverläufe) */}
      {polylines.map((p, i) => (
        <Polyline
          key={i}
          positions={p.positions}
          pathOptions={{
            color: p.color || "#e63946",
            weight: p.weight || 4,
            opacity: 0.8,
          }}
        >
          {p.label && (
            <Tooltip sticky>
              <span className="font-semibold">{p.label}</span>
            </Tooltip>
          )}
        </Polyline>
      ))}

      {/* Verbindungslinie (z.B. Klick ↔ richtige Position) */}
      {line && (
        <Polyline
          positions={[line.from, line.to]}
          pathOptions={{
            color: line.color || "#666",
            dashArray: "8 8",
            weight: 2,
          }}
        />
      )}

      {/* Marker */}
      {markers.map((m, i) => (
        <CircleMarker
          key={i}
          center={[m.lat, m.lng]}
          radius={m.pulse ? 18 : 10}
          pathOptions={{
            color: m.color,
            fillColor: m.color,
            fillOpacity: m.pulse ? 0.3 : 0.6,
            weight: m.pulse ? 3 : 2,
            className: m.pulse ? "pulse-marker" : "",
          }}
        >
          {m.label && (
            <Tooltip permanent direction="top" offset={[0, -12]}>
              <span className="font-semibold">{m.label}</span>
            </Tooltip>
          )}
        </CircleMarker>
      ))}

      {/* POI-Marker mit Popup */}
      {poiMarkers.map((poi, i) => (
        <Marker
          key={`poi-${i}`}
          position={[poi.lat, poi.lng]}
          icon={createColorIcon(poi.color || "#16a34a")}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong style={{ fontSize: 13 }}>{poi.name}</strong>
              {poi.details && (
                <div style={{ fontSize: 12, marginTop: 4, color: "#555", whiteSpace: "pre-line" }}>
                  {poi.details}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
