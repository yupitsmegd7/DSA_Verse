import { z } from "zod";
import {
  defaults,
  topics,
  questionFor,
  type Studio,
  type Attempt,
} from "./curriculum";
export const languageSchema = z.enum(["C", "Java", "Python"]);
export const settingsSchema = z.object({
  minutes: z.number().int().min(10).max(90),
  language: languageSchema,
  pace: z.enum(["gentle", "balanced", "intensive"]),
  focus: z
    .string()
    .refine((s) => s === "auto" || topics.some((t) => t.id === s)),
  goal: z.string().trim().min(1).max(120),
});
const attemptSchema = z.object({
  id: z.string().max(300),
  topic: z.string(),
  kind: z.enum(["drill", "diagnostic", "external"]),
  seed: z.number().int().nonnegative().max(2147483647),
  correct: z.number().int().min(0).max(1),
  hint: z.number().int().min(0).max(1),
  seconds: z.number().int().min(0).max(14400),
  created_at: z.string().datetime(),
  label: z.string().max(700),
  reflection: z.string().max(3000),
  outcome: z.string().max(50),
});
export const studioSchema = z.object({
  settings: settingsSchema,
  attempts: z.array(attemptSchema).max(10000),
  lessons: z.array(z.string()).max(100),
  drafts: z.record(z.string().max(40000)).optional(),
  bookmarks: z.array(z.string().max(2000)).max(500).optional(),
  sessions: z
    .array(
      z.object({
        id: z.string(),
        minutes: z.number().int().min(1).max(180),
        at: z.string().datetime(),
      }),
    )
    .max(3000)
    .optional(),
});
export const initialStudio = (): Studio => ({
  settings: { ...defaults },
  attempts: [],
  lessons: [],
  drafts: {},
  bookmarks: [],
  sessions: [],
});
export function applyAction(
  previous: Studio,
  p: any,
): {
  data: Studio;
  result?: { correct: boolean; answer: string; explanation: string };
} {
  const data: Studio = { ...previous };
  if (p.action === "settings") data.settings = settingsSchema.parse(p.settings);
  else if (p.action === "lesson") {
    const t = topics.find((t) => t.id === p.topic);
    if (!t) throw new Error("Unknown lesson.");
    data.lessons = [...new Set([...data.lessons, t.id])];
  } else if (p.action === "attempt") {
    const a = z
      .object({
        topic: z.string(),
        kind: z.enum(["drill", "diagnostic", "external"]),
        seed: z.number().int().min(0).max(2147483647),
        answer: z.string().max(500),
        hint: z.boolean(),
        seconds: z.number().int().min(0).max(14400),
        reflection: z.string().max(3000).default(""),
        slug: z.string().optional(),
      })
      .parse(p);
    const t = topics.find((t) => t.id === a.topic);
    if (!t) throw new Error("Unknown topic.");
    const q = questionFor(a.topic, a.seed);
    const external = a.kind === "external";
    const problem = external
      ? t.problems.find((q) => q.slug === a.slug)
      : undefined;
    if (
      external &&
      (!problem || !["independent", "hinted", "stuck"].includes(a.answer))
    )
      throw new Error("Choose a valid problem result.");
    if (!external && !q.options.includes(a.answer))
      throw new Error("Choose an answer first.");
    const id = `${a.kind}:${a.topic}:${a.slug || ""}:${a.seed}`;
    const existing = data.attempts.find((a) => a.id === id);
    const record: Attempt = existing || {
      id,
      topic: a.topic,
      kind: a.kind,
      seed: a.seed,
      correct: external ? +(a.answer !== "stuck") : +(a.answer === q.answer),
      hint: external ? +(a.answer === "hinted") : +a.hint,
      seconds: a.seconds,
      created_at: new Date().toISOString(),
      label: problem?.title || q.prompt,
      reflection: a.reflection,
      outcome: external
        ? a.answer
        : a.answer === q.answer
          ? "correct"
          : "review",
    };
    if (!existing) data.attempts = [record, ...data.attempts].slice(0, 10000);
    return {
      data,
      result: {
        correct: !!record.correct,
        answer: q.answer,
        explanation: q.explanation,
      },
    };
  } else if (p.action === "reflection") {
    const text = z.string().max(3000).parse(p.reflection);
    data.attempts = data.attempts.map((a) =>
      a.id === p.id ? { ...a, reflection: text } : a,
    );
  } else if (p.action === "draft") {
    const key = z.string().max(100).parse(p.key),
      code = z.string().max(40000).parse(p.code);
    data.drafts = { ...data.drafts, [key]: code };
  } else if (p.action === "bookmark") {
    const id = z.string().max(2000).parse(p.id);
    const old = data.bookmarks || [];
    data.bookmarks = old.includes(id)
      ? old.filter((v) => v !== id)
      : [...old, id].slice(-500);
  } else if (p.action === "session") {
    const session = z
      .object({
        id: z.string().max(100),
        minutes: z.number().int().min(1).max(180),
      })
      .parse(p);
    const old = data.sessions || [];
    data.sessions = old.some((s) => s.id === session.id)
      ? old
      : [{ ...session, at: new Date().toISOString() }, ...old].slice(0, 3000);
  } else if (p.action === "import") {
    const imported = studioSchema.parse(p.data);
    const map = new Map(data.attempts.map((a) => [a.id, a]));
    imported.attempts.forEach((a) => map.set(a.id, a));
    data.attempts = [...map.values()]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10000);
    data.lessons = [...new Set([...data.lessons, ...imported.lessons])];
    data.drafts = { ...data.drafts, ...imported.drafts };
    data.bookmarks = [
      ...new Set([...(data.bookmarks || []), ...(imported.bookmarks || [])]),
    ].slice(0, 500);
    const sessions = new Map((data.sessions || []).map((s) => [s.id, s]));
    imported.sessions?.forEach((s) => sessions.set(s.id, s));
    data.sessions = [...sessions.values()].slice(0, 3000);
  } else throw new Error("Unknown action.");
  return { data };
}
