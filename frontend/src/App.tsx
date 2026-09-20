import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { WelcomePage } from "./features/auth/WelcomePage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { OnboardingPage } from "./features/onboarding/OnboardingPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { GoalsListPage } from "./features/goals/GoalsListPage";
import { GoalDetailPage } from "./features/goals/GoalDetailPage";
import { TasksPage } from "./features/tasks/TasksPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { OverviewPage } from "./features/overview/OverviewPage";
import { CoachPage } from "./features/coach/CoachPage";
import { FriendsPage } from "./features/friends/FriendsPage";
import { GroupsPage } from "./features/groups/GroupsPage";
import { GroupDetailPage } from "./features/groups/GroupDetailPage";
import { ChallengesPage } from "./features/challenges/ChallengesPage";
import { ChallengeDetailPage } from "./features/challenges/ChallengeDetailPage";
import { ChallengeJoinPage } from "./features/challenges/ChallengeJoinPage";
import { FeedPage } from "./features/feed/FeedPage";
import { LeaderboardPage } from "./features/leaderboard/LeaderboardPage";

function withLayout(children: ReactNode) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={withLayout(<DashboardPage />)} />
          <Route path="/goals" element={withLayout(<GoalsListPage />)} />
          <Route path="/goals/:id" element={withLayout(<GoalDetailPage />)} />
          <Route path="/tasks" element={withLayout(<TasksPage />)} />
          <Route path="/overview" element={withLayout(<OverviewPage />)} />
          <Route path="/coach" element={withLayout(<CoachPage />)} />
          <Route path="/profile" element={withLayout(<ProfilePage />)} />
          <Route path="/friends" element={withLayout(<FriendsPage />)} />
          <Route path="/groups" element={withLayout(<GroupsPage />)} />
          <Route path="/groups/:id" element={withLayout(<GroupDetailPage />)} />
          <Route path="/challenges" element={withLayout(<ChallengesPage />)} />
          <Route path="/challenges/:id" element={withLayout(<ChallengeDetailPage />)} />
          <Route
            path="/challenges/join/:shareSlug"
            element={
              <ProtectedRoute>
                <ChallengeJoinPage />
              </ProtectedRoute>
            }
          />
          <Route path="/feed" element={withLayout(<FeedPage />)} />
          <Route path="/leaderboard" element={withLayout(<LeaderboardPage />)} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
