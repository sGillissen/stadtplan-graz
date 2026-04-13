export interface Street {
  name: string;
  lat: number;
  lng: number;
  district: string;
  hint?: string;
}

/**
 * Die 50 wichtigsten Straßen und Plätze in Graz,
 * geordnet nach Bezirk mit Zentrumskoordinaten.
 */
export const streets: Street[] = [
  // === I. Innere Stadt ===
  { name: "Hauptplatz", lat: 47.0707, lng: 15.4387, district: "I. Innere Stadt", hint: "Zentraler Platz mit Rathaus" },
  { name: "Herrengasse", lat: 47.0695, lng: 15.4375, district: "I. Innere Stadt", hint: "Haupt-Einkaufsstraße im Zentrum" },
  { name: "Sporgasse", lat: 47.0722, lng: 15.4368, district: "I. Innere Stadt", hint: "Steile Gasse zum Schlossberg" },
  { name: "Sackstraße", lat: 47.0732, lng: 15.4355, district: "I. Innere Stadt", hint: "Historische Gasse mit Boutiquen" },
  { name: "Schmiedgasse", lat: 47.0690, lng: 15.4380, district: "I. Innere Stadt", hint: "Fußgängerzone südlich vom Hauptplatz" },
  { name: "Neutorgasse", lat: 47.0688, lng: 15.4358, district: "I. Innere Stadt", hint: "Verbindung Herrengasse – Grieskai" },
  { name: "Burggasse", lat: 47.0720, lng: 15.4398, district: "I. Innere Stadt", hint: "Bei der Grazer Burg" },
  { name: "Hofgasse", lat: 47.0715, lng: 15.4390, district: "I. Innere Stadt", hint: "Beim Landhaus und Dom" },

  // === Ringstraßen / Gürtel ===
  { name: "Opernring", lat: 47.0700, lng: 15.4418, district: "I. Innere Stadt", hint: "Vor der Oper" },
  { name: "Joanneumring", lat: 47.0698, lng: 15.4398, district: "I. Innere Stadt", hint: "Beim Universalmuseum Joanneum" },
  { name: "Kaiser-Josef-Platz", lat: 47.0718, lng: 15.4352, district: "I. Innere Stadt", hint: "Bauernmarkt am Samstag" },

  // === II. St. Leonhard ===
  { name: "Leonhardstraße", lat: 47.0748, lng: 15.4498, district: "II. St. Leonhard", hint: "Uni-Viertel, Studentenlokale" },
  { name: "Zinzendorfgasse", lat: 47.0758, lng: 15.4478, district: "II. St. Leonhard", hint: "Parallel zur Leonhardstraße" },
  { name: "Elisabethstraße", lat: 47.0738, lng: 15.4458, district: "II. St. Leonhard", hint: "Verbindung Glacis – Leonhard" },
  { name: "Glacisstraße", lat: 47.0740, lng: 15.4425, district: "II. St. Leonhard", hint: "Am Stadtpark entlang" },
  { name: "Rechbauerstraße", lat: 47.0730, lng: 15.4445, district: "II. St. Leonhard", hint: "Nahe TU Graz" },
  { name: "Humboldtstraße", lat: 47.0750, lng: 15.4465, district: "II. St. Leonhard", hint: "Wohngegend St. Leonhard" },
  { name: "Mandellstraße", lat: 47.0768, lng: 15.4495, district: "II. St. Leonhard", hint: "Oberer St. Leonhard" },

  // === III. Geidorf ===
  { name: "Heinrichstraße", lat: 47.0778, lng: 15.4438, district: "III. Geidorf", hint: "Studentenviertel mit Lokalen" },
  { name: "Universitätsstraße", lat: 47.0790, lng: 15.4458, district: "III. Geidorf", hint: "Zur Karl-Franzens-Universität" },
  { name: "Leechgasse", lat: 47.0775, lng: 15.4480, district: "III. Geidorf", hint: "Nahe Leechkirche" },
  { name: "Schubertstraße", lat: 47.0792, lng: 15.4418, district: "III. Geidorf", hint: "Ruhige Wohngegend Geidorf" },

  // === IV. Lend ===
  { name: "Annenstraße", lat: 47.0698, lng: 15.4282, district: "IV. Lend", hint: "Hauptstraße vom Bahnhof zum Zentrum" },
  { name: "Lendplatz", lat: 47.0718, lng: 15.4308, district: "IV. Lend", hint: "Marktplatz im Lendviertel" },
  { name: "Keplerstraße", lat: 47.0700, lng: 15.4322, district: "IV. Lend", hint: "Nahe Keplerbrücke" },
  { name: "Mariahilferstraße", lat: 47.0710, lng: 15.4295, district: "IV. Lend", hint: "Bei der Mariahilferkirche" },

  // === V. Gries ===
  { name: "Griesplatz", lat: 47.0668, lng: 15.4345, district: "V. Gries", hint: "Verkehrsknotenpunkt im Griesviertel" },
  { name: "Grieskai", lat: 47.0680, lng: 15.4340, district: "V. Gries", hint: "Kai an der Mur (Westseite)" },
  { name: "Europaplatz", lat: 47.0768, lng: 15.4138, district: "V. Gries", hint: "Hauptbahnhof Graz" },
  { name: "Babenbergerstraße", lat: 47.0672, lng: 15.4282, district: "V. Gries", hint: "Zwischen Griesplatz und Bahnhof" },
  { name: "Rankengasse", lat: 47.0695, lng: 15.4340, district: "V. Gries", hint: "Kleine Gasse nahe Grieskai" },

  // === VI. Jakomini ===
  { name: "Jakominiplatz", lat: 47.0692, lng: 15.4438, district: "VI. Jakomini", hint: "Wichtigster Öffi-Knotenpunkt" },
  { name: "Radetzkystraße", lat: 47.0672, lng: 15.4450, district: "VI. Jakomini", hint: "Südlich vom Jakominiplatz" },
  { name: "Conrad-von-Hötzendorf-Straße", lat: 47.0635, lng: 15.4458, district: "VI. Jakomini", hint: "Große Durchzugsstraße Richtung Süden" },
  { name: "Münzgrabenstraße", lat: 47.0630, lng: 15.4482, district: "VI. Jakomini", hint: "Wohnviertel Münzgraben" },
  { name: "Grazbachgasse", lat: 47.0668, lng: 15.4398, district: "VI. Jakomini", hint: "Beim Grazbach (heute verrohrt)" },
  { name: "Kaiserfeldgasse", lat: 47.0698, lng: 15.4418, district: "VI. Jakomini", hint: "Verbindung Hauptplatz – Jakominiplatz" },

  // === Ausfallstraßen und äußere Bezirke ===
  { name: "Wiener Straße", lat: 47.0830, lng: 15.4388, district: "XII. Andritz", hint: "Richtung Norden / Wien" },
  { name: "Triester Straße", lat: 47.0420, lng: 15.4305, district: "XVII. Puntigam", hint: "Richtung Süden / Triest" },
  { name: "Kärntner Straße", lat: 47.0510, lng: 15.4148, district: "XVI. Straßgang", hint: "Richtung Südwesten / Kärnten" },
  { name: "Liebenauer Hauptstraße", lat: 47.0455, lng: 15.4498, district: "VII. Liebenau", hint: "Beim Stadion Liebenau" },
  { name: "Eggenberger Allee", lat: 47.0702, lng: 15.4050, district: "XIV. Eggenberg", hint: "Zum Schloss Eggenberg" },
  { name: "Alte Poststraße", lat: 47.0718, lng: 15.3978, district: "XIV. Eggenberg", hint: "Westliche Ausfallstraße" },
  { name: "Straßganger Straße", lat: 47.0505, lng: 15.4020, district: "XVI. Straßgang", hint: "Richtung Straßgang" },
  { name: "Andritzer Hauptstraße", lat: 47.0968, lng: 15.4248, district: "XII. Andritz", hint: "Hauptstraße durch Andritz" },
  { name: "Mariatroster Straße", lat: 47.0895, lng: 15.4718, district: "XI. Mariatrost", hint: "Zur Basilika Mariatrost" },
  { name: "Göstinger Straße", lat: 47.0878, lng: 15.4078, district: "XIII. Gösting", hint: "Durch Gösting Richtung Norden" },
  { name: "Petersgasse", lat: 47.0622, lng: 15.4518, district: "VIII. St. Peter", hint: "Nahe TU Graz Campus Inffeld" },
  { name: "Schönaugasse", lat: 47.0652, lng: 15.4348, district: "V. Gries", hint: "Im unteren Griesviertel" },
  { name: "Lagergasse", lat: 47.0660, lng: 15.4305, district: "V. Gries", hint: "Kreativ-Viertel in Gries" },
];

/** Hilfsfunktion: Distanz zwischen zwei Koordinaten in Metern (Haversine) */
export function distanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Score basierend auf Distanz */
export function scoreFromDistance(meters: number): { score: number; label: string; color: string } {
  if (meters < 150) return { score: 3, label: "Perfekt!", color: "text-green-600" };
  if (meters < 400) return { score: 2, label: "Gut!", color: "text-yellow-600" };
  if (meters < 800) return { score: 1, label: "Knapp daneben", color: "text-orange-500" };
  return { score: 0, label: "Weit weg", color: "text-red-500" };
}
