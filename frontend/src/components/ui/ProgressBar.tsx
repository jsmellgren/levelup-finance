type Props = { percent: number; color?: string; className?: string };

export function ProgressBar({ percent, color = "#2DD4AA", className = "" }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={`h-2 w-full rounded-full bg-white/10 ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
