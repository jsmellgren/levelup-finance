export function XPBadge({ level, totalXP, percentToNext }: { level: number; totalXP: number; percentToNext: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple/20 text-sm font-bold text-brand-purple">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-white/50">
          <span>Level {level}</span>
          <span>{totalXP.toLocaleString()} XP</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-purple transition-all duration-500"
            style={{ width: `${Math.max(4, percentToNext)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
