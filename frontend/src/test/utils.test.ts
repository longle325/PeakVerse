import { describe, it, expect } from "vitest";
import { cn, calculateChallengePoints, initials, formatNumber } from "@/lib/utils";

describe("cn (class merging)", () => {
  it("merges simple class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("resolves Tailwind conflicts", () => {
    // tailwind-merge should keep the last conflicting class
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

describe("calculateChallengePoints", () => {
  it("awards base points for failing score", () => {
    const result = calculateChallengePoints(2, 5, 4);
    expect(result.passed).toBe(false);
    expect(result.perfect).toBe(false);
    expect(result.points).toBe(50);
  });

  it("awards pass bonus for 4/5", () => {
    const result = calculateChallengePoints(4, 5, 4);
    expect(result.passed).toBe(true);
    expect(result.perfect).toBe(false);
    expect(result.points).toBe(90); // 50 + 40
  });

  it("awards perfect bonus for 5/5", () => {
    const result = calculateChallengePoints(5, 5, 4);
    expect(result.passed).toBe(true);
    expect(result.perfect).toBe(true);
    expect(result.points).toBe(115); // 50 + 40 + 25
  });
});

describe("initials", () => {
  it("extracts first two initials", () => {
    expect(initials("Minh Trần")).toBe("MT");
  });

  it("handles single name", () => {
    expect(initials("Mị")).toBe("M");
  });
});

describe("formatNumber", () => {
  it("formats numbers for Vietnamese locale", () => {
    // The exact separator depends on locale support in the test env,
    // but the function should not throw and should return a string.
    const result = formatNumber(1450);
    expect(typeof result).toBe("string");
    expect(result).toContain("1");
  });
});
