import {
  algorithms,
  type Algorithm,
  type Input,
  type Value,
} from "./algorithms";
import { topicStats, type Studio } from "../curriculum";
export { algorithms };
export const libraryTopics = [...new Set(algorithms.map((a) => a.topic))];
export type Exercise = {
  id: string;
  number: number;
  title: string;
  algorithm: Algorithm;
  mode: number;
  variation: number;
  difficulty: "Foundation" | "Applied" | "Stretch";
  input: Input;
  calls: Input[];
  prompt: string;
  answer: Value;
};
const modes = [
  "Trace the return",
  "Extend the input",
  "Compare two calls",
  "Trace a prefix",
  "Test the boundaries",
];
function inputFor(index: number, variation: number): Input {
  let seed = (index + 1) * 7919 + variation * 104729;
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const length = 5 + variation;
  return {
    values: Array.from({ length }, () => Number(next() % 25) - 9),
    k: 2 + ((index + variation) % 4),
  };
}
export function createExercise(
  a: Algorithm,
  index: number,
  variation: number,
): Exercise {
  const mode = Math.floor(variation / 4),
    input = inputFor(index, variation % 4);
  const extra = ((index + variation) % 13) - 4;
  const calls: Input[] =
    mode === 0
      ? [input]
      : mode === 1
        ? [{ ...input, values: [...input.values, extra] }]
        : mode === 2
          ? [input, { ...input, k: input.k + 1 }]
          : mode === 3
            ? [{ ...input, values: input.values.slice(0, input.k) }]
            : [
                { ...input, values: [] },
                { ...input, values: [input.values[0]] },
                input,
              ];
  const notes = [
    "Predict the function's return value for this call.",
    `A new value ${extra} has been appended. Predict the return value for the updated call shown below.`,
    "The parameter changes between these two independent calls. Return both results in order as a JSON array.",
    "Only the first k positions from the original tray are retained in this call. Predict the return value for the shortened input shown below.",
    "Check the empty input, a singleton, and the full input. Return all three results in order as a JSON array.",
  ];
  return {
    id: `verse-${String(index * 20 + variation + 1).padStart(4, "0")}`,
    number: index * 20 + variation + 1,
    title: `${a.title} · ${modes[mode]} ${(variation % 4) + 1}`,
    algorithm: a,
    mode,
    variation,
    difficulty:
      mode === 0 || mode === 3
        ? "Foundation"
        : mode === 4
          ? "Stretch"
          : "Applied",
    input,
    calls,
    prompt: `${a.contract}\n\n${notes[mode]}`,
    answer:
      mode === 2 || mode === 4
        ? calls.map((c) => a.solve(c))
        : a.solve(calls[0]),
  };
}
export const exercises = algorithms.flatMap((a, i) =>
  Array.from({ length: 20 }, (_, v) => createExercise(a, i, v)),
);
export const exerciseById = new Map(exercises.map((q) => [q.id, q]));
export function sameAnswer(raw: string, answer: Value) {
  try {
    return JSON.stringify(JSON.parse(raw)) === JSON.stringify(answer);
  } catch {
    return false;
  }
}
export function exerciseStatus(
  data: Studio,
  id: string,
): "untouched" | "review" | "solved" | "practiced" {
  const a = data.attempts.filter(
    (a) => a.kind === "library" && a.outcome.startsWith(id + ":"),
  );
  return a.some((a) => a.correct && !a.hint)
    ? "solved"
    : a.some((a) => a.correct || a.outcome.endsWith(":reviewed"))
      ? "practiced"
      : a.length
        ? "review"
        : "untouched";
}
export function libraryRecommendation(data: Studio) {
  const weak = exercises.filter((q) => exerciseStatus(data, q.id) === "review");
  const unsolved = exercises.filter(
    (q) => exerciseStatus(data, q.id) === "untouched",
  );
  const focus = data.settings.focus;
  const ranked = unsolved
    .map((q) => ({
      q,
      score:
        (q.algorithm.lesson === focus ? -150 : 0) +
        topicStats(data.attempts, q.algorithm.lesson).score +
        (q.difficulty === "Foundation"
          ? 0
          : q.difficulty === "Applied"
            ? 25
            : 50) +
        q.number / 10000,
    }))
    .sort((a, b) => a.score - b.score)
    .map((x) => x.q);
  const selected: Exercise[] = [];
  const families = new Set<string>();
  for (const q of [...weak, ...ranked])
    if (!families.has(q.algorithm.id)) {
      selected.push(q);
      families.add(q.algorithm.id);
      if (selected.length === 6) break;
    }
  return selected;
}
export function coachResponse(q: Exercise, question: string): string {
  const s = question.toLowerCase();
  if (/complex|space|time|big.?o|fast/.test(s))
    return `Target implementation: ${q.algorithm.complexity}. This describes the teaching approach, not the small reference evaluator. Identify what grows with n, and distinguish extra storage from the returned output.`;
  if (/invariant|always|proof|correct/.test(s))
    return `${q.algorithm.invariant} Check this before the first step, after a step, and at termination. Those three checks form a useful correctness argument.`;
  if (/edge|empty|boundary|zero|negative|duplicate/.test(s))
    return `${q.algorithm.pitfall} For this function, an empty input returns ${JSON.stringify(q.algorithm.solve({ values: [], k: q.input.k }))}. Try a singleton and repeated values next.`;
  if (/java|\bc\b|python|type|parameter|argument|return|function/.test(s))
    return `The function receives values (an integer sequence) and k (a positive integer). Each call is independent and must leave its input unchanged. Contract: ${q.algorithm.contract} In C pass the length separately; Java arrays expose .length; Python sequences expose len(...).`;
  if (/wrong|mistake|debug|stuck/.test(s))
    return `${q.algorithm.pitfall} Re-read whether the output is a value, index, count, or list. For multi-call exercises, wrap the individual return values in one outer JSON array.`;
  return `${q.algorithm.idea} Start by stating what the function receives and returns. Then track this invariant: ${q.algorithm.invariant} Ask about “edge cases”, “complexity”, “invariant”, “parameters”, or “debugging” for a focused explanation.`;
}
