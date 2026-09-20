import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../store/AuthContext";
import {
  createChallenge,
  getChallengeTemplates,
  type ChallengeType,
  type ChallengeVisibility,
  type ChallengeTemplate,
} from "../../api/challenges";

const TYPES: { value: ChallengeType; label: string }[] = [
  { value: "SAVINGS", label: "Savings" },
  { value: "DEBT", label: "Debt Payoff" },
  { value: "SPENDING", label: "Spending" },
  { value: "HABIT", label: "Habit" },
];

export function CreateChallengeModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ChallengeType>("SAVINGS");
  const [targetAmount, setTargetAmount] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [visibility, setVisibility] = useState<ChallengeVisibility>("PRIVATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getChallengeTemplates(token).then(({ templates }) => setTemplates(templates));
  }, [token]);

  async function submit(payload: {
    title: string;
    type: ChallengeType;
    targetAmount?: number;
    durationDays: number;
    visibility: ChallengeVisibility;
  }) {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createChallenge(token, payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create challenge");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleTemplatePick(t: ChallengeTemplate) {
    submit({
      title: t.title,
      type: t.type,
      targetAmount: t.targetAmount,
      durationDays: t.durationDays,
      visibility: "PRIVATE",
    });
  }

  function handleCustomSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    submit({
      title: title.trim(),
      type,
      targetAmount: targetAmount ? Number(targetAmount) : undefined,
      durationDays: Number(durationDays),
      visibility,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-xl2 bg-bg-card p-6 md:rounded-xl2"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">New Challenge</h2>

        {!showCustomForm ? (
          <>
            <p className="mb-3 text-xs text-white/40">Quick start — tap one to create it instantly:</p>
            <div className="flex flex-col gap-2">
              {templates.map((t) => (
                <button
                  key={t.key}
                  disabled={isSubmitting}
                  onClick={() => handleTemplatePick(t)}
                  className="flex items-center gap-3 rounded-xl2 border border-white/10 p-3 text-left transition hover:border-brand-teal/50 disabled:opacity-50"
                >
                  <span className="text-xl">{t.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-white/40">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {error && <p className="mt-3 text-sm text-brand-debt">{error}</p>}

            <div className="mt-4 flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowCustomForm(true)}>
                Build my own instead →
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3">
            <button type="button" onClick={() => setShowCustomForm(false)} className="mb-1 self-start text-xs text-white/50">
              ← Back to quick start
            </button>

            <Input placeholder="Challenge title, e.g. 'Save $500 in 30 Days'" value={title} onChange={(e) => setTitle(e.target.value)} required />

            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex-1 rounded-xl2 border px-2 py-2 text-xs ${
                    type === t.value ? "border-brand-teal text-brand-teal" : "border-white/10 text-white/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Input
              type="number"
              placeholder="Target amount (optional)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              min="0"
            />
            <Input
              type="number"
              placeholder="Duration (days)"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              min="1"
              required
            />

            <div className="flex gap-2">
              {(["PRIVATE", "PUBLIC"] as ChallengeVisibility[]).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setVisibility(v)}
                  className={`flex-1 rounded-xl2 border px-2 py-2 text-xs ${
                    visibility === v ? "border-brand-purple text-brand-purple" : "border-white/10 text-white/50"
                  }`}
                >
                  {v === "PRIVATE" ? "Friends only" : "Public (shareable link)"}
                </button>
              ))}
            </div>

            {error && <p className="text-sm text-brand-debt">{error}</p>}

            <div className="mt-2 flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}