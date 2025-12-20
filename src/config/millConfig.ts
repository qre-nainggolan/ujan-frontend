// src/config/millConfig.ts
export type MillConfig = {
  groups: {
    title: string;
    series: { key: string; label?: string; kind: string }[];
  }[];
};

export const CONFIG: Record<"PAN" | "PSG", MillConfig> = {
  PAN: {
    groups: [
      {
        title: "Power",
        series: [
          {
            key: "PAN_Fuel_Dist",
            label: "Fuel Dist",
            kind: "gauge100",
          },
        ],
      },
      {
        title: "KCP",
        series: [
          { key: "PAN_KCP_1_1", kind: "gauge100" },
          { key: "PAN_KCP_1_2", kind: "gauge100" },
          { key: "PAN_KCP_1_3", kind: "gauge100" },
        ],
      },
    ],
  },

  PSG: {
    groups: [
      {
        title: "Power",
        series: [
          { key: "07010", label: "Induced Draft Fan 1" },
          { key: "07011", label: "Induced Draft Fan 2" },
          { key: "07013", label: "Forced Draft Fan 1" },
          { key: "07014", label: "Forced Draft Fan 2" },
          { key: "07016", label: "Secondary Draft Fan 1" },
          { key: "07017", label: "Secondary Draft Fan 2" },
        ].map((k) => ({ key: k.key, label: k.label, kind: "gauge100" })),
      },
      {
        title: "Thresher",
        series: [
          { key: "03011", label: "Thresher 1" },
          { key: "03012", label: "Thresher 2" },
          { key: "03013", label: "Thresher 3" },
          { key: "03047", label: "Empty Bunch Press 1" },
          { key: "03048", label: "Empty Bunch Press 2" },
          { key: "03049", label: "Empty Bunch Press 3" },
          { key: "03050", label: "Empty Bunch Press 4" },
        ].map((k) => ({ key: k.key, label: k.label, kind: "gauge100" })),
      },
      {
        title: "Digester & Press",
        series: [
          { key: "04001", label: "Digester 1" },
          { key: "04002", label: "Digester 2" },
          { key: "04003", label: "Digester 3" },
          { key: "04004", label: "Digester 4" },
          { key: "04005", label: "Digester 5" },
          { key: "04007", label: "Screw Pres 1" },
          { key: "04008", label: "Screw Pres 2" },
          { key: "04009", label: "Screw Pres 3" },
          { key: "04010", label: "Screw Pres 4" },
          { key: "04011", label: "Screw Pres 5" },
        ].map((k) => ({ key: k.key, label: k.label, kind: "gauge100" })),
      },
      {
        title: "Clarification",
        series: [
          { key: "05001", label: "Sludge Sep. 1" },
          { key: "05002", label: "Sludge Sep. 2" },
          { key: "05003", label: "Sludge Sep. 3" },
          { key: "05004", label: "Sludge Sep. 4" },
          { key: "05005", label: "Sludge Sep. 5" },
          { key: "05070", label: "Sludge Sep. 6" },
          { key: "05071", label: "Sludge Sep. 7" },
          { key: "05072", label: "Sludge Sep. 8" },
        ].map((k) => ({ key: k.key, label: k.label, kind: "gauge100" })),
      },
      {
        title: "Kernel",
        series: [
          { key: "06007", label: "CBC 1" },
          { key: "06008", label: "CBC 2" },
          { key: "06009", label: "Fibre Cyc. 1" },
          { key: "06013", label: "Nut Elevator" },
          { key: "06001", label: "Ripple Mill 1" },
          { key: "06002", label: "Ripple Mill 2" },
          { key: "06003", label: "Ripple Mill 3" },
          { key: "06018", label: "Cracked Mix Con.1" },
          { key: "06022", label: "LTDS 1 Cyc. 1" },
          { key: "06023", label: "LTDS 1 Cyc. 2" },
        ].map((k) => ({ key: k.key, label: k.label, kind: "gauge100" })),
      },
      {
        title: "KCP",
        series: [
          { key: "22004", label: "First Press 1" },
          { key: "22005", label: "First Press 2" },
          { key: "22006", label: "First Press 3" },
          { key: "22007", label: "First Press 4" },
          { key: "22008", label: "First Press 5" },
          { key: "22025", label: "Second Press 1" },
          { key: "22026", label: "Second Press 2" },
          { key: "22027", label: "Second Press 3" },
          { key: "22028", label: "Second Press 4" },
          { key: "22029", label: "Second Press 5" },
        ].map((k) => ({ key: k.key, label: k.label, kind: "gauge100" })),
      },
    ],
  },
};
