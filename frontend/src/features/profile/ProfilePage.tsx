import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { listMyAchievements, type UserAchievement } from "../../api/achievements";
import { Card } from "../../components/ui/Card";
import { XPBadge } from "../../components/ui/XPBadge";
import { StreakFlame } from "../../components/ui/StreakFlame";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { xpProgress } from "../../lib/xp";
import { updateProfile } from "../../api/auth";
import {
  TasksIcon,
  OverviewIcon,
  CoachIcon,
  FriendsIcon,
  GroupsIcon,
  LeaderboardIcon,
} from "../../components/ui/NavIcons";

const MORE_LINKS = [
  { to: "/tasks", label: "Tasks", icon: TasksIcon },
  { to: "/friends", label: "Friends", icon: FriendsIcon },
  { to: "/groups", label: "Groups", icon: GroupsIcon },
  { to: "/leaderboard", label: "Leaderboard", icon: LeaderboardIcon },
  { to: "/overview", label: "Financial Overview", icon: OverviewIcon },
  { to: "/coach", label: "AI Coach", icon: CoachIcon },
];

export function ProfilePage() {
  const { user, token, logout, updateUser } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    listMyAchievements(token).then((res) => setAchievements(res.achievements));
  }, [token]);

  if (!user) return null;
  const { percentToNext } = xpProgress(user.totalXP);

  async function handleSaveUsername(e: FormEvent) {
    e.preventDefault();
    if (!token || !username.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const { user: updated } = await updateProfile(token, { username: username.trim() });
      updateUser(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update username");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="px-6 py-8 pb-24">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-purple/20 text-2xl font-bold">
          {(user.name ?? user.username ?? user.email)[0]?.toUpperCase()}
        </div>
        <h1 className="text-lg font-bold">{user.name ?? user.username}</h1>

        {isEditing ? (
          <form onSubmit={handleSaveUsername} className="mt-2 flex items-center gap-2">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} className="w-40 py-1.5 text-sm" />
            <Button type="submit" disabled={isSaving} className="w-auto px-3 py-1.5 text-xs">
              Save
            </Button>
          </form>
        ) : (
          <button className="mt-1 text-sm text-white/40 underline decoration-dotted" onClick={() => setIsEditing(true)}>
            @{user.username ?? "set a username"}
          </button>
        )}
        {error && <p className="mt-1 text-xs text-brand-debt">{error}</p>}
      </div>

      <Card className="mb-4">
        <XPBadge level={user.level} totalXP={user.totalXP} percentToNext={percentToNext} />
      </Card>

      <div className="mb-6">
        <StreakFlame days={user.currentStreak} />
        {user.longestStreak > user.currentStreak && (
          <p className="mt-1 text-center text-xs text-white/30">Longest streak: {user.longestStreak} days</p>
        )}
      </div>

      <h2 className="mb-3 font-semibold">Achievements</h2>
      <div className="mb-8 grid grid-cols-3 gap-3">
        {achievements?.map((ua) => (
          <div key={ua.id} className="flex flex-col items-center rounded-xl2 bg-bg-card p-3 text-center">
            <span className="text-2xl">{ua.achievement.icon}</span>
            <span className="mt-1 text-xs text-white/70">{ua.achievement.title}</span>
          </div>
        ))}
        {achievements?.length === 0 && (
          <p className="col-span-3 text-sm text-white/40">
            No achievements yet — log your first payment or contribution to earn one.
          </p>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-1">
        {MORE_LINKS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-xl2 px-3 py-3 text-sm text-white/70 hover:bg-white/5 md:hidden"
          >
            <Icon />
            {label}
          </Link>
        ))}
      </div>

      <Button variant="secondary" onClick={logout}>
        Log Out
      </Button>
    </div>
  );
}
