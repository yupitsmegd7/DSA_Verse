import type { Frame, FunctionModel } from "./functions";

export const extraFunctionModels: FunctionModel[] = [
  {
    id: "prefix",
    name: "prefixBudget",
    title: "Prefix sums & range queries",
    topic: "arrays",
    contract:
      "Sum the first min(k,n) values. Empty input returns 0; k must be positive.",
    parameter: "values: integer sequence; k: number of positions requested",
    complexity: "O(n) preprocessing · O(1) query · O(n) extra space",
    invariant:
      "prefix[i] is the sum of values[0..i). Subtract prefix[left] from prefix[right] to sum [left,right).",
    body: "int prefix[n + 1];\nprefix[0] = 0;\nfor (int i = 0; i < n; i++) {\n    prefix[i + 1] = prefix[i] + values[i];\n}\nint right = k < n ? k : n;\nreturn prefix[right] - prefix[0];",
    python:
      "prefix = [0] * (len(values) + 1)\nfor i, value in enumerate(values):\n    prefix[i + 1] = prefix[i] + value\nright = min(k, len(values))\nreturn prefix[right] - prefix[0]",
    run: ({ values: a, k }) => {
      const prefix = [0];
      const frames: Frame[] = [
        {
          operation: "Create prefix[0]=0 for the empty range",
          variables: { prefix: "[0]" },
          active: [],
        },
      ];
      a.forEach((x, i) => {
        prefix.push(prefix[i] + x);
        frames.push({
          operation: `prefix[${i + 1}] = ${prefix[i]} + (${x})`,
          variables: { i, prefix: JSON.stringify(prefix) },
          active: [i],
        });
      });
      const right = Math.min(k, a.length);
      frames.push({
        operation: `Query [0,${right}): prefix[${right}] − prefix[0]`,
        variables: { right, left: 0 },
        active: a.slice(0, right).map((_, i) => i),
        returned: prefix[right],
      });
      return frames;
    },
  },
  {
    id: "stack",
    name: "undoDepth",
    title: "Stacks & command interpretation",
    topic: "stacks",
    contract:
      "A nonnegative value pushes one item. A negative value pops one item if possible. Return the final number of items.",
    parameter: "values: integer commands; k is unused",
    complexity: "O(n) time · O(1) extra space when tracking depth only",
    invariant:
      "depth equals pushes minus successful pops in the processed commands; it never becomes negative.",
    body: "int depth = 0;\nfor (int i = 0; i < n; i++) {\n    if (values[i] >= 0) depth++;\n    else if (depth > 0) depth--;\n}\nreturn depth;",
    python:
      "depth = 0\nfor value in values:\n    if value >= 0:\n        depth += 1\n    elif depth > 0:\n        depth -= 1\nreturn depth",
    run: ({ values: a }) => {
      let depth = 0;
      const f: Frame[] = [
        {
          operation: "Start with an empty stack",
          variables: { depth },
          active: [],
        },
      ];
      a.forEach((x, i) => {
        const before = depth;
        depth = x >= 0 ? depth + 1 : Math.max(0, depth - 1);
        f.push({
          operation:
            x >= 0
              ? "Push one item"
              : before
                ? "Pop the most recent item"
                : "Ignore pop on an empty stack",
          variables: { i, command: x, depth },
          active: [i],
        });
      });
      return [
        ...f,
        {
          operation: "Return the remaining depth",
          variables: { depth },
          active: [],
          returned: depth,
        },
      ];
    },
  },
  {
    id: "inversions",
    name: "misorderedPairs",
    title: "Nested loops & inversion counting",
    topic: "sorting",
    contract:
      "Count index pairs i<j for which values[i]>values[j]. Equal values are not inversions.",
    parameter: "values: integer sequence; k is unused",
    complexity: "O(n²) time · O(1) extra space for this direct implementation",
    invariant:
      "count includes exactly the inverted pairs already inspected. Every unordered position pair is inspected once.",
    body: "int count = 0;\nfor (int i = 0; i < n; i++) {\n    for (int j = i + 1; j < n; j++) {\n        if (values[i] > values[j]) count++;\n    }\n}\nreturn count;",
    python:
      "count = 0\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        if values[i] > values[j]:\n            count += 1\nreturn count",
    run: ({ values: a }) => {
      let count = 0;
      const f: Frame[] = [
        {
          operation: "Initialize the inversion count",
          variables: { count },
          active: [],
        },
      ];
      for (let i = 0; i < a.length; i++)
        for (let j = i + 1; j < a.length; j++) {
          const inverted = a[i] > a[j];
          count += +inverted;
          f.push({
            operation: `${a[i]} > ${a[j]} is ${inverted}; ${inverted ? "count this inversion" : "leave the count unchanged"}`,
            variables: { i, j, count },
            active: [i, j],
          });
        }
      return [
        ...f,
        {
          operation: "Return the number of inverted pairs",
          variables: { count },
          active: [],
          returned: count,
        },
      ];
    },
  },
  {
    id: "spaced",
    name: "spacedExhibition",
    title: "Dynamic programming & state compression",
    topic: "dp",
    contract:
      "Choose nonadjacent positions to maximize their sum. Choosing nothing is allowed, so the result is at least 0.",
    parameter: "values: integer rewards; k is unused",
    complexity: "O(n) time · O(1) extra space",
    invariant:
      "Before a step, previous is the best result two positions back and best is the best result one position back.",
    body: "int previous = 0, best = 0;\nfor (int i = 0; i < n; i++) {\n    int take = previous + values[i];\n    int next = best > take ? best : take;\n    previous = best;\n    best = next;\n}\nreturn best;",
    python:
      "previous, best = 0, 0\nfor value in values:\n    take = previous + value\n    next_best = max(best, take)\n    previous = best\n    best = next_best\nreturn best",
    run: ({ values: a }) => {
      let previous = 0,
        best = 0;
      const f: Frame[] = [
        {
          operation: "Initialize both empty-prefix states",
          variables: { previous, best },
          active: [],
        },
      ];
      a.forEach((x, i) => {
        const take = previous + x,
          skip = best,
          next = Math.max(skip, take);
        f.push({
          operation: `Take position ${i}: ${take}; skip it: ${skip}. Keep ${next}.`,
          variables: { i, previous, take, skip, next },
          active: [i],
        });
        previous = best;
        best = next;
        f.push({
          operation: "Advance the two prefix states",
          variables: { previous, best },
          active: [i],
        });
      });
      return [
        ...f,
        {
          operation: "Return the maximum nonadjacent sum",
          variables: { best },
          active: [],
          returned: best,
        },
      ];
    },
  },
];
