import type { Input } from "./algorithms";
export type Frame = {
  operation: string;
  variables: Record<string, number | string>;
  active: number[];
  stack?: string[];
  returned?: number;
};
export type FunctionModel = {
  id: string;
  name: string;
  title: string;
  topic: string;
  contract: string;
  parameter: string;
  complexity: string;
  invariant: string;
  body: string;
  python: string;
  run: (input: Input) => Frame[];
};
function totalRun({ values: a }: Input): Frame[] {
  let total = 0;
  const frames: Frame[] = [
    {
      operation: "Initialize the accumulator",
      variables: { total },
      active: [],
    },
  ];
  a.forEach((x, i) => {
    total += x;
    frames.push({
      operation: `Read values[${i}] and add it`,
      variables: { i, value: x, total },
      active: [i],
    });
  });
  frames.push({
    operation: "Return to the caller",
    variables: { total },
    active: [],
    returned: total,
  });
  return frames;
}
export const functionModels: FunctionModel[] = [
  {
    id: "sum",
    name: "pigmentTotal",
    title: "Accumulators & return values",
    topic: "arrays",
    contract: "Return the sum of every value. Empty input returns 0.",
    parameter: "values: integer sequence; k is unused",
    complexity: "O(n) time · O(1) extra space",
    invariant: "Before iteration i, total equals the sum of values[0..i).",
    body: "int total = 0;\nfor (int i = 0; i < n; i++) {\n    total += values[i];\n}\nreturn total;",
    python: "total = 0\nfor value in values:\n    total += value\nreturn total",
    run: totalRun,
  },
  {
    id: "count",
    name: "countAbove",
    title: "Parameters & predicates",
    topic: "arrays",
    contract: "Return how many values are strictly greater than k.",
    parameter: "values: integer sequence; k: threshold",
    complexity: "O(n) time · O(1) extra space",
    invariant: "count equals the number of qualifying values already visited.",
    body: "int count = 0;\nfor (int i = 0; i < n; i++) {\n    if (values[i] > k) count++;\n}\nreturn count;",
    python:
      "count = 0\nfor value in values:\n    if value > k:\n        count += 1\nreturn count",
    run: ({ values: a, k }) => {
      let count = 0;
      const f: Frame[] = [
        {
          operation: "Bind the threshold parameter",
          variables: { k, count },
          active: [],
        },
      ];
      a.forEach((x, i) => {
        count += +(x > k);
        f.push({
          operation: `${x} > ${k} is ${x > k}`,
          variables: { i, value: x, k, count },
          active: [i],
        });
      });
      return [
        ...f,
        {
          operation: "Return the count",
          variables: { count },
          active: [],
          returned: count,
        },
      ];
    },
  },
  {
    id: "lower",
    name: "insertionSlot",
    title: "Search contracts & boundaries",
    topic: "search",
    contract:
      "Input must be sorted ascending. Return the first index with value ≥k, or n when none exists.",
    parameter: "values: sorted integer sequence; k: target",
    complexity: "O(log(n+1)) time · O(1) extra space",
    invariant:
      "The first valid position remains in [lo,hi]. The search inspects [lo,hi).",
    body: "int lo = 0, hi = n;\nwhile (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (values[mid] < k) lo = mid + 1;\n    else hi = mid;\n}\nreturn lo;",
    python:
      "lo, hi = 0, len(values)\nwhile lo < hi:\n    mid = lo + (hi - lo) // 2\n    if values[mid] < k:\n        lo = mid + 1\n    else:\n        hi = mid\nreturn lo",
    run: ({ values: a, k }) => {
      if (a.some((x, i) => i > 0 && a[i - 1] > x))
        throw new Error(
          "This function requires sorted input. Sort your values first.",
        );
      let lo = 0,
        hi = a.length;
      const f: Frame[] = [
        {
          operation: "Initialize half-open bounds",
          variables: { lo, hi, k },
          active: [],
        },
      ];
      while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        f.push({
          operation: `Compare values[${mid}]=${a[mid]} with ${k}`,
          variables: { lo, hi, mid, k },
          active: [mid],
        });
        if (a[mid] < k) lo = mid + 1;
        else hi = mid;
        f.push({
          operation: "Keep the half containing the first valid slot",
          variables: { lo, hi, k },
          active: [],
        });
      }
      return [
        ...f,
        {
          operation: "Return the insertion slot",
          variables: { lo, hi },
          active: [],
          returned: lo,
        },
      ];
    },
  },
  {
    id: "fold",
    name: "alternatingFold",
    title: "Recursion & the call stack",
    topic: "recursion",
    contract:
      "Return values[0] − (values[1] − (...)). An empty suffix returns 0.",
    parameter:
      "values: integer sequence; helper index i starts at 0; k is unused",
    complexity: "O(n) time · O(n) call stack",
    invariant:
      "fold(i) returns the alternating sum of the suffix beginning at i.",
    body: "if (i == n) return 0;\nreturn values[i] - alternatingFold(values, n, i + 1);",
    python:
      "if i == len(values):\n    return 0\nreturn values[i] - alternatingFold(values, i + 1)",
    run: ({ values: a }) => {
      const f: Frame[] = [];
      for (let i = 0; i <= a.length; i++)
        f.push({
          operation:
            i === a.length
              ? "Base case: the suffix is empty"
              : "Pause this call until the suffix returns",
          variables: { i, ...(i < a.length ? { value: a[i] } : { result: 0 }) },
          active: i < a.length ? [i] : [],
          stack: Array.from({ length: i + 1 }, (_, j) => `fold(${j})`),
        });
      let result = 0;
      for (let i = a.length - 1; i >= 0; i--) {
        const child = result;
        result = a[i] - child;
        f.push({
          operation: `Resume fold(${i}): ${a[i]} − (${child}) = ${result}`,
          variables: { i, child, result },
          active: [i],
          stack: Array.from({ length: i + 1 }, (_, j) => `fold(${j})`),
        });
      }
      return [
        ...f,
        {
          operation: "Return to the original caller",
          variables: { result },
          active: [],
          stack: [],
          returned: result,
        },
      ];
    },
  },
  {
    id: "window",
    name: "frameMaximum",
    title: "A rolling window invariant",
    topic: "window",
    contract:
      "Return the largest sum of exactly k consecutive values. k must be positive. Return 0 if there are fewer than k values.",
    parameter: "values: integer sequence; k: positive window size",
    complexity: "O(n) time · O(1) extra space",
    invariant:
      "window is the sum of the current k-element block; best is the largest window seen.",
    body: "if (n < k) return 0;\nint window = 0;\nfor (int i = 0; i < k; i++) window += values[i];\nint best = window;\nfor (int i = k; i < n; i++) {\n    window += values[i] - values[i-k];\n    if (window > best) best = window;\n}\nreturn best;",
    python:
      "if len(values) < k:\n    return 0\nwindow = sum(values[:k])\nbest = window\nfor i in range(k, len(values)):\n    window += values[i] - values[i-k]\n    best = max(best, window)\nreturn best",
    run: ({ values: a, k }) => {
      if (k < 1) throw new Error("k must be positive.");
      if (a.length < k)
        return [
          {
            operation: "Contract guard: fewer than k values",
            variables: { n: a.length, k },
            active: [],
            returned: 0,
          },
        ];
      let window = a.slice(0, k).reduce((s, x) => s + x, 0),
        best = window;
      const f: Frame[] = [
        {
          operation: "Initialize the first complete window",
          variables: { window, best, k },
          active: Array.from({ length: k }, (_, i) => i),
        },
      ];
      for (let i = k; i < a.length; i++) {
        window += a[i] - a[i - k];
        best = Math.max(best, window);
        f.push({
          operation: `Add ${a[i]}, remove ${a[i - k]}`,
          variables: { i, incoming: a[i], outgoing: a[i - k], window, best },
          active: Array.from({ length: k }, (_, j) => i - k + 1 + j),
        });
      }
      return [
        ...f,
        {
          operation: "Return the largest window sum",
          variables: { best },
          active: [],
          returned: best,
        },
      ];
    },
  },
  {
    id: "gcd",
    name: "commonGrid",
    title: "Composition & Euclid's algorithm",
    topic: "advanced",
    contract:
      "Return the gcd of absolute values. Empty input and all-zero input return 0.",
    parameter: "values: integer sequence; k is unused",
    complexity: "O(n log(M+1)) time · O(1) extra space",
    invariant:
      "gcd(a,b)=gcd(b,a%b). The outer result is the gcd of the processed prefix.",
    body: "int result = 0;\nfor (int i = 0; i < n; i++) {\n    int a = result;\n    int b = values[i] < 0 ? -values[i] : values[i];\n    while (b != 0) {\n        int remainder = a % b;\n        a = b; b = remainder;\n    }\n    result = a;\n}\nreturn result;",
    python:
      "result = 0\nfor value in values:\n    a, b = result, abs(value)\n    while b != 0:\n        a, b = b, a % b\n    result = a\nreturn result",
    run: ({ values: v }) => {
      let result = 0;
      const f: Frame[] = [
        {
          operation: "Initialize the gcd identity",
          variables: { result },
          active: [],
        },
      ];
      v.forEach((x, i) => {
        let a = result,
          b = Math.abs(x);
        f.push({
          operation: `Fold input ${x} into the running gcd`,
          variables: { i, a, b, result },
          active: [i],
        });
        while (b) {
          const remainder = a % b;
          f.push({
            operation: `Euclid: ${a} % ${b} = ${remainder}`,
            variables: { a, b, remainder },
            active: [i],
          });
          a = b;
          b = remainder;
        }
        result = a;
        f.push({
          operation: "Store this prefix gcd",
          variables: { result },
          active: [i],
        });
      });
      return [
        ...f,
        {
          operation: "Return the shared grid size",
          variables: { result },
          active: [],
          returned: result,
        },
      ];
    },
  },
];
export function functionCode(
  f: FunctionModel,
  language: "C" | "Java" | "Python",
) {
  if (language === "Python")
    return `def ${f.name}(values, ${f.id === "fold" ? "i=0" : "k"}):\n${f.python
      .split("\n")
      .map((l) => "    " + l)
      .join("\n")}`;
  const recursive = f.id === "fold";
  const body =
    language === "Java"
      ? f.body.replaceAll(
          "alternatingFold(values, n, i + 1)",
          "alternatingFold(values, i + 1)",
        )
      : f.body;
  return (
    `${language === "Java" ? "static " : ""}int ${f.name}(${language === "C" ? "const int values[], int n" : "int[] values"}, int ${recursive ? "i" : "k"}) {\n${language === "Java" ? "    int n = values.length;\n" : ""}${body
      .split("\n")
      .map((l) => "    " + l)
      .join("\n")}\n` + "}"
  );
}
