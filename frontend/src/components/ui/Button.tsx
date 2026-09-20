import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-teal text-bg font-semibold hover:brightness-110",
  secondary: "bg-bg-elevated text-white border border-white/10 hover:bg-white/5",
  ghost: "bg-transparent text-white/70 hover:text-white",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`w-full rounded-xl2 px-4 py-3 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
