import { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { getOverview, type Overview } from "../../api/overview";
import { Card } from "../../components/ui/Card";
import { formatCurrency } from "../../lib/xp";

export function OverviewPage() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    if (!token) return;
    getOverview(token).then(setOverview);
  }, [token]);

  if (!overview) return <div className="px-6 py-8 text-white/40">Loading...</div>;

  const leftover = overview.monthlyIncome - overview.monthlyExpenses;

  return (
    <div className="px-6 py-8">
      <h1 className="mb-6 text-xl font-bold">Your Financial Overview</h1>

      <Card className="mb-4">
        <p className="text-sm text-white/50">Total Net Worth</p>
        <p className={`mt-1 text-2xl font-bold ${overview.netWorth >= 0 ? "text-brand-teal" : "text-brand-debt"}`}>
          {formatCurrency(overview.netWorth)}
        </p>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-white/50">Savings</p>
          <p className="mt-1 text-lg font-bold text-brand-teal">{formatCurrency(overview.totalSavings)}</p>
        </Card>
        <Card>
          <p className="text-sm text-white/50">Debt</p>
          <p className="mt-1 text-lg font-bold text-brand-debt">{formatCurrency(overview.totalDebt)}</p>
        </Card>
      </div>

      <Card>
        <p className="mb-3 font-semibold">Monthly Cash Flow</p>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Income</span>
          <span className="text-brand-teal">{formatCurrency(overview.monthlyIncome)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-white/50">Expenses</span>
          <span className="text-brand-debt">{formatCurrency(overview.monthlyExpenses)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm font-semibold">
          <span>Leftover</span>
          <span>{formatCurrency(leftover)}</span>
        </div>
        {overview.monthlyIncome === 0 && (
          <p className="mt-3 text-xs text-white/40">
            Add your monthly income and expenses in Settings to see cash flow here.
          </p>
        )}
      </Card>
    </div>
  );
}
