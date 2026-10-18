import {
  algorithms,
  edges,
  type Algorithm,
  type Input,
  type Value,
} from "./algorithms";

export type Experiment = {
  input: Input;
  output: Value;
  observations: { title: string; detail: string }[];
};

// Strict limits keep the exponential teaching evaluators responsive. Never eval user code.
export function parseExperimentInput(raw: string, parameter: string): Input {
  let values: unknown;
  try {
    values = JSON.parse(raw);
  } catch {
    throw new Error(
      "Use a JSON array, for example [3, -1, 4], or [] for an empty input.",
    );
  }
  if (
    !Array.isArray(values) ||
    values.length > 9 ||
    values.some((v) => !Number.isInteger(v) || Math.abs(v) > 20)
  ) {
    throw new Error("Use at most 9 integers, each between −20 and 20.");
  }
  const k = Number(parameter);
  if (!parameter.trim() || !Number.isInteger(k) || k < 1 || k > 10)
    throw new Error("k must be an integer from 1 to 10.");
  return { values: values as number[], k };
}

export function explainExperiment(
  algorithm: Algorithm,
  input: Input,
): Experiment {
  const a = input.values;
  const observations = [
    {
      title: "Bind the arguments",
      detail: `values receives ${JSON.stringify(a)} (${a.length} elements); k receives ${input.k}. Each call starts with fresh state.`,
    },
  ];
  if (/gallery-(hops|paths|distance|budget)/.test(algorithm.id)) {
    observations.push({
      title: "Build the gallery network",
      detail: edges(a).length
        ? edges(a)
            .map(([u, v, w]) => `${u} → ${v} (weight ${w})`)
            .join("; ")
        : "There are no edges. Read the contract's empty/single-vertex rule.",
    });
  } else if (algorithm.topic === "Tries") {
    const names = [
      "ink",
      "iris",
      "ivy",
      "oak",
      "ochre",
      "olive",
      "rose",
      "reed",
      "ruby",
    ];
    observations.push({
      title: "Translate the archive keys",
      detail: a.length
        ? a.map((x) => `${x} → ${names[Math.abs(x) % 9]}`).join("; ")
        : "No words are inserted. The trie still has its root.",
    });
  } else if (algorithm.topic === "Binary trees") {
    observations.push({
      title: "Connect the tree",
      detail: a.length
        ? a
            .map(
              (x, i) =>
                `Node ${i}=${x}; children ${[2 * i + 1, 2 * i + 2].filter((j) => j < a.length).join(", ") || "none"}`,
            )
            .join(". ")
        : "The tree has no root.",
    });
  } else if (algorithm.topic === "Matrices") {
    const width = Math.ceil(Math.sqrt(a.length));
    observations.push({
      title: "Build the mosaic",
      detail: width
        ? Array.from({ length: width }, (_, r) =>
            JSON.stringify(
              Array.from({ length: width }, (_, c) => a[r * width + c] ?? 0),
            ),
          ).join(" · ")
        : "The empty input creates an empty matrix.",
    });
  } else if (algorithm.topic === "Sliding windows") {
    const windows = Array.from(
      { length: Math.max(0, a.length - input.k + 1) },
      (_, i) => a.slice(i, i + input.k),
    );
    observations.push({
      title: "List the complete windows",
      detail: windows.length
        ? windows
            .map(
              (w) =>
                `${JSON.stringify(w)} → sum ${w.reduce((s, x) => s + x, 0)}, distinct ${new Set(w).size}`,
            )
            .join("; ")
        : "There are fewer than k values, so no complete window exists.",
    });
  } else if (
    [
      "Sorting",
      "Binary search",
      "Two pointers",
      "Intervals",
      "Search trees",
    ].includes(algorithm.topic)
  ) {
    observations.push({
      title: "Inspect the ordered values",
      detail: `Ascending order: ${JSON.stringify([...a].sort((a, b) => a - b))}. Original order remains ${JSON.stringify(a)}. Only use the sorted form when the contract calls for it.`,
    });
  } else if (algorithm.topic === "Hash maps") {
    const counts = new Map<number, number>();
    for (const x of a) counts.set(x, (counts.get(x) || 0) + 1);
    observations.push({
      title: "Count the occurrences",
      detail: counts.size
        ? [...counts].map(([x, n]) => `${x}: ${n}`).join("; ")
        : "The frequency table is empty.",
    });
  } else {
    observations.push({
      title: "Inspect a smaller input",
      detail: `On the prefix ${JSON.stringify(a.slice(0, Math.min(3, a.length)))}, the same contract returns ${JSON.stringify(algorithm.solve({ ...input, values: a.slice(0, 3) }))}. Compare this with the full call; a prefix result need not be a prefix of the final result.`,
    });
  }
  observations.push(
    { title: "Choose the approach", detail: algorithm.idea },
    { title: "Keep the invariant", detail: algorithm.invariant },
  );
  const output = algorithm.solve({ values: [...a], k: input.k });
  observations.push({
    title: "Return to the caller",
    detail: `The returned ${Array.isArray(output) ? "array" : "value"} is ${JSON.stringify(output)}. Returning ends this call; it is separate from printing to the console.`,
  });
  return { input: { values: [...a], k: input.k }, output, observations };
}

export function experimentCases(algorithm: Algorithm, input: Input) {
  const cases = [
    { name: "Your input", input },
    { name: "Empty input", input: { ...input, values: [] } },
    { name: "Singleton", input: { ...input, values: [input.values[0] ?? 0] } },
    { name: "Repeated values", input: { ...input, values: [2, 2, 2, 2] } },
    { name: "Negative values", input: { ...input, values: [-3, -1, -3, -2] } },
    { name: "Parameter boundary", input: { ...input, k: 1 } },
  ];
  return cases.map((c) => ({
    ...c,
    output: algorithm.solve({ values: [...c.input.values], k: c.input.k }),
  }));
}

export function describeAnswerDifference(raw: string, expected: Value): string {
  let actual: unknown;
  try {
    actual = JSON.parse(raw);
  } catch {
    return "This is not valid JSON. Use 7 for a number, [1,2] for a list, and [[1],[2]] for a list of lists.";
  }
  if (JSON.stringify(actual) === JSON.stringify(expected))
    return "Your prediction matches the function contract. Now explain which invariant makes that result inevitable.";
  if (Array.isArray(expected) && !Array.isArray(actual))
    return "The contract returns an array, but your answer is not an array. For multiple calls, preserve one result per call inside an outer array.";
  if (!Array.isArray(expected) && Array.isArray(actual))
    return "This call returns a single value. Recheck whether you were asked for an index, count, sum, or value instead of an array.";
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (actual.length !== expected.length)
      return `Your array has ${actual.length} entries; the contract requires ${expected.length}. Check output cardinality and empty-input rules.`;
    const i = expected.findIndex(
      (v, i) => JSON.stringify(v) !== JSON.stringify(actual[i]),
    );
    return `The first different entry is at zero-based index ${i}. Trace the work producing that entry before changing later entries.`;
  }
  if (typeof actual !== typeof expected)
    return `The answer has type ${actual === null ? "null" : typeof actual}; this contract expects ${typeof expected}. A quoted number is a string.`;
  return "The shape is right, but the value differs. Check inclusive versus exclusive bounds, index versus value, and the starting accumulator.";
}

export const algorithmById = new Map(algorithms.map((a) => [a.id, a]));
