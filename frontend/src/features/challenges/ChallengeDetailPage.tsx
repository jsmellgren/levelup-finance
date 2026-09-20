import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { getChallenge, joinChallenge, logChallengeProgress, type Challenge } from "../../api/challenges";
import { LogProgressModal } from "../goals/LogProgressModal";

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    if (!token || !id) return;
    setIsLoading(true);
    const { challenge } = await getChallenge(token, id);
    setChallenge(challenge);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  async function handleJoin() {
    if (!token || !id) return;
    await joinChallenge(token, id);
    load();
  }

  async function handleLog(amount: number) {
    if (!token || !id) return;
    setIsSubmitting(true);
    try {
      await logChallengeProgress(token, id, amount);
      setShowLog(false);
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyLink() {
    if (!challenge?.shareSlug) return;
    const url = `${window.location.origin}/challenges/join/${challenge.shareSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading || !challenge) {
    return <div className="px-6 py-8 text-sm text-white/40">Loading...</div>;
  }

  const me = challenge.participants.find((p) => p.userId === user?.id);
  const target = challenge.targetAmount ? Number(challenge.targetAmount) : null;
  const sorted = [...challenge.participants].sort((a, b) => Number(b.currentAmount) - Number(a.currentAmount));

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-xl font-bold">{challenge.title}</h1>
      {challenge.description && <p className="mt-1 text-sm text-white/50">{challenge.description}</p>}
      <p className="mt-2 text-xs text-white/40">
        {daysLeft(challenge.endDate)} days left · {challenge.participants.length} participant
        {challenge.participants.length !== 1 ? "s" : ""}
      </p>

      {challenge.visibility === "PUBLIC" && challenge.shareSlug && (
        <Card className="mt-4 flex items-center justify-between p-3">
          <span className="text-xs text-white/50">Share this challenge</span>
          <Button variant="secondary" className="w-auto px-3 py-1.5 text-xs" onClick={copyLink}>
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </Card>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-white/70">Leaderboard</h2>
        <div className="flex flex-col gap-2">
          {sorted.map((p, i) => (
            <Card
              key={p.id}
              className={`flex items-center justify-between p-4 ${p.userId === user?.id ? "border-brand-teal/40" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm text-white/40">#{i + 1}</span>
                <span className="text-sm font-medium">
                  {p.user?.username ? `@${p.user.username}` : p.user?.name ?? "You"}
                  {p.completedAt && " 🏆"}
                </span>
              </div>
              <span className="text-sm text-brand-teal">
                ${Number(p.currentAmount).toLocaleString()}
                {target ? ` / $${target.toLocaleString()}` : ""}
              </span>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-6">
        {me ? (
          <Button onClick={() => setShowLog(true)}>Log Progress</Button>
        ) : challenge.visibility !== "PRIVATE" ? (
          <Button onClick={handleJoin}>Join Challenge</Button>
        ) : null}
      </div>

      {showLog && (
        <LogProgressModal
          actionLabel="Log Challenge Progress"
          onSubmit={handleLog}
          onClose={() => setShowLog(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
