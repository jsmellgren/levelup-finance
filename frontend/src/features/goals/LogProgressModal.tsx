import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function LogProgressModal({
  actionLabel,
  onSubmit,
  onClose,
  isSubmitting,
}: {
  actionLabel: string;
  onSubmit: (amount: number, note?: string) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!amount) return;
    onSubmit(Number(amount), note || undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-xl2 bg-bg-card p-6 md:rounded-xl2"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">{actionLabel}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
          />
          <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="mt-2 flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Log It"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
