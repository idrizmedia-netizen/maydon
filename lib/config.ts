// Saytning asosiy sozlamalari. Nomni, tavsifni va kategoriyalarni shu yerda o'zgartiring.

export const siteConfig = {
  name: "Maydon",
  tagline: "Sport yangiliklari va tahlillar",
  description:
    "O'zbek tilida sport yangiliklari: futbol, boks, kurash, tennis, MMA va boshqa sport turlari bo'yicha maqolalar.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  // Har birini to'ldiring - bo'sh qoldirilsa, ijtimoiy tarmoq tugmasi ko'rinmaydi.
  social: {
    telegram: "", // https://t.me/kanal_nomi
    instagram: "", // https://instagram.com/nomi
    facebook: "", // https://facebook.com/nomi
    x: "", // https://x.com/nomi
    youtube: "", // https://youtube.com/@nomi
  },
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  color: string; // Belgi va chiziqlar rangi
};

export const categories: Category[] = [
  {
    slug: "futbol",
    name: "Futbol",
    description: "Superliga, terma jamoa, xalqaro turnirlar va taktika tahlillari.",
    color: "#1B8A4B",
  },
  {
    slug: "boks",
    name: "Boks",
    description: "Professional va havaskor boks, tayyorgarlik va janglar.",
    color: "#C93B3B",
  },
  {
    slug: "kurash",
    name: "Kurash",
    description: "Milliy kurash, dzyudo va sambo yangiliklari.",
    color: "#2456C7",
  },
  {
    slug: "tennis",
    name: "Tennis",
    description: "Grand Slam, ATP va WTA turnirlari, o'yin tahlillari.",
    color: "#A16207",
  },
  {
    slug: "mma",
    name: "MMA",
    description: "Aralash jang san'ati: jang kechalari, toifalar va jangchilar.",
    color: "#6D3FC9",
  },
  {
    slug: "boshqa",
    name: "Boshqa sport",
    description: "Yengil atletika, suzish, shaxmat, sog'lom turmush va boshqalar.",
    color: "#0E7C86",
  },
];

export const kinds = [
  { value: "yangilik", label: "Yangilik" },
  { value: "maqola", label: "Maqola" },
] as const;

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
