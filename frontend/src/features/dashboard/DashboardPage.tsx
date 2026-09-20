import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { listMissions, type Mission } from "../../api/missions";
import { listTodayTasks, updateTaskStatus, type Task } from "../../api/tasks";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Card } from "../../components/ui/Card";
import { XPBadge } from "../../components/ui/XPBadge";
import { StreakFlame } from "../../components/ui/StreakFlame";
import { xpProgress, formatCurrency } from "../../lib/xp";

const TYPE_COLOR: Record<Mission["type"], string> = {
  DEBT: "#E5484D",
  SAVINGS: "#2DD4AA",
  NET_WORTH: "#7C6CF7",
  CUSTOM: "#E5B93E",
};

export function DashboardPage() {
  const { user, token } = useAuth();
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([listMissions(token), listTodayTasks(token)])
      .then(([m, t]) => {
        setMissions(m.missions);
        setTasks(t.tasks);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"));
  }, [token]);

  async function handleToggleTask(task: Task) {
    if (!token) return;
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    const { task: updated } = await updateTaskStatus(token, task.id, nextStatus);
    setTasks((prev) => prev?.map((t) => (t.id === updated.id ? updated : t)) ?? null);
  }

  const primaryMission = missions?.find((m) => m.isPrimary) ?? missions?.[0];
  const { percentToNext } = user ? xpProgress(user.totalXP) : { percentToNext: 0 };
  const completedCount = tasks?.filter((t) => t.status === "COMPLETED").length ?? 0;

  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-sm">Welcome back</p>
          <h1 className="text-xl font-bold">{user?.name ?? user?.email}</h1>
        </div>
        {user && <StreakFlame days={user.currentStreak} />}
      </div>

      {user && (
        <Card className="mb-6">
          <XPBadge level={user.level} totalXP={user.totalXP} percentToNext={percentToNext} />
        </Card>
      )}

      {error && <p className="mb-4 text-sm text-brand-debt">{error}</p>}

      {missions && missions.length === 0 && (
        <Card className="mb-6 text-center">
          <p className="text-white/60">You don't have a mission yet.</p>
          <Link to="/onboarding" className="mt-3 inline-block text-brand-teal text-sm">
            Set up your first mission →
          </Link>
        </Card>
      )}

      {primaryMission?.goal && (
        <Card className="mb-6 flex flex-col items-center text-center">
          <p className="text-sm text-white/50">{primaryMission.title}</p>
          <div className="my-4">
            <ProgressRing
              percent={
                (Number(primaryMission.goal.currentAmount) / Number(primaryMission.goal.targetAmount)) * 100
              }
              color={TYPE_COLOR[primaryMission.type]}
            >
              <span className="text-2xl font-bold">
                {Math.round(
                  (Number(primaryMission.goal.currentAmount) / Number(primaryMission.goal.targetAmount)) * 100
                )}
                %
              </span>
              <span className="text-xs text-white/40">Complete</span>
            </ProgressRing>
          </div>
          <div className="flex w-full justify-between text-sm">
            <span>{formatCurrency(Number(primaryMission.goal.currentAmount))}</span>
            <span className="text-white/40">{formatCurrency(Number(primaryMission.goal.targetAmount))}</span>
          </div>
          {primaryMission.goal.estimatedCompletionDate && (
            <p className="mt-3 text-xs text-white/40">
              Estimated completion:{" "}
              {new Date(primaryMission.goal.estimatedCompletionDate).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <Link to={`/goals/${primaryMission.id}`} className="mt-4 text-sm text-brand-teal">
            View Goal →
          </Link>
        </Card>
      )}

      {tasks && (
        <Card className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Today's Missions</h2>
            <span className="text-xs text-white/40">
              {completedCount} of {tasks.length} completed
            </span>
          </div>
          <ProgressBar percent={tasks.length ? (completedCount / tasks.length) * 100 : 0} className="mb-4" />
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleToggleTask(task)}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-bg-elevated px-3 py-2 text-left"
              >
                <span className={`text-sm ${task.status === "COMPLETED" ? "text-white/40 line-through" : ""}`}>
                  {task.status === "COMPLETED" ? "☑" : "☐"} {task.title}
                </span>
                <span className="text-xs text-brand-teal">+{task.xpReward} XP</span>
              </button>
            ))}
            {tasks.length === 0 && <p className="text-sm text-white/40">No tasks yet — set up a mission first.</p>}
          </div>
        </Card>
      )}

      {missions && missions.length > 1 && (
        <Card>
          <h2 className="mb-3 font-semibold">Other Missions</h2>
          <div className="flex flex-col gap-2">
            {missions
              .filter((m) => m.id !== primaryMission?.id && m.goal)
              .map((m) => (
                <Link
                  key={m.id}
                  to={`/goals/${m.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-bg-elevated px-3 py-2"
                >
                  <span className="text-sm">{m.title}</span>
                  <span className="text-xs text-white/40">
                    {Math.round((Number(m.goal!.currentAmount) / Number(m.goal!.targetAmount)) * 100)}%
                  </span>
                </Link>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

