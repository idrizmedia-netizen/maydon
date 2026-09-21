import type { ReactNode } from "react";

// Futbol maydoni chiziqlari: yo'l-yo'l o't, markaz chizig'i va doira.
export default function PitchPanel({
  color,
  children,
  className = "",
}: {
  color: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded ${className}`}
      style={{
        backgroundColor: color,
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 56px, transparent 56px 112px)",
      }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="rgba(255,255,255,.22)"
        strokeWidth="2"
      >
        <line x1="200" y1="0" x2="200" y2="240" />
        <circle cx="200" cy="120" r="46" />
        <circle cx="200" cy="120" r="3" fill="rgba(255,255,255,.3)" />
      </svg>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,0) 65%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
