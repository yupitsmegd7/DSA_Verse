import test from "node:test";
import assert from "node:assert/strict";
import { initialStudio, applyAction, studioSchema } from "../lib/state";
import {
  topics,
  questionFor,
  topicStats,
  recommendation,
} from "../lib/curriculum";

test("every topic and variation has unique choices and a valid answer", () => {
  for (const t of topics) {
    for (const language of ["C", "Java", "Python"] as const)
      assert.ok(t.code[language].length > 30);
    for (let seed = 0; seed < 150; seed++) {
      const q = questionFor(t.id, seed);
      assert.equal(
        new Set(q.options).size,
        q.options.length,
        `${t.id}:${seed}`,
      );
      assert.ok(q.options.includes(q.answer), `${t.id}:${seed}`);
      assert.ok(q.explanation && q.hint);
    }
  }
});

test("independent graded evidence advances the path; hints reduce mastery", () => {
  let independent = initialStudio(),
    hinted = initialStudio();
  assert.equal(recommendation(independent).topic.id, "complexity");
  for (let seed = 0; seed < 3; seed++) {
    const action = {
      action: "attempt",
      topic: "complexity",
      kind: "drill",
      seed,
      answer: questionFor("complexity", seed).answer,
      seconds: 30,
    };
    independent = applyAction(independent, { ...action, hint: false }).data;
    hinted = applyAction(hinted, { ...action, hint: true }).data;
    if (seed === 0)
      assert.equal(topicStats(independent.attempts, "complexity").score, 33);
  }
  assert.equal(topicStats(independent.attempts, "complexity").score, 100);
  assert.equal(topicStats(hinted.attempts, "complexity").score, 65);
  assert.equal(recommendation(independent).topic.id, "arrays");
  assert.equal(recommendation(hinted).topic.id, "complexity");
});

test("attempt retries and imported backups do not inflate mastery", () => {
  const action = {
    action: "attempt",
    topic: "arrays",
    kind: "drill",
    seed: 12,
    answer: questionFor("arrays", 12).answer,
    seconds: 15,
    hint: false,
  };
  const first = applyAction(initialStudio(), action).data;
  const retry = applyAction(first, action).data;
  assert.equal(retry.attempts.length, 1);
  assert.deepEqual(
    applyAction(retry, { action: "import", data: first }).data.attempts,
    first.attempts,
  );
  assert.throws(() =>
    studioSchema.parse({
      ...first,
      settings: { ...first.settings, language: "Ruby" },
    }),
  );
});

test("self-reported LeetCode work is kept separate from graded mastery", () => {
  const s = applyAction(initialStudio(), {
    action: "attempt",
    kind: "external",
    topic: "arrays",
    slug: topics[1].problems[0].slug,
    seed: 0,
    answer: "independent",
    hint: false,
    seconds: 90,
  }).data;
  assert.equal(s.attempts.length, 1);
  assert.equal(topicStats(s.attempts, "arrays").score, 0);
});

test("review reminders take priority over the next sequential lesson", () => {
  let s = initialStudio();
  for (let seed = 0; seed < 3; seed++)
    s = applyAction(s, {
      action: "attempt",
      topic: "arrays",
      kind: "drill",
      seed,
      answer: questionFor("arrays", seed).answer,
      hint: false,
      seconds: 25,
    }).data;
  s.attempts = s.attempts.map((a) => ({
    ...a,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  }));
  assert.equal(recommendation(s).topic.id, "arrays");
});

test("language drafts, bookmarks, and completed focus sessions survive a backup merge", () => {
  let s = initialStudio();
  s = applyAction(s, {
    action: "draft",
    key: "arrays:C",
    code: "int main(void) { return 0; }",
  }).data;
  s = applyAction(s, {
    action: "draft",
    key: "arrays:Java",
    code: "class Main {}",
  }).data;
  s = applyAction(s, { action: "bookmark", id: "news-1" }).data;
  s = applyAction(s, { action: "session", id: "focus-1", minutes: 25 }).data;
  s = applyAction(s, { action: "session", id: "focus-1", minutes: 25 }).data;
  const restored = applyAction(initialStudio(), {
    action: "import",
    data: s,
  }).data;
  assert.equal(restored.drafts?.["arrays:Java"], "class Main {}");
  assert.equal(restored.drafts?.["arrays:C"], "int main(void) { return 0; }");
  assert.deepEqual(restored.bookmarks, ["news-1"]);
  assert.equal(restored.sessions?.length, 1);
});
