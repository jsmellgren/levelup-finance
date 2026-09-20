import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col justify-between px-6 py-12">
      <div className="mt-16 flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-teal/10 text-4xl">
          ⛰️
        </div>
        <h1 className="text-2xl font-bold">LevelUp Finance</h1>
        <p className="mt-4 text-white/60">
          Set your goals. Track your progress.
          <br />
          Build the life you want.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link to="/register">
          <Button variant="primary">Get Started</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">Log In</Button>
        </Link>
        <p className="mt-2 text-center text-xs text-white/40">
          Your financial journey starts here.
        </p>
      </div>
    </div>
  );
}
