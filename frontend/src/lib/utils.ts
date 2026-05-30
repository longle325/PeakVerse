import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (handles conflicts). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Calculate challenge points awarded for a given score. */
export function calculateChallengePoints(
  score: number,
  total: number,
  passThreshold: number
): { points: number; passed: boolean; perfect: boolean } {
  const passed = score >= passThreshold;
  const perfect = score === total;
  let points = 50; // base completion points
  if (passed) points += 40;
  if (perfect) points += 25;
  return { points, passed, perfect };
}

/** Generate initials from a name (max 2 chars). */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Format number for Vietnamese locale. */
export function formatNumber(n: number): string {
  return n.toLocaleString("vi-VN");
}
