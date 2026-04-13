import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMapEvents,
  useMap,
} from "react-leaflet";
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
  /** Klick deaktivieren */
  clickDisabled?: boolean;
  /** Karte nach Antwort auf bestimmten Punkt zentrieren */
  flyTo?: [number, number];
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

export default function GrazMap({
  onMapClick,
  markers = [],
  line,
  clickDisabled,
  flyTo,
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

      <ClickHandler onClick={onMapClick} disabled={clickDisabled} />
      <FlyToHandler position={flyTo} />

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
    </MapContainer>
  );
}
