import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  GoalsIcon,
  TasksIcon,
  ProfileIcon,
  CoachIcon,
  OverviewIcon,
  ChallengesIcon,
  FeedIcon,
  FriendsIcon,
  GroupsIcon,
  LeaderboardIcon,
} from "../components/ui/NavIcons";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/goals", label: "Goals", icon: GoalsIcon, end: false },
  { to: "/tasks", label: "Tasks", icon: TasksIcon, end: false },
  { to: "/challenges", label: "Challenges", icon: ChallengesIcon, end: false },
  { to: "/feed", label: "Feed", icon: FeedIcon, end: false },
  { to: "/friends", label: "Friends", icon: FriendsIcon, end: false },
  { to: "/groups", label: "Groups", icon: GroupsIcon, end: false },
  { to: "/leaderboard", label: "Leaderboard", icon: LeaderboardIcon, end: false },
  { to: "/overview", label: "Overview", icon: OverviewIcon, end: false },
  { to: "/coach", label: "Coach", icon: CoachIcon, end: false },
  { to: "/profile", label: "Profile", icon: ProfileIcon, end: false },
];

// Mobile bottom nav stays at 5 tabs — the rest (Tasks, Friends, Groups, Overview, Coach)
// live in the desktop sidebar and are linked from the Profile page on mobile.
const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((i) => ["/", "/goals", "/challenges", "/feed", "/profile"].includes(i.to));

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-white/5 md:bg-bg-card md:p-6">
        <div className="mb-8 flex items-center gap-2">
          <span className="text-2xl">⛰️</span>
          <span className="font-bold">LevelUp</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl2 px-3 py-2 text-sm transition ${
                  isActive ? "bg-brand-teal/10 text-brand-teal" : "text-white/60 hover:bg-white/5"
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 pb-20 md:pb-0">{children}</div>

      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-white/5 bg-bg-card md:hidden">
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
                isActive ? "text-brand-teal" : "text-white/40"
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
