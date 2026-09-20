import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../store/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  listFriends,
  listFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  type FriendRow,
  type PendingRow,
} from "../../api/friends";

export function FriendsPage() {
  const { token } = useAuth();
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [received, setReceived] = useState<PendingRow[]>([]);
  const [sent, setSent] = useState<PendingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    const [{ friends }, { received, sent }] = await Promise.all([listFriends(token), listFriendRequests(token)]);
    setFriends(friends);
    setReceived(received);
    setSent(sent);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSendRequest(e: FormEvent) {
    e.preventDefault();
    if (!token || !username.trim()) return;
    setError(null);
    setMessage(null);
    try {
      await sendFriendRequest(token, username.trim());
      setMessage(`Friend request sent to @${username.trim()}`);
      setUsername("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    }
  }

  async function handleAccept(id: string) {
    if (!token) return;
    setBusyId(id);
    setError(null);
    try {
      await acceptFriendRequest(token, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept request");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(id: string) {
    if (!token) return;
    setBusyId(id);
    setError(null);
    try {
      await declineFriendRequest(token, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline request");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-xl font-bold">Friends</h1>
      <p className="mt-1 text-sm text-white/50">Add friends to challenge them and see their progress.</p>

      <form onSubmit={handleSendRequest} className="mt-6 flex gap-2">
        <Input placeholder="Search by username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Button type="submit" className="w-auto px-5">
          Add
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-brand-debt">{error}</p>}
      {message && <p className="mt-2 text-sm text-brand-teal">{message}</p>}

      {isLoading ? (
        <p className="mt-8 text-sm text-white/40">Loading...</p>
      ) : (
        <>
          {received.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-white/70">Friend Requests</h2>
              <div className="flex flex-col gap-2">
                {received.map((r) => (
                  <Card key={r.friendshipId} className="flex items-center justify-between p-4">
                    <span className="text-sm">@{r.user.username ?? r.user.name}</span>
                    <div className="flex gap-2">
                      <Button
                        className="w-auto px-4 py-2 text-xs"
                        disabled={busyId === r.friendshipId}
                        onClick={() => handleAccept(r.friendshipId)}
                      >
                        {busyId === r.friendshipId ? "..." : "Accept"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-auto px-4 py-2 text-xs"
                        disabled={busyId === r.friendshipId}
                        onClick={() => handleDecline(r.friendshipId)}
                      >
                        Decline
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-white/70">
              Your Friends {friends.length > 0 && `(${friends.length})`}
            </h2>
            {friends.length === 0 ? (
              <Card className="text-center text-sm text-white/40">
                No friends yet — search a username above to send a request.
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {friends.map((f) => (
                  <Card key={f.friendshipId} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">@{f.user.username ?? f.user.name}</p>
                      <p className="text-xs text-white/40">
                        Level {f.user.level} · {f.user.currentStreak}-day streak
                      </p>
                    </div>
                    <span className="text-xs text-brand-teal">{f.user.totalXP} XP</span>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {sent.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-white/70">Pending (Sent)</h2>
              <div className="flex flex-col gap-2">
                {sent.map((r) => (
                  <Card key={r.friendshipId} className="flex items-center justify-between p-4 text-sm text-white/50">
                    @{r.user.username ?? r.user.name}
                    <span className="text-xs">Pending</span>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}