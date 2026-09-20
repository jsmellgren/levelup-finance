# LevelUp Finance — MVP

A gamified personal finance app: users pick a financial mission (destroy debt / build savings / grow net worth / hit $100K), log progress, complete daily tasks, and earn XP, levels, and achievements along the way.

This package contains a **working full-stack MVP** covering all 10 build phases:

| Phase | What it covers |
|---|---|
| 1 | Auth (register/login/JWT) + full Prisma schema |
| 2 | Onboarding — goal picker + type-specific forms (Debt / Savings / Net Worth / Custom) |
| 3 | Mission + Goal creation from onboarding |
| 4 | Dashboard — mission hero, progress ring, stats, today's tasks, streak |
| 5 | Progress tracking — log a payment/contribution, updates goal + triggers XP |
| 6 | Tasks + XP — rule-based daily task generation, complete/skip, XP awards, leveling |
| 7 | Achievements — rule-based unlock checks, profile display |
| 8 | Financial overview — net worth, savings, debt, cash flow cards |
| 9 | AI Coach — chat UI + backend route behind a swappable `ICoachProvider` interface (rule-based stub for MVP, ready to wire to a real LLM later) |
| 10 | Polish — loading/empty states, responsive mobile-first layout with bottom nav (mobile) / sidebar (desktop) |
| 11 | **Social layer** — friends (request/accept by username), groups, challenges (private/group/public with shareable join links, first-to-goal win detection), shared savings goals (multi-contributor), leaderboards (ranked by *recent XP earned*, not balance — per product principle), pull-based activity feed, in-app notifications, shareable achievement cards (client-side canvas export, no image-gen service needed) |

**Nav note:** mobile bottom nav is 5 tabs (Home / Goals / Challenges / Feed / Profile). Tasks, Friends, Groups, Overview, Coach, and Leaderboard live in the desktop sidebar and as quick links on the mobile Profile page.

**Not built (intentionally, per MVP scope):** Plaid/bank connections, a real AI model behind the coach, side-hustle/investment missions, challenges, social features, payments. The code is structured so all of these can be added without a rewrite (see "Where to extend" below).

---

## 1. Downloading and opening the project

1. Download `levelup-finance.zip` from this chat and unzip it anywhere on your computer.
2. Open the resulting `levelup-finance/` folder in your code editor (VS Code recommended: `code levelup-finance`).
3. You'll see two independent projects inside: `backend/` and `frontend/`. Each has its own `package.json` — treat them as two separate npm projects, run commands from inside each folder.

You'll need **Node.js 20+** and a **PostgreSQL** database (local install, Docker, or a free hosted instance like Neon or Supabase) before starting.

## 2. Running the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and set:
- `DATABASE_URL` — your Postgres connection string, e.g. `postgresql://user:password@localhost:5432/levelup_finance`
- `JWT_SECRET` — any long random string

Then:

```bash
npm install
npx prisma migrate dev --name init   # creates tables
npx prisma db seed                   # loads the achievement definitions
npm run dev                          # starts the API on http://localhost:4000
```

## 3. Running the frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env    # defaults already point at localhost:4000, edit if needed
npm install
npm run dev              # starts the app on http://localhost:5173
```

Visit `http://localhost:5173/welcome`, create an account, and walk through onboarding.

## 4. Making edits

- **Backend logic** lives in `backend/src/modules/<name>/` — each module has a `.routes.ts` (HTTP endpoints), `.service.ts` (business logic/DB calls), and `.schema.ts` (request validation). To change how something behaves (e.g. task generation rules, XP amounts, achievement conditions), edit the relevant service file. XP/leveling curve is in `backend/src/lib/xp.ts`.
- **Database changes**: edit `backend/prisma/schema.prisma`, then run `npx prisma migrate dev --name <describe-the-change>` to generate and apply a migration.
- **Frontend pages** live in `frontend/src/features/<area>/`. Shared UI pieces (buttons, cards, progress rings) are in `frontend/src/components/ui/`. API calls per module are in `frontend/src/api/`.
- **Styling/theme**: colors and design tokens are centralized in `frontend/tailwind.config.js` (`brand.teal`, `brand.purple`, `brand.debt`, `brand.gold`) — change them there rather than hunting through components.
- After any schema or route change, restart `npm run dev` in the backend (it hot-reloads on file save automatically via `tsx watch`, but a fresh Prisma migration needs to run separately as shown above).

## 5. Where to extend next

- **Bank connections**: add a Plaid service module under `backend/src/modules/`, write into the same `Goal`/`ProgressEntry` tables via a scheduled sync job instead of manual "Log Progress" calls.
- **Real AI coach**: swap the implementation inside `backend/src/modules/coach/coach.service.ts` — it's already isolated behind an interface so only that file needs to change; the route and frontend chat UI don't.
- **Payments/subscriptions**: add a `Subscription` model to the Prisma schema and a `stripe` module; gate `POST /missions` (limit free users to 1 active mission) in `missions.service.ts`.
- **Social/leaderboards**: would need a new `Friendship` model plus a leaderboard aggregation route — the `XPEvent`/`totalXP` fields already give you what you'd rank on.

## 6. Verifying it all works end to end

1. Register → land on Onboarding
2. Pick "Destroy My Debt" → fill in debt amounts → submit → land on Dashboard with your mission showing
3. Dashboard shows today's auto-generated tasks — complete one → XP increases, task list updates
4. Go to Goals → open your goal → "Log Progress" → enter a payment → progress bar and % update, an XP event fires
5. Profile tab shows your level, XP, and any achievements unlocked so far
6. Overview tab shows net worth/savings/debt cards
7. Coach tab lets you send a message and get a rule-based reply
8. Profile → set a username → Friends tab → search another test account's username → send/accept a request
9. Challenges → New → create a public challenge → copy its share link → open it in another account → it auto-joins
10. Log progress on a challenge you're in → leaderboard updates; if you're first to hit the target, you get a "Challenge Champion" achievement + bonus XP
11. Feed tab shows your own and your friends' recent activity (goal milestones, level-ups, challenge wins, achievements)
12. Leaderboard tab shows Friends/Global (ranked by XP earned in the last 7 days) and Streaks

If any step 404s, double check both dev servers are running and `frontend/.env`'s `VITE_API_URL` matches your backend port.
