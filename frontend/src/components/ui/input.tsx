import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded border border-outline-variant bg-white px-4 py-2.5 font-sans text-body-md",
      "placeholder:text-outline focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
