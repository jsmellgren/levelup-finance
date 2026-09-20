import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { getGroup, getGroupLeaderboard, inviteToGroup, type Group, type GroupLeaderboardRow } from "../../api/groups";
import { searchUsers, type UserSearchResult } from "../../api/auth";

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [leaderboard, setLeaderboard] = useState<GroupLeaderboardRow[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    if (!token || !id) return;
    setIsLoading(true);
    const [{ group }, { leaderboard }] = await Promise.all([getGroup(token, id), getGroupLeaderboard(token, id)]);
    setGroup(group);
    setLeaderboard(leaderboard);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!token || query.length < 2) return;
    const { users } = await searchUsers(token, query);
    setResults(users);
  }

  async function handleInvite(userId: string) {
    if (!token || !id) return;
    await inviteToGroup(token, id, userId);
    setResults([]);
    setQuery("");
    load();
  }

  if (isLoading || !group) {
    return <div className="px-6 py-8 text-sm text-white/40">Loading...</div>;
  }

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-xl font-bold">{group.name}</h1>
      <p className="mt-1 text-sm text-white/50">{group.memberships.length} members</p>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-white/70">Leaderboard (XP earned since joining)</h2>
        <div className="flex flex-col gap-2">
          {leaderboard.map((row, i) => (
            <Card key={row.userId} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm text-white/40">#{i + 1}</span>
                <span className="text-sm font-medium">@{row.username ?? row.name}</span>
              </div>
              <span className="text-sm text-brand-teal">{row.xpSinceJoining} XP</span>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-white/70">Invite a friend</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input placeholder="Search by username" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button type="submit" className="w-auto px-5">
            Search
          </Button>
        </form>
        {results.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {results.map((u) => (
              <Card key={u.id} className="flex items-center justify-between p-3">
                <span className="text-sm">@{u.username ?? u.name}</span>
                <Button className="w-auto px-4 py-2 text-xs" onClick={() => handleInvite(u.id)}>
                  Invite
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
