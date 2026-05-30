import type { Character, ChallengeResult } from "@/types";

export const PASS_THRESHOLD = 4;
export const POINTS_PER_MATCH = 10;
export const POINTS_PER_COMPLETION = 50;
export const POINTS_PASS_BONUS = 40;

export function scoreChallenge(
  character: Character,
  answers: number[],
): ChallengeResult {
  const score = character.challenge.reduce(
    (total, question, index) =>
      total + (answers[index] === question.answer ? 1 : 0),
    0,
  );
  const passed = score >= PASS_THRESHOLD;
  const perfect = score === character.challenge.length;
  const awarded =
    POINTS_PER_COMPLETION + (passed ? POINTS_PASS_BONUS : 0);
  return {
    score,
    passed,
    perfect,
    awarded,
    answers: [...answers],
    correctAnswers: character.challenge.map((q) => q.answer),
  };
}
