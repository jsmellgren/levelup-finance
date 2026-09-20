export function StreakFlame({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-2 rounded-xl2 bg-bg-elevated px-3 py-2">
      <span className="text-lg">🔥</span>
      <div>
        <p className="text-sm font-semibold leading-none">{days} Day{days === 1 ? "" : "s"}</p>
        <p className="text-xs text-white/40 leading-none mt-1">Streak</p>
      </div>
    </div>
  );
}
