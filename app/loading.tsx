export default function HomeLoading() {
  return (
    <div className="animate-pulse space-y-14">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="aspect-[16/9] rounded bg-surface lg:col-span-2" />
        <div className="space-y-3">
          <div className="h-24 rounded bg-surface" />
          <div className="h-16 rounded bg-surface" />
          <div className="h-16 rounded bg-surface" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded bg-surface" />
        ))}
      </div>
    </div>
  );
}
