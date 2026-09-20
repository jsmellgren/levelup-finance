import { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { listTodayTasks, updateTaskStatus, type Task } from "../../api/tasks";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";

export function TasksPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[] | null>(null);

  useEffect(() => {
    if (!token) return;
    listTodayTasks(token).then((res) => setTasks(res.tasks));
  }, [token]);

  async function setStatus(task: Task, status: Task["status"]) {
    if (!token) return;
    const { task: updated } = await updateTaskStatus(token, task.id, status);
    setTasks((prev) => prev?.map((t) => (t.id === updated.id ? updated : t)) ?? null);
  }

  const completed = tasks?.filter((t) => t.status === "COMPLETED").length ?? 0;

  return (
    <div className="px-6 py-8">
      <h1 className="mb-1 text-xl font-bold">Today's Tasks</h1>
      <p className="mb-6 text-sm text-white/50">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </p>

      {tasks && (
        <Card className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-white/50">
            <span>Progress</span>
            <span>
              {completed} of {tasks.length}
            </span>
          </div>
          <ProgressBar percent={tasks.length ? (completed / tasks.length) * 100 : 0} />
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {tasks?.map((task) => (
          <Card key={task.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStatus(task, task.status === "COMPLETED" ? "PENDING" : "COMPLETED")}
                className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs ${
                  task.status === "COMPLETED"
                    ? "border-brand-teal bg-brand-teal text-bg"
                    : "border-white/20 text-transparent"
                }`}
              >
                ✓
              </button>
              <span className={task.status === "COMPLETED" ? "text-white/40 line-through" : ""}>{task.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-teal">+{task.xpReward} XP</span>
              {task.status !== "SKIPPED" && task.status !== "COMPLETED" && (
                <button onClick={() => setStatus(task, "SKIPPED")} className="text-xs text-white/30">
                  Skip
                </button>
              )}
            </div>
          </Card>
        ))}
        {tasks?.length === 0 && <p className="text-white/40 text-sm">No tasks yet — set up a mission first.</p>}
      </div>
    </div>
  );
}
