import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded px-5 py-2.5 font-sans text-body-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--cinnabar)] text-white hover:opacity-90",
  secondary:
    "border border-ink text-ink hover:bg-ink hover:text-white",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-container-low",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
