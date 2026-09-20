import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import type { CreateMissionPayload } from "../../api/missions";

type MissionType = CreateMissionPayload["type"];

const FIELD_CONFIG: Record<MissionType, { title: string; currentLabel: string; targetLabel: string; contributionLabel: string; showInterest: boolean }> = {
  DEBT: {
    title: "Destroy My Debt",
    currentLabel: "Current debt balance",
    targetLabel: "Total debt (starting point)",
    contributionLabel: "Monthly payment",
    showInterest: true,
  },
  SAVINGS: {
    title: "Build My Savings",
    currentLabel: "Current savings",
    targetLabel: "Savings goal",
    contributionLabel: "Monthly contribution",
    showInterest: false,
  },
  NET_WORTH: {
    title: "Grow My Net Worth",
    currentLabel: "Current net worth",
    targetLabel: "Target net worth",
    contributionLabel: "Monthly contribution",
    showInterest: false,
  },
  CUSTOM: {
    title: "Create a Custom Goal",
    currentLabel: "Current amount",
    targetLabel: "Target amount",
    contributionLabel: "Monthly contribution",
    showInterest: false,
  },
};

export function GoalForm({
  type,
  presetTitle,
  onSubmit,
  onBack,
  isSubmitting,
}: {
  type: MissionType;
  presetTitle?: string;
  onSubmit: (payload: CreateMissionPayload) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const config = FIELD_CONFIG[type];
  const [title, setTitle] = useState(presetTitle ?? config.title);
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [contribution, setContribution] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [targetDate, setTargetDate] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      type,
      title,
      currentAmount: Number(current || 0),
      targetAmount: Number(target || 0),
      monthlyContribution: contribution ? Number(contribution) : null,
      interestRate: config.showInterest && interestRate ? Number(interestRate) : null,
      targetDate: targetDate ? new Date(targetDate).toISOString() : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <button type="button" onClick={onBack} className="mb-1 self-start text-sm text-white/50">
        ← Back
      </button>

      <Input placeholder="Goal name" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <div>
        <label className="mb-1 block text-xs text-white/50">{config.currentLabel}</label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-white/50">{config.targetLabel}</label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-white/50">{config.contributionLabel} (optional)</label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
        />
      </div>

      {config.showInterest && (
        <div>
          <label className="mb-1 block text-xs text-white/50">Interest rate % (optional)</label>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs text-white/50">Target date (optional)</label>
        <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Setting up your mission..." : "Start My Journey"}
      </Button>
    </form>
  );
}