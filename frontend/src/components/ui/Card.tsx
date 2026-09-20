import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl2 border border-white/5 bg-bg-card p-5 ${className}`}
      {...props}
    />
  );
}
