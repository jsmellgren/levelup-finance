import { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { Card } from "../../components/ui/Card";
import { getGlobalLeaderboard, getFriendsLeaderboard, getStreakLeaderboard, type LeaderboardRow, type StreakRow } from "../../api/leaderboards";

type Tab = "friends-xp" | "global-xp" | "streaks";

export function LeaderboardPage() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<Tab>("friends-xp");
  const [xpRows, setXpRows] = useState<LeaderboardRow[]>([]);
  const [streakRows, setStreakRows] = useState<StreakRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    if (tab === "streaks") {
      getStreakLeaderboard(token, "friends")
        .then(({ leaderboard }) => setStreakRows(leaderboard))
        .finally(() => setIsLoading(false));
    } else {
      const fetcher = tab === "friends-xp" ? getFriendsLeaderboard : getGlobalLeaderboard;
      fetcher(token)
        .then(({ leaderboard }) => setXpRows(leaderboard))
        .finally(() => setIsLoading(false));
    }
  }, [token, tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "friends-xp", label: "Friends" },
    { key: "global-xp", label: "Global" },
    { key: "streaks", label: "Streaks" },
  ];

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-xl font-bold">Leaderboard</h1>
      <p className="mt-1 text-sm text-white/50">Ranked by progress and consistency — not net worth.</p>

      <div className="mt-4 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl2 px-4 py-2 text-xs ${tab === t.key ? "bg-brand-teal/10 text-brand-teal" : "text-white/50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {isLoading ? (
          <p className="text-sm text-white/40">Loading...</p>
        ) : tab === "streaks" ? (
          streakRows.length === 0 ? (
            <Card className="text-center text-sm text-white/40">No data yet.</Card>
          ) : (
            streakRows.map((row, i) => (
              <Card
                key={row.id}
                className={`flex items-center justify-between p-4 ${row.id === user?.id ? "border-brand-teal/40" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-sm text-white/40">#{i + 1}</span>
                  <span className="text-sm font-medium">@{row.username ?? row.name}</span>
                </div>
                <span className="text-sm text-brand-gold">🔥 {row.currentStreak}d</span>
              </Card>
            ))
          )
        ) : xpRows.length === 0 ? (
          <Card className="text-center text-sm text-white/40">No activity in the last 7 days yet.</Card>
        ) : (
          xpRows.map((row, i) => (
            <Card
              key={row.id}
              className={`flex items-center justify-between p-4 ${row.id === user?.id ? "border-brand-teal/40" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm text-white/40">#{i + 1}</span>
                <div>
                  <p className="text-sm font-medium">@{row.username ?? row.name}</p>
                  <p className="text-xs text-white/40">Level {row.level}</p>
                </div>
              </div>
              <span className="text-sm text-brand-teal">{row.xpInPeriod} XP this week</span>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
