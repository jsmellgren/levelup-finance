import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { getMission, logProgress, deleteProgressEntry, type Mission } from "../../api/missions";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { LogProgressModal } from "./LogProgressModal";
import { formatCurrency } from "../../lib/xp";

const ACTION_LABEL: Record<Mission["type"], string> = {
  DEBT: "Log a Payment",
  SAVINGS: "Log a Contribution",
  NET_WORTH: "Update Net Worth",
  CUSTOM: "Log Progress",
};

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockedMsg, setUnlockedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    if (!token || !id) return;
    getMission(token, id).then((res) => setMission(res.mission));
  }

  useEffect(load, [token, id]);

  async function handleLogProgress(amount: number, note?: string) {
    if (!token || !id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await logProgress(token, id, amount, note);
      setShowModal(false);
      load();
      if (result.unlockedAchievements.length > 0) {
        setUnlockedMsg(`Achievement unlocked: ${result.unlockedAchievements[0].achievement.title}!`);
        setTimeout(() => setUnlockedMsg(null), 4000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log progress");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteEntry(entryId: string) {
    if (!token || !id) return;
    setDeletingId(entryId);
    setError(null);
    try {
      await deleteProgressEntry(token, id, entryId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");
    } finally {
      setDeletingId(null);
    }
  }

  if (!mission || !mission.goal) {
    return <div className="px-6 py-8 text-white/40">Loading...</div>;
  }

  const pct = (Number(mission.goal.currentAmount) / Number(mission.goal.targetAmount)) * 100;

  return (
    <div className="px-6 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-white/50">
        ← Back
      </button>

      {unlockedMsg && (
        <div className="mb-4 rounded-xl2 bg-brand-gold/20 px-4 py-3 text-sm text-brand-gold">🏆 {unlockedMsg}</div>
      )}
      {error && (
        <div className="mb-4 rounded-xl2 bg-brand-debt/20 px-4 py-3 text-sm text-brand-debt">{error}</div>
      )}

      <h1 className="text-xl font-bold">{mission.title}</h1>

      <Card className="my-6">
        <div className="mb-2 flex justify-between text-2xl font-bold">
          <span>{formatCurrency(Number(mission.goal.currentAmount))}</span>
          <span className="text-white/30 text-lg self-end">
            / {formatCurrency(Number(mission.goal.targetAmount))}
          </span>
        </div>
        <ProgressBar percent={pct} className="mb-2" />
        <p className="text-sm text-white/50">{Math.round(pct)}% complete</p>

        {mission.goal.targetDate && (
          <p className="mt-3 text-xs text-white/40">
            Target date: {new Date(mission.goal.targetDate).toLocaleDateString()}
          </p>
        )}
        {mission.goal.estimatedCompletionDate && (
          <p className="text-xs text-white/40">
            Estimated completion: {new Date(mission.goal.estimatedCompletionDate).toLocaleDateString()}
          </p>
        )}
      </Card>

      <Button onClick={() => setShowModal(true)} className="mb-6">
        {ACTION_LABEL[mission.type]}
      </Button>

      {mission.tasks && mission.tasks.length > 0 && (
        <Card className="mb-6">
          <h2 className="mb-3 font-semibold">Associated Tasks</h2>
          <div className="flex flex-col gap-2">
            {mission.tasks.map((t) => (
              <div key={t.id} className="flex justify-between text-sm text-white/70">
                <span>{t.title}</span>
                <span className="text-white/40">{t.status}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-3 font-semibold">Recent Activity</h2>
        <div className="flex flex-col gap-2">
          {mission.goal.progressEntries.length === 0 && (
            <p className="text-sm text-white/40">No activity logged yet.</p>
          )}
          {mission.goal.progressEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between text-sm">
              <div>
                <p>{entry.note || "Progress logged"}</p>
                <p className="text-xs text-white/40">{new Date(entry.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-brand-teal font-semibold">+{formatCurrency(Number(entry.amount))}</span>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  disabled={deletingId === entry.id}
                  className="text-white/30 hover:text-brand-debt disabled:opacity-40"
                  aria-label="Delete this entry"
                  title="Delete this entry"
                >
                  {deletingId === entry.id ? "…" : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showModal && (
        <LogProgressModal
          actionLabel={ACTION_LABEL[mission.type]}
          onSubmit={handleLogProgress}
          onClose={() => setShowModal(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}