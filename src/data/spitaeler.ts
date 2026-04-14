export interface Spital {
  name: string;
  adresse: string;
  plz: string;
  kategorie: "oeffentlich" | "privat";
  lat: number;
  lng: number;
}

export const spitaeler: Spital[] = [
  {
    name: "LKH Universitätsklinikum Graz",
    adresse: "Auenbruggerplatz 1",
    plz: "8036",
    kategorie: "oeffentlich",
    lat: 47.084277,
    lng: 15.468112,
  },
  {
    name: "Unfallkrankenhaus Steiermark",
    adresse: "Göstinger Straße 24",
    plz: "8021",
    kategorie: "oeffentlich",
    lat: 47.078676,
    lng: 15.398141,
  },
  {
    name: "LKH Graz II, Standort Süd",
    adresse: "Wagner-Jauregg-Platz 1",
    plz: "8053",
    kategorie: "oeffentlich",
    lat: 47.037714,
    lng: 15.417411,
  },
  {
    name: "LKH Graz II, Standort West",
    adresse: "Göstinger Straße 22",
    plz: "8020",
    kategorie: "oeffentlich",
    lat: 47.077636,
    lng: 15.399589,
  },
  {
    name: "Krankenhaus Barmherzige Brüder, Eggenberg",
    adresse: "Bergstraße 27",
    plz: "8020",
    kategorie: "oeffentlich",
    lat: 47.078740,
    lng: 15.392978,
  },
  {
    name: "Krankenhaus Barmherzige Brüder, Marschallgasse",
    adresse: "Marschallgasse 12",
    plz: "8020",
    kategorie: "oeffentlich",
    lat: 47.071877,
    lng: 15.432002,
  },
  {
    name: "Krankenhaus der Elisabethinen",
    adresse: "Elisabethinergasse 14",
    plz: "8020",
    kategorie: "oeffentlich",
    lat: 47.069531,
    lng: 15.426177,
  },
  {
    name: "Privatklinik Graz Ragnitz",
    adresse: "Berthold-Linder-Weg 15",
    plz: "8047",
    kategorie: "privat",
    lat: 47.077362,
    lng: 15.475518,
  },
  {
    name: "Privatklinik der Kreuzschwestern",
    adresse: "Kreuzgasse 35",
    plz: "8010",
    kategorie: "privat",
    lat: 47.083976,
    lng: 15.442120,
  },
  {
    name: "Sanatorium Lebenstraum St. Leonhard",
    adresse: "Schanzelgasse 42",
    plz: "8010",
    kategorie: "privat",
    lat: 47.078660,
    lng: 15.461439,
  },
  {
    name: "Hansa Privatklinikum Graz",
    adresse: "Körblergasse 42",
    plz: "8010",
    kategorie: "privat",
    lat: 47.083357,
    lng: 15.445129,
  },
];
