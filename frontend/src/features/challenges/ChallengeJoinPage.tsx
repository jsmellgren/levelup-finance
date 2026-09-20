import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { joinChallengeByLink } from "../../api/challenges";

export function ChallengeJoinPage() {
  const { shareSlug } = useParams<{ shareSlug: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !shareSlug) return;
    joinChallengeByLink(token, shareSlug)
      .then(() => navigate("/challenges"))
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't join that challenge"));
  }, [token, shareSlug, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      {error ? <p className="text-sm text-brand-debt">{error}</p> : <p className="text-sm text-white/40">Joining challenge...</p>}
    </div>
  );
}
