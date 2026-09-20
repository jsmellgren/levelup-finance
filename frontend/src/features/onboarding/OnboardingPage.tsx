import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoalPicker } from "./GoalPicker";
import { GoalForm } from "./GoalForm";
import { createMission, type CreateMissionPayload } from "../../api/missions";
import { useAuth } from "../../store/AuthContext";

type MissionType = CreateMissionPayload["type"];

export function OnboardingPage() {
  const [selectedType, setSelectedType] = useState<MissionType | null>(null);
  const [presetTitle, setPresetTitle] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  function handleSelect(type: MissionType, preset?: string) {
    setSelectedType(type);
    setPresetTitle(preset);
  }

  async function handleSubmit(payload: CreateMissionPayload) {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createMission(token, payload);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold">
        {selectedType ? "Set Up Your Mission" : "Choose Your Mission"}
      </h1>
      <p className="mb-8 text-white/60">
        {selectedType
          ? "Just a few numbers so we can track your progress."
          : "Pick a goal to start your journey. You can always change it later."}
      </p>

      {error && <p className="mb-4 text-sm text-brand-debt">{error}</p>}

      {!selectedType ? (
        <GoalPicker onSelect={handleSelect} />
      ) : (
        <GoalForm
          type={selectedType}
          presetTitle={presetTitle}
          onSubmit={handleSubmit}
          onBack={() => setSelectedType(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}