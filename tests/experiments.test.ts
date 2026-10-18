import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { algorithms } from "../lib/library/algorithms";
import {
  describeAnswerDifference,
  explainExperiment,
  experimentCases,
  parseExperimentInput,
} from "../lib/library/experiments";
import { functionModels, functionCode } from "../lib/library/functions";

test("displayed Java references compile and match all ten trace models", (t) => {
  if (spawnSync("java", ["--version"]).status !== 0) {
    t.skip("Java unavailable");
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), "dsa-java-"));
  try {
    const cases = [
      { values: [], k: 1 },
      { values: [-3], k: 4 },
      { values: [3, 1, 4, 1, 2], k: 2 },
      { values: [-4, -3, -2, -1], k: 2 },
      { values: [0, 0, 0], k: 1 },
      { values: Array.from({ length: 16 }, (_, i) => i - 8), k: 20 },
    ];
    const expected: number[] = [];
    let calls = "";
    for (const f of functionModels)
      for (const c of cases) {
        const values =
          f.id === "lower" ? [...c.values].sort((a, b) => a - b) : c.values;
        expected.push(f.run({ values, k: c.k }).at(-1)!.returned!);
        calls += `System.out.println(${f.name}(new int[]{${values.join(",")}}, ${f.id === "fold" ? 0 : c.k}));\n`;
      }
    const source = `class Main {\n${functionModels.map((f) => functionCode(f, "Java")).join("\n")}\npublic static void main(String[] args) {\n${calls}}\n}`;
    const file = join(dir, "Main.java");
    writeFileSync(file, source);
    const run = spawnSync("java", [file], { encoding: "utf8", timeout: 15000 });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(run.stdout.trim().split("\n").map(Number), expected);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("experiment inputs bound computational work and reject invalid shapes", () => {
  assert.deepEqual(parseExperimentInput("[]", "1"), { values: [], k: 1 });
  assert.deepEqual(parseExperimentInput("[2,-1,20]", "10"), {
    values: [2, -1, 20],
    k: 10,
  });
  for (const raw of [
    "null",
    "{}",
    "[true]",
    '["3"]',
    "[1.5]",
    "[21]",
    "[1,]",
    "[0,0,0,0,0,0,0,0,0,0]",
  ])
    assert.throws(() => parseExperimentInput(raw, "2"));
  for (const k of ["", "0", "-1", "11", "1.5", "no"])
    assert.throws(() => parseExperimentInput("[1]", k));
});
test("every family can explain custom inputs and edge cases without mutating them", () => {
  const input = { values: [2, -1, 2, 4], k: 2 },
    before = JSON.stringify(input);
  for (const a of algorithms) {
    const result = explainExperiment(a, input);
    assert.deepEqual(result.output, a.solve(input));
    assert.equal(result.observations.length, 5);
    const cases = experimentCases(a, input);
    assert.equal(cases.length, 6);
    for (const c of cases) assert.deepEqual(c.output, a.solve(c.input));
  }
  assert.equal(JSON.stringify(input), before);
  assert.match(
    explainExperiment(
      algorithms.find((a) => a.id === "gallery-hops")!,
      input,
    ).observations[1].detail,
    /0 → 1/,
  );
  assert.match(
    explainExperiment(
      algorithms.find((a) => a.id === "tree-inorder")!,
      input,
    ).observations[1].detail,
    /Node 0=2/,
  );
});
test("diagnosis identifies JSON, shape, size, and first differing entry", () => {
  assert.match(describeAnswerDifference("oops", 2), /valid JSON/);
  assert.match(describeAnswerDifference("2", [2]), /not an array/);
  assert.match(describeAnswerDifference("[2]", 2), /single value/);
  assert.match(describeAnswerDifference("[1]", [1, 2]), /requires 2/);
  assert.match(describeAnswerDifference("[1,3]", [1, 2]), /index 1/);
  assert.match(describeAnswerDifference('"2"', 2), /string/);
  assert.match(describeAnswerDifference("[1,2]", [1, 2]), /matches/);
});

test("displayed C references compile and match trace results across boundary cases", (t) => {
  if (spawnSync("gcc", ["--version"]).status !== 0) {
    t.skip("C compiler unavailable");
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), "dsa-functions-"));
  try {
    const cases = [
      { values: [], k: 1 },
      { values: [-3], k: 4 },
      { values: [3, 1, 4, 1, 2], k: 2 },
      { values: [-4, -3, -2, -1], k: 2 },
      { values: [0, 0, 0, 0], k: 1 },
      { values: Array.from({ length: 16 }, (_, i) => i - 8), k: 20 },
    ];
    const expected: number[] = [];
    let body = "";
    for (const f of functionModels)
      for (const [index, c] of cases.entries()) {
        const values =
          f.id === "lower" ? [...c.values].sort((a, b) => a - b) : c.values;
        expected.push(f.run({ values, k: c.k }).at(-1)!.returned!);
        body += `{ int a[] = {${values.length ? values.join(",") : 0}}; printf("%d\\n", ${f.name}(a, ${values.length}, ${f.id === "fold" ? 0 : c.k})); }\n`;
      }
    const source = `#include <stdio.h>\n${functionModels.map((f) => functionCode(f, "C")).join("\n")}\nint main(void) {\n${body}return 0;}`;
    const file = join(dir, "references.c"),
      binary = join(dir, "references");
    writeFileSync(file, source);
    const build = spawnSync(
      "gcc",
      ["-std=c11", "-Wall", "-Wextra", file, "-o", binary],
      { encoding: "utf8", timeout: 15000 },
    );
    assert.equal(build.status, 0, build.stderr);
    const run = spawnSync(binary, [], { encoding: "utf8", timeout: 5000 });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(run.stdout.trim().split("\n").map(Number), expected);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("displayed Python references match trace results across boundary cases", (t) => {
  if (spawnSync("python3", ["--version"]).status !== 0) {
    t.skip("Python unavailable");
    return;
  }
  const cases = [
    { values: [], k: 1 },
    { values: [-3], k: 4 },
    { values: [3, 1, 4, 1, 2], k: 2 },
    { values: [-4, -3, -2, -1], k: 2 },
  ];
  const expected: number[] = [];
  let body = "";
  for (const f of functionModels)
    for (const c of cases) {
      const values =
        f.id === "lower" ? [...c.values].sort((a, b) => a - b) : c.values;
      expected.push(f.run({ values, k: c.k }).at(-1)!.returned!);
      body += `print(${f.name}(${JSON.stringify(values)}, ${f.id === "fold" ? 0 : c.k}))\n`;
    }
  const source =
    functionModels.map((f) => functionCode(f, "Python")).join("\n\n") +
    "\n" +
    body;
  const run = spawnSync("python3", ["-c", source], {
    encoding: "utf8",
    timeout: 5000,
  });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(run.stdout.trim().split("\n").map(Number), expected);
});
