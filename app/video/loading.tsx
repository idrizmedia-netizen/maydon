export default function VideoLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-10 w-40 rounded bg-surface" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded bg-surface" />
        ))}
      </div>
    </div>
  );
}
