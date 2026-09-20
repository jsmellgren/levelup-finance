import { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { Card } from "../../components/ui/Card";
import { getFeed, type ActivityEvent } from "../../api/feed";

const TYPE_ICON: Record<string, string> = {
  GOAL_MILESTONE: "🎯",
  GOAL_COMPLETED: "🎉",
  CHALLENGE_JOINED: "⚔️",
  CHALLENGE_COMPLETED: "✅",
  CHALLENGE_WON: "🏆",
  ACHIEVEMENT_UNLOCKED: "🏅",
  LEVEL_UP: "🎮",
  STREAK_MILESTONE: "🔥",
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function FeedPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getFeed(token)
      .then(({ events }) => setEvents(events))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-xl font-bold">Activity</h1>
      <p className="mt-1 text-sm text-white/50">What you and your friends have been up to.</p>

      <div className="mt-6 flex flex-col gap-2">
        {isLoading ? (
          <p className="text-sm text-white/40">Loading...</p>
        ) : events.length === 0 ? (
          <Card className="text-center text-sm text-white/40">
            Nothing here yet — add friends or complete an action to get things moving.
          </Card>
        ) : (
          events.map((e) => (
            <Card key={e.id} className="flex items-start gap-3 p-4">
              <span className="text-lg">{TYPE_ICON[e.type] ?? "•"}</span>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{e.user.username ? `@${e.user.username}` : e.user.name ?? "Someone"}</span>{" "}
                  <span className="text-white/70">{e.message}</span>
                </p>
                <p className="mt-0.5 text-xs text-white/30">{timeAgo(e.createdAt)}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
