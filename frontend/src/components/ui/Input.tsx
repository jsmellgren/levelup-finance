import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-xl2 bg-bg-elevated border border-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-brand-teal/60"
      {...props}
    />
  );
}
