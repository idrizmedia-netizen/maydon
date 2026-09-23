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

// Toshkent sanasidan necha kun oldin/keyin: dateTashkent(-1) -> kecha, dateTashkent(1) -> ertaga
export function dateTashkent(offsetDays: number): string {
  return shiftDate(todayTashkent(), offsetDays);
}

// Berilgan "YYYY-MM-DD" sanadan necha kun oldin/keyin: shiftDate("2026-09-24", 1) -> "2026-09-25".
// Kun strelkalari (o'yinlar markazida) va istalgan sanadan boshlab navigatsiya qilish uchun.
export function shiftDate(date: string, offsetDays: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

// Ikki "YYYY-MM-DD" sana orasidagi kun farqi (b - a): dayDiff("2026-09-24","2026-09-25") -> 1.
export function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ta = Date.UTC(ay, am - 1, ad);
  const tb = Date.UTC(by, bm - 1, bd);
  return Math.round((tb - ta) / 86400000);
}

// Ko'rishlar sonini qisqartirib ko'rsatadi: 950 -> "950", 1200 -> "1,2 ming", 15000 -> "15 ming"
export function formatViews(n: number): string {
  if (n < 1000) return String(n);
  const thousands = n / 1000;
  const rounded = thousands < 10 ? Math.round(thousands * 10) / 10 : Math.round(thousands);
  return `${String(rounded).replace(".", ",")} ming`;
}
