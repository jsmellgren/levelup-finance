type MissionType = "DEBT" | "SAVINGS" | "NET_WORTH" | "CUSTOM";

const OPTIONS: { type: MissionType; icon: string; iconBg: string; title: string; subtitle: string; presetTitle?: string }[] = [
  { type: "DEBT", icon: "⚔️", iconBg: "bg-brand-debt/20", title: "Destroy My Debt", subtitle: "Pay off what you owe and get back in control." },
  { type: "SAVINGS", icon: "🐷", iconBg: "bg-brand-teal/20", title: "Build My Savings", subtitle: "Create your emergency fund and reach your goals." },
  { type: "NET_WORTH", icon: "📈", iconBg: "bg-brand-purple/20", title: "Grow My Net Worth", subtitle: "Build wealth for your future." },
  {
    type: "CUSTOM",
    icon: "💼",
    iconBg: "bg-brand-gold/20",
    title: "Earn Extra Income",
    subtitle: "Track progress on a side hustle or income goal.",
    presetTitle: "Earn Extra Income",
  },
  { type: "CUSTOM", icon: "🚀", iconBg: "bg-brand-gold/20", title: "Create a Custom Goal", subtitle: "A big goal. Let's make it happen." },
];

export function GoalPicker({ onSelect }: { onSelect: (type: MissionType, presetTitle?: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.presetTitle ?? opt.type}
          onClick={() => onSelect(opt.type, opt.presetTitle)}
          className="flex items-center gap-4 rounded-xl2 border border-white/5 bg-bg-card p-4 text-left transition hover:border-white/20"
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${opt.iconBg}`}>
            {opt.icon}
          </div>
          <div>
            <p className="font-semibold">{opt.title}</p>
            <p className="text-sm text-white/50">{opt.subtitle}</p>
          </div>
        </button>
      ))}
    </div>
  );
}