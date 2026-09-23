export default function GameCenterLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-16 rounded bg-surface" />
      <div className="mb-8 h-10 w-64 rounded bg-surface" />
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded bg-surface" />
        ))}
      </div>
    </div>
  );
}
