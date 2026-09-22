const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

// "2026-09-20" -> "20 sentabr 2026"
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// Toshkent vaqti bilan bugungi sana: "2026-09-21"
export function todayTashkent(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date());
}

// Ko'rishlar sonini qisqartirib ko'rsatadi: 950 -> "950", 1200 -> "1,2 ming", 15000 -> "15 ming"
export function formatViews(n: number): string {
  if (n < 1000) return String(n);
  const thousands = n / 1000;
  const rounded = thousands < 10 ? Math.round(thousands * 10) / 10 : Math.round(thousands);
  return `${String(rounded).replace(".", ",")} ming`;
}
