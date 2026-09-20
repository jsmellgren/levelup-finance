import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { listMyChallenges, listPublicChallenges, type Challenge } from "../../api/challenges";
import { CreateChallengeModal } from "./CreateChallengeModal";

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function ChallengeCard({ challenge, currentUserId }: { challenge: Challenge; currentUserId?: string }) {
  const me = challenge.participants.find((p) => p.userId === currentUserId);
  const target = challenge.targetAmount ? Number(challenge.targetAmount) : null;
  const percent = me && target ? (Number(me.currentAmount) / target) * 100 : 0;

  return (
    <Link to={`/challenges/${challenge.id}`}>
      <Card className="p-4 hover:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{challenge.title}</span>
          <span className="text-xs text-white/40">{daysLeft(challenge.endDate)}d left</span>
        </div>
        <p className="mt-1 text-xs text-white/40">
          {challenge.participants.length} participant{challenge.participants.length !== 1 ? "s" : ""}
        </p>
        {target && (
          <>
            <ProgressBar percent={percent} className="mt-3" />
            <p className="mt-1 text-xs text-white/40">
              {me ? `$${Number(me.currentAmount).toLocaleString()} / $${target.toLocaleString()}` : `Goal: $${target.toLocaleString()}`}
            </p>
          </>
        )}
      </Card>
    </Link>
  );
}

export function ChallengesPage() {
  const { token, user } = useAuth();
  const [mine, setMine] = useState<Challenge[]>([]);
  const [publicChallenges, setPublicChallenges] = useState<Challenge[]>([]);
  const [tab, setTab] = useState<"mine" | "browse">("mine");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    const [{ challenges: mine }, { challenges: pub }] = await Promise.all([
      listMyChallenges(token),
      listPublicChallenges(token),
    ]);
    setMine(mine);
    setPublicChallenges(pub);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const shown = tab === "mine" ? mine : publicChallenges;

  return (
    <div className="px-6 py-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Challenges</h1>
        <Button className="w-auto px-4 py-2 text-sm" onClick={() => setShowCreate(true)}>
          + New
        </Button>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setTab("mine")}
          className={`rounded-xl2 px-4 py-2 text-xs ${tab === "mine" ? "bg-brand-teal/10 text-brand-teal" : "text-white/50"}`}
        >
          My Challenges
        </button>
        <button
          onClick={() => setTab("browse")}
          className={`rounded-xl2 px-4 py-2 text-xs ${tab === "browse" ? "bg-brand-teal/10 text-brand-teal" : "text-white/50"}`}
        >
          Browse Public
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {isLoading ? (
          <p className="text-sm text-white/40">Loading...</p>
        ) : shown.length === 0 ? (
          <Card className="text-center text-sm text-white/40">
            {tab === "mine" ? "No challenges yet — create one to get started." : "No public challenges right now."}
          </Card>
        ) : (
          shown.map((c) => <ChallengeCard key={c.id} challenge={c} currentUserId={user?.id} />)
        )}
      </div>

      {showCreate && <CreateChallengeModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}
