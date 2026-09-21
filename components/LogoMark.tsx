// Maydon belgisi: futbol maydonining markaz chizig'i, doirasi va to'p.
export default function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1B8A4B" />
      <line x1="32" y1="0" x2="32" y2="64" stroke="#fff" strokeOpacity=".55" strokeWidth="3" />
      <circle cx="32" cy="32" r="13" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="32" cy="32" r="4" fill="#F5C518" />
    </svg>
  );
}
