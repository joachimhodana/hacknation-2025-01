export type CollectedItem = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  collected: boolean;
  placeName?: string;
  collectedAt?: string; // e.g. "2025-02-01"
};

export const collectedItems: CollectedItem[] = [
  {
    id: "golden-crown",
    title: "Złota Korona",
    description: "Symbol królewskiej historii miasta.",
    emoji: "👑",
    collected: true,
    placeName: "Stary Rynek",
    collectedAt: "2025-02-01",
  },
  {
    id: "river-stone",
    title: "Kamień znad Brdy",
    description: "Wygładzony przez nurt rzeki.",
    emoji: "🪨",
    collected: false,
    placeName: "Nabrzeże Brdy",
  },
  {
    id: "old-ticket",
    title: "Stary bilet tramwajowy",
    description: "Relikt dawnej komunikacji miejskiej.",
    emoji: "🎫",
    collected: false,
    placeName: "Zajezdnia tramwajowa",
  },
  {
    id: "mill-island-leaf",
    title: "Liść z Wyspy Młyńskiej",
    description: "Pamiątka ze spaceru po sercu miasta.",
    emoji: "🍃",
    collected: true,
    placeName: "Wyspa Młyńska",
    collectedAt: "2025-02-03",
  },
];