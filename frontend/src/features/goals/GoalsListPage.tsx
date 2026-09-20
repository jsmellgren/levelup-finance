import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { listMissions, type Mission } from "../../api/missions";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { formatCurrency } from "../../lib/xp";

const TYPE_META: Record<Mission["type"], { icon: string; color: string; label: string }> = {
  DEBT: { icon: "⚔️", color: "#E5484D", label: "Debt" },
  SAVINGS: { icon: "🐷", color: "#2DD4AA", label: "Savings" },
  NET_WORTH: { icon: "📈", color: "#7C6CF7", label: "Net Worth" },
  CUSTOM: { icon: "🚀", color: "#E5B93E", label: "Investing" },
};

const CATEGORIES = ["All", "Debt", "Savings", "Investing", "Net Worth"] as const;

export function GoalsListPage() {
  const { token } = useAuth();
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  useEffect(() => {
    if (!token) return;
    listMissions(token).then((res) => setMissions(res.missions));
  }, [token]);

  const filtered = missions?.filter((m) => {
    if (category === "All") return true;
    return TYPE_META[m.type].label === category;
  });

  return (
    <div className="px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Goals</h1>
        <Link to="/onboarding" className="text-2xl text-brand-teal">
          +
        </Link>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${
              category === c ? "bg-brand-teal text-bg font-semibold" : "bg-bg-elevated text-white/60"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered?.map((m) => {
          if (!m.goal) return null;
          const meta = TYPE_META[m.type];
          const pct = (Number(m.goal.currentAmount) / Number(m.goal.targetAmount)) * 100;
          return (
            <Link key={m.id} to={`/goals/${m.id}`}>
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{meta.icon}</span>
                    <span className="font-semibold">{m.title}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: meta.color }}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="mb-2 flex justify-between text-xs text-white/50">
                  <span>{formatCurrency(Number(m.goal.currentAmount))}</span>
                  <span>{formatCurrency(Number(m.goal.targetAmount))}</span>
                </div>
                <ProgressBar percent={pct} color={meta.color} />
                {m.goal.estimatedCompletionDate && (
                  <p className="mt-2 text-xs text-white/40">
                    Est. completion:{" "}
                    {new Date(m.goal.estimatedCompletionDate).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </Card>
            </Link>
          );
        })}

        {filtered && filtered.length === 0 && (
          <p className="mt-8 text-center text-white/40">No goals in this category yet.</p>
        )}
      </div>
    </div>
  );
}
