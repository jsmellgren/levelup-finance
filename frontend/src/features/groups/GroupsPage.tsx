import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { listGroups, createGroup, type Group } from "../../api/groups";

export function GroupsPage() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    const { groups } = await listGroups(token);
    setGroups(groups);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      await createGroup(token, name.trim());
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-xl font-bold">Groups</h1>
      <p className="mt-1 text-sm text-white/50">Team up with friends on shared challenges.</p>

      <form onSubmit={handleCreate} className="mt-6 flex gap-2">
        <Input placeholder="New group name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" disabled={isCreating} className="w-auto px-5">
          {isCreating ? "Creating..." : "Create"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-brand-debt">{error}</p>}

      <div className="mt-8 flex flex-col gap-2">
        {isLoading ? (
          <p className="text-sm text-white/40">Loading...</p>
        ) : groups.length === 0 ? (
          <Card className="text-center text-sm text-white/40">No groups yet — create one above.</Card>
        ) : (
          groups.map((g) => (
            <Link key={g.id} to={`/groups/${g.id}`}>
              <Card className="flex items-center justify-between p-4 hover:border-white/10">
                <span className="text-sm font-medium">{g.name}</span>
                <span className="text-xs text-white/40">{g.memberships.length} members</span>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}