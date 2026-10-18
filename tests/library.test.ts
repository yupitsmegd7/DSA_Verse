import test from "node:test";
import assert from "node:assert/strict";
import {
  algorithms,
  exercises,
  libraryTopics,
  sameAnswer,
  libraryRecommendation,
} from "../lib/library/catalog";
import { functionModels, functionCode } from "../lib/library/functions";
import { applyAction, initialStudio, studioSchema } from "../lib/state";
const solve = (id: string, values: number[], k = 2) =>
  algorithms.find((a) => a.id === id)!.solve({ values, k });
test("catalog has 1000 stable assessments in 25 balanced collections, with valid nonmutating evaluators", () => {
  assert.equal(exercises.length, 1000);
  assert.equal(algorithms.length, 50);
  assert.equal(libraryTopics.length, 25);
  assert.equal(new Set(exercises.map((q) => q.id)).size, 1000);
  assert.equal(new Set(exercises.map((q) => q.title)).size, 1000);
  for (const topic of libraryTopics)
    assert.equal(
      exercises.filter((q) => q.algorithm.topic === topic).length,
      40,
    );
  for (const q of exercises) {
    assert.ok(sameAnswer(JSON.stringify(q.answer), q.answer));
    assert.ok(!sameAnswer('"incorrect"', q.answer));
    assert.ok(!JSON.stringify(q.answer).includes("null"));
    for (const c of q.calls) {
      const copy = JSON.stringify(c);
      q.algorithm.solve(c);
      assert.equal(JSON.stringify(c), copy);
    }
    assert.ok(
      q.algorithm.contract && q.algorithm.invariant && q.algorithm.pitfall,
    );
  }
});
test("hand-worked examples cover every algorithm family, including signed and repeated values", () => {
  const expected: Record<string, unknown> = {
    "canvas-total": 7,
    "balanced-cut": -1,
    "label-runs": 4,
    "mirror-label": 2,
    "repeat-pigment": [2],
    "first-single": 1,
    "near-pairs": 3,
    "square-order": [1, 4, 4, 16],
    "window-budget": 6,
    "distinct-frame": [2, 2, 2],
    "shelf-insertion": 1,
    "capacity-search": 8,
    "chain-hop": [2, 2],
    "chain-weave": [-1, 2, 4, 2],
    "undo-stack": [2, 4],
    "next-taller": [3, 1, 1, 0],
    "queue-rotation": [2, 4, 2, -1],
    "queue-service": [3, 1, 0, 2],
    "recursive-depth": 3,
    "recursive-fold": 1,
    "subset-ledger": 2,
    "nonadjacent-choices": 3,
    "stable-curation": [1, 0, 2, 3],
    "inversion-ledger": 1,
    "tree-inorder": [4, -1, 2, 2],
    "tree-levels": [2, 1, 4],
    "bst-rank": 2,
    "bst-range": 2,
    "heap-reserve": [4, 2],
    "merge-cost": 26,
    "gallery-hops": 2,
    "gallery-paths": 2,
    "gallery-distance": 6,
    "gallery-budget": 1,
    "pigment-clusters": 2,
    "cluster-bridges": 1,
    "greedy-purchases": 3,
    "studio-schedule": 3,
    "rising-study": 3,
    "nonadjacent-profit": 6,
    "trie-prefix": 2,
    "trie-nodes": 12,
    "bit-lights": 2,
    "bit-union": 7,
    "gcd-grid": 1,
    "prime-pigments": 2,
    "matrix-diagonal": 6,
    "matrix-transpose": [2, 2, -1, 4],
    "interval-union": [
      [-1, 1],
      [2, 6],
    ],
    "interval-length": 6,
  };
  assert.equal(Object.keys(expected).length, 50);
  for (const [id, value] of Object.entries(expected))
    assert.deepEqual(solve(id, [2, -1, 2, 4]), value, id);
});
test("contracts handle empty arrays, strict comparisons, zeros, negative windows, and transitive groups", () => {
  for (const a of algorithms)
    assert.doesNotThrow(
      () => JSON.stringify(a.solve({ values: [], k: 3 })),
      a.id,
    );
  assert.equal(solve("window-budget", [-5, -2, -7], 2), -7);
  assert.equal(solve("balanced-cut", [0]), 0);
  assert.deepEqual(solve("next-taller", [3, 3, 3]), [0, 0, 0]);
  assert.equal(solve("pigment-clusters", [0, 2, 4], 2), 1);
  assert.equal(solve("gcd-grid", [0, 0]), 0);
  assert.equal(solve("gcd-grid", [-12, 0, 18]), 6);
  assert.equal(solve("trie-nodes", []), 1);
  assert.equal(solve("gallery-paths", [5]), 1);
  assert.equal(solve("nonadjacent-profit", [-2, -5]), 0);
  assert.equal(solve("capacity-search", [9], 8), 10);
});
test("library grading preserves first attempts, excludes retry inflation, validates JSON, and survives export/import", () => {
  const q = exercises[0],
    p = {
      action: "library-attempt",
      id: q.id,
      answer: "999999",
      hint: false,
      seconds: 12,
    };
  let result = applyAction(initialStudio(), p);
  assert.equal(result.result?.correct, false);
  const retried = applyAction(result.data, {
    ...p,
    answer: JSON.stringify(q.answer),
  });
  assert.equal(retried.result?.correct, true);
  assert.equal(retried.data.attempts.length, 1);
  assert.equal(retried.data.attempts[0].correct, 0);
  assert.throws(() =>
    applyAction(initialStudio(), { ...p, answer: "not json" }),
  );
  assert.throws(() => applyAction(initialStudio(), { ...p, id: "verse-9999" }));
  const clean = applyAction(initialStudio(), {
    ...p,
    answer: JSON.stringify(q.answer),
    hint: true,
  });
  assert.equal(clean.data.attempts[0].hint, 1);
  const restored = applyAction(initialStudio(), {
    action: "import",
    data: studioSchema.parse(clean.data),
  }).data;
  assert.deepEqual(restored.attempts, clean.data.attempts);
  assert.equal(libraryRecommendation(result.data)[0].id, q.id);
});
test("function traces finish with correct outputs, reject violated contracts, and emit three language references", () => {
  const expected = {
    sum: 11,
    count: 2,
    lower: 2,
    fold: 7,
    window: 5,
    gcd: 1,
    prefix: 4,
    stack: 5,
    inversions: 5,
    spaced: 9,
  };
  for (const f of functionModels) {
    const values = f.id === "lower" ? [1, 1, 3, 4, 5] : [3, 1, 4, 1, 2];
    const frames = f.run({ values, k: 2 });
    assert.equal(
      frames.at(-1)!.returned,
      expected[f.id as keyof typeof expected],
      f.id,
    );
    assert.ok(frames.length > 1);
    for (const l of ["C", "Java", "Python"] as const)
      assert.ok(functionCode(f, l).includes(f.name));
    assert.equal(f.run({ values: [], k: 2 }).at(-1)?.returned, 0);
  }
  assert.throws(
    () =>
      functionModels
        .find((f) => f.id === "lower")!
        .run({ values: [3, 1], k: 2 }),
    /sorted/,
  );
  const folds = functionModels
    .find((f) => f.id === "fold")!
    .run({ values: [2, 3], k: 2 });
  assert.equal(Math.max(...folds.map((f) => f.stack?.length || 0)), 3);
  assert.equal(folds.at(-1)?.returned, -1);
});
