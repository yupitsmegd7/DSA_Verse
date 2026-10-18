"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  FlaskConical,
  Layers3,
  Lightbulb,
  Moon,
  Play,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Sun,
  Target,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { describeAnswerDifference } from "@/lib/library/experiments";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  algorithms,
  exercises,
  libraryTopics,
  exerciseStatus,
  libraryRecommendation,
  coachResponse,
  type Exercise,
} from "@/lib/library/catalog";
import { functionCode, functionModels } from "@/lib/library/functions";
import type { Studio, Settings } from "@/lib/curriculum";
type Save = (payload: Record<string, unknown>) => Promise<any>;
const labels = {
  untouched: "Not started",
  review: "Review",
  solved: "Independent",
  practiced: "With guidance",
};
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () =>
      setDark(document.documentElement.dataset.theme === "midnight");
    sync();
    const o = new MutationObserver(sync);
    o.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => o.disconnect();
  }, []);
  function toggle() {
    const current = document.documentElement.dataset.theme || "atelier";
    const next = dark
      ? localStorage.getItem("dsa-light-theme") || "atelier"
      : "midnight";
    if (!dark) localStorage.setItem("dsa-light-theme", current);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("dsa-theme", next);
  }
  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light atelier" : "Midnight atelier"}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
      <span>{dark ? "Light" : "Dark"}</span>
    </button>
  );
}
export function QuestionLibrary({
  data,
  save,
  onLab,
}: {
  data: Studio;
  save: Save;
  onLab: (algorithmId?: string) => void;
}) {
  const [query, setQuery] = useState(""),
    [topic, setTopic] = useState("all"),
    [difficulty, setDifficulty] = useState("all"),
    [status, setStatus] = useState("all"),
    [tab, setTab] = useState("all"),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState<Exercise | null>(null);
  useEffect(() => {
    const id = location.hash.split("/")[1];
    if (id) setSelected(exercises.find((q) => q.id === id) || null);
  }, []);
  const statuses = useMemo(
    () => new Map(exercises.map((q) => [q.id, exerciseStatus(data, q.id)])),
    [data.attempts],
  );
  const recommended = useMemo(() => libraryRecommendation(data), [data]);
  const completed = [...statuses.values()].filter((s) => s === "solved").length;
  const graded = data.attempts.filter((a) => a.kind === "library"),
    accuracy = graded.length
      ? Math.round(
          (100 * graded.filter((a) => a.correct && !a.hint).length) /
            graded.length,
        )
      : null;
  const filtered = useMemo(
    () =>
      exercises.filter(
        (q) =>
          (topic === "all" || q.algorithm.topic === topic) &&
          (difficulty === "all" || q.difficulty === difficulty) &&
          (status === "all" || statuses.get(q.id) === status) &&
          (tab !== "saved" || (data.bookmarks || []).includes(q.id)) &&
          `${q.id} ${q.title} ${q.algorithm.topic} ${q.algorithm.contract}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [topic, difficulty, status, tab, query, statuses, data.bookmarks],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 20)),
    safePage = Math.min(page, pages - 1);
  function open(q: Exercise) {
    setSelected(q);
    history.replaceState(null, "", `#library/${q.id}`);
  }
  function change(fn: () => void) {
    fn();
    setPage(0);
  }
  return (
    <div className="verse-library">
      <section className="library-hero">
        <div className="library-hero-copy">
          <span className="library-overline">
            <span className="live-dot" /> THE ORIGINAL COLLECTION · VOL. 01
          </span>
          <h2>
            A thousand ways
            <br />
            to <em>think deeper.</em>
          </h2>
          <p>
            Small experiments. Clear explanations. A practice that learns where
            you need to grow.
          </p>
          <div className="library-hero-actions">
            <button
              className="btn primary"
              onClick={() => recommended[0] && open(recommended[0])}
              disabled={!recommended.length}
            >
              Continue my practice <ArrowRight size={16} />
            </button>
            <button className="btn" onClick={() => onLab()}>
              <FlaskConical size={16} /> Enter the function lab
            </button>
          </div>
        </div>
        <div className="library-art" aria-hidden="true">
          <span className="art-orbit orbit-one" />
          <span className="art-orbit orbit-two" />
          <span className="art-orbit orbit-three" />
          <div className="art-note">
            <span>THE ART OF UNDERSTANDING</span>
            <strong>ƒ(x)</strong>
            <i>an idea, made visible</i>
          </div>
          <span className="art-caption">STUDY NO. 001 — CONNECTIONS</span>
        </div>
      </section>
      <div className="library-metrics">
        <Metric
          label="Original exercises"
          value="1,000"
          detail="50 families · 20 variations each"
        />
        <Metric
          label="Topic collections"
          value="25"
          detail="Foundations to advanced patterns"
        />
        <Metric
          label="Solved independently"
          value={String(completed)}
          detail={`${Math.round(completed / 10)}% of the collection`}
        />
        <Metric
          label="First-attempt independence"
          value={accuracy === null ? "—" : `${accuracy}%`}
          detail={
            graded.length
              ? `Based on ${graded.length} graded exercises`
              : "Your first exercise starts the story"
          }
        />
      </div>
      <section className="personal-trail">
        <div>
          <span className="library-overline">
            <Compass size={14} /> CHOSEN FOR YOUR NEXT SESSION
          </span>
          <h3>A little direction, a lot of discovery.</h3>
          <p>
            Review first, then new work from your weaker topics. Difficulty
            grows with your results.
          </p>
        </div>
        <div className="trail-items">
          {recommended.slice(0, 3).map((q, i) => (
            <button key={q.id} onClick={() => open(q)}>
              <span className="trail-number">0{i + 1}</span>
              <span>
                <small>
                  {statuses.get(q.id) === "review"
                    ? "REVISIT & TRANSFER"
                    : q.algorithm.topic.toUpperCase()}
                </small>
                <strong>{q.algorithm.title}</strong>
                <em>
                  {q.difficulty} ·{" "}
                  {q.mode === 4 ? "Edge cases" : "Function reasoning"}
                </em>
              </span>
              <ArrowRight size={16} />
            </button>
          ))}
          {!recommended.length && (
            <p>
              Every exercise has been explored. Revisit a collection or
              experiment in the function lab.
            </p>
          )}
        </div>
      </section>
      <div className="catalog-heading">
        <div>
          <p className="library-overline">YOUR QUESTION ATLAS</p>
          <h2>The practice collection</h2>
        </div>
        <div
          className="catalog-tabs"
          role="tablist"
          aria-label="Collection views"
        >
          {[
            ["all", "All exercises"],
            ["collections", "By topic"],
            ["saved", "Bookmarks"],
          ].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? "active" : ""}
              onClick={() => change(() => setTab(id))}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {tab === "collections" ? (
        <div className="topic-collections">
          {libraryTopics.map((name, i) => {
            const qs = exercises.filter((q) => q.algorithm.topic === name),
              n = qs.filter((q) => statuses.get(q.id) === "solved").length;
            return (
              <button
                key={name}
                onClick={() =>
                  change(() => {
                    setTopic(name);
                    setTab("all");
                  })
                }
              >
                <span className="collection-index">
                  {String(i + 1).padStart(2, "0")} <Layers3 size={18} />
                </span>
                <h3>{name}</h3>
                <p>40 exercises · 2 algorithm families</p>
                <div className="collection-meter">
                  <span style={{ width: `${(n / 40) * 100}%` }} />
                </div>
                <small>
                  {n} independently solved <ArrowRight size={14} />
                </small>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="catalog-filters">
            <label className="catalog-search">
              <Search size={18} />
              <input
                aria-label="Search original questions"
                placeholder="Search a concept, function, or question…"
                value={query}
                onChange={(e) => change(() => setQuery(e.target.value))}
              />
            </label>
            <label className="sr-only" htmlFor="library-topic">
              Topic
            </label>
            <select
              id="library-topic"
              value={topic}
              onChange={(e) => change(() => setTopic(e.target.value))}
            >
              <option value="all">All topics</option>
              {libraryTopics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="library-difficulty">
              Difficulty
            </label>
            <select
              id="library-difficulty"
              value={difficulty}
              onChange={(e) => change(() => setDifficulty(e.target.value))}
            >
              <option value="all">All levels</option>
              {["Foundation", "Applied", "Stretch"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="library-status">
              Progress
            </label>
            <select
              id="library-status"
              value={status}
              onChange={(e) => change(() => setStatus(e.target.value))}
            >
              <option value="all">Any progress</option>
              {Object.entries(labels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="catalog-meta">
            <span>
              {filtered.length.toLocaleString()} exercises
              {topic !== "all" ? ` in ${topic}` : " to explore"}
            </span>
            <button
              onClick={() =>
                change(() => {
                  setQuery("");
                  setTopic("all");
                  setDifficulty("all");
                  setStatus("all");
                })
              }
            >
              Reset filters
            </button>
          </div>
          <div className="question-table-wrap">
            <table className="question-table">
              <thead>
                <tr>
                  <th>Progress</th>
                  <th>Exercise / function family</th>
                  <th>Topic</th>
                  <th>Level</th>
                  <th>
                    <span className="sr-only">Bookmark</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(safePage * 20, safePage * 20 + 20).map((q) => (
                  <tr key={q.id}>
                    <td>
                      <span
                        className={`question-status ${statuses.get(q.id)}`}
                        title={labels[statuses.get(q.id)!]}
                      >
                        {statuses.get(q.id) === "solved" ? (
                          <Check size={16} />
                        ) : statuses.get(q.id) === "review" ? (
                          <RotateCcw size={15} />
                        ) : (
                          <span />
                        )}
                        <span className="sr-only">
                          {labels[statuses.get(q.id)!]}
                        </span>
                      </span>
                    </td>
                    <td>
                      <button className="question-open" onClick={() => open(q)}>
                        <small>
                          {q.id.toUpperCase()} ·{" "}
                          {q.mode === 4 ? "BOUNDARY STUDY" : "FUNCTION STUDY"}
                        </small>
                        <strong>{q.algorithm.title}</strong>
                        <span>{q.title.split(" · ")[1]}</span>
                      </button>
                    </td>
                    <td>
                      <span className="topic-chip">{q.algorithm.topic}</span>
                    </td>
                    <td>
                      <span
                        className={`level-chip ${q.difficulty.toLowerCase()}`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-action"
                        aria-label={`${data.bookmarks?.includes(q.id) ? "Remove bookmark for" : "Bookmark"} ${q.id}`}
                        aria-pressed={!!data.bookmarks?.includes(q.id)}
                        onClick={() =>
                          void save({ action: "bookmark", id: q.id }).catch(
                            () => {},
                          )
                        }
                      >
                        <Bookmark
                          size={17}
                          fill={
                            data.bookmarks?.includes(q.id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="library-empty">
                <Search size={28} />
                <h3>No exercises in this frame.</h3>
                <p>
                  {tab === "saved"
                    ? "Bookmark exercises to keep a personal study list."
                    : "Try a broader search or reset the filters."}
                </p>
              </div>
            )}
          </div>
          <div className="catalog-pagination">
            <span>
              {filtered.length
                ? `${safePage * 20 + 1}–${Math.min(filtered.length, (safePage + 1) * 20)} of ${filtered.length}`
                : "0 results"}
            </span>
            <div>
              <button
                className="btn"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span>
                {safePage + 1} / {pages}
              </span>
              <button
                className="btn"
                disabled={safePage >= pages - 1}
                onClick={() => setPage(safePage + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
      <p className="library-footnote">
        Authored for DSA Verse. 50 algorithm families × 20 input, parameter, and
        boundary variations = 1,000 exercises. These are function-reasoning
        assessments, with deterministic answer checks. Familiar DSA concepts can
        overlap other platforms; no LeetCode statements were imported.
      </p>
      <Dialog
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) {
            setSelected(null);
            history.replaceState(null, "", "#library");
          }
        }}
      >
        <DialogContent className="exercise-dialog">
          {selected && (
            <ExerciseRoom
              key={selected.id}
              q={selected}
              data={data}
              save={save}
              onExplore={() => onLab(selected.algorithm.id)}
              onNext={() => {
                const next =
                  exercises.find(
                    (q) =>
                      q.algorithm.id === selected.algorithm.id &&
                      q.id !== selected.id &&
                      exerciseStatus(data, q.id) === "untouched",
                  ) ||
                  recommended.find((q) => q.id !== selected.id) ||
                  exercises[selected.number % 1000];
                open(next);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="library-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
function ExerciseRoom({
  q,
  data,
  save,
  onNext,
  onExplore,
}: {
  q: Exercise;
  data: Studio;
  save: Save;
  onNext: () => void;
  onExplore: () => void;
}) {
  const [answer, setAnswer] = useState(""),
    [hints, setHints] = useState(0),
    [result, setResult] = useState<{ correct: boolean; answer: string } | null>(
      null,
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notes, setNotes] = useState(data.drafts?.[`notes:${q.id}`] || ""),
    [ask, setAsk] = useState(""),
    [response, setResponse] = useState("");
  const start = useRef(Date.now());
  async function submit() {
    setError("");
    setBusy(true);
    try {
      const d = await save({
        action: "library-attempt",
        id: q.id,
        answer,
        hint: hints > 0,
        seconds: Math.min(
          14400,
          Math.floor((Date.now() - start.current) / 1000),
        ),
      });
      setResult(d.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save your answer.");
    } finally {
      setBusy(false);
    }
  }
  const example = { values: [3, 1, 4], k: 2 },
    previous = data.attempts.find((a) => a.id === `library:${q.id}`);
  return (
    <>
      <DialogHeader>
        <span className="library-overline">
          {q.id.toUpperCase()} · {q.algorithm.topic}
        </span>
        <DialogTitle>{q.algorithm.title}</DialogTitle>
        <DialogDescription>
          {q.title.split(" · ")[1]} · {q.difficulty} · Original function study
        </DialogDescription>
      </DialogHeader>
      <div className="exercise-room">
        <div className="exercise-main">
          <div className="contract-paper">
            <h3>
              <BookOpen size={18} /> The function contract
            </h3>
            <p className="preserve-lines">{q.prompt}</p>
            <div className="input-contract">
              <span>INPUT CONTRACT</span>
              <p>
                values: integer array, 0–9 elements, each −20…20. k: positive
                integer, 1…10. Calls are independent. Never mutate the input.
              </p>
            </div>
            <h4>Your {q.calls.length > 1 ? "calls" : "call"}</h4>
            {q.calls.map((c, i) => (
              <pre key={i}>
                <code>
                  {q.algorithm.id.replaceAll("-", "_")}({JSON.stringify(c)})
                </code>
              </pre>
            ))}
            <details
              onToggle={(e) => {
                if (e.currentTarget.open) setHints((h) => Math.max(h, 1));
              }}
            >
              <summary>See a separate worked example</summary>
              <p>
                Input: <code>{JSON.stringify(example)}</code>
              </p>
              <p>
                Return:{" "}
                <code>{JSON.stringify(q.algorithm.solve(example))}</code>
              </p>
              <p>{q.algorithm.idea}</p>
            </details>
          </div>
          <div className="answer-panel">
            <h3>
              <Code2 size={18} /> Predict the return value
            </h3>
            <p>
              Enter JSON: a number, a list, or a list of results. This checks
              your reasoning; it does not compile code.
            </p>
            <label htmlFor="return-answer">Your answer</label>
            <textarea
              id="return-answer"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setResult(null);
              }}
              placeholder={
                q.calls.length > 1
                  ? "[resultOfCall1, resultOfCall2, …]"
                  : "For example: 7 or [1, 2, 3]"
              }
              spellCheck={false}
            />
            <div className="answer-actions">
              <button
                className="btn primary"
                onClick={() => void submit()}
                disabled={busy || !answer.trim()}
              >
                {busy ? "Checking…" : "Check my answer"}
                <ArrowRight size={16} />
              </button>
              <span>
                {previous
                  ? "Practice retry · your first result is preserved"
                  : "Your first answer informs your learning path"}
              </span>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {result && (
              <div
                className={`answer-feedback ${result.correct ? "correct" : "incorrect"}`}
                role="status"
              >
                <strong>
                  {result.correct
                    ? "The contract holds. Nicely traced."
                    : "A useful place to pause."}
                </strong>
                <p>
                  {result.correct
                    ? q.algorithm.invariant
                    : `${describeAnswerDifference(answer, q.answer)} ${q.algorithm.pitfall}`}
                </p>
                {!result.correct && (
                  <details
                    onToggle={(e) => {
                      if (e.currentTarget.open) setHints(3);
                    }}
                  >
                    <summary>Reveal expected result</summary>
                    <code>{result.answer}</code>
                    <p>{q.algorithm.idea}</p>
                  </details>
                )}
                <button className="btn" onClick={onNext}>
                  Try a transfer exercise <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
          <div className="notes-panel">
            <label htmlFor="reasoning-notes">Your reasoning notebook</label>
            <textarea
              id="reasoning-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State the invariant. Trace the values. Write pseudocode or note an edge case…"
              maxLength={15000}
            />
            <button
              className="btn"
              onClick={() =>
                void save({
                  action: "draft",
                  key: `notes:${q.id}`,
                  code: notes,
                })
                  .then(() => toast.success("Reasoning saved."))
                  .catch(() => {})
              }
            >
              Save notebook
            </button>
          </div>
        </div>
        <aside className="exercise-coach">
          <div className="coach-heading">
            <span className="coach-icon">
              <Sparkles size={23} />
            </span>
            <div>
              <small>YOUR STUDY COMPANION</small>
              <h3>The atelier guide</h3>
            </div>
          </div>
          <p>
            A grounded guide to this function. Ask about its contract, approach,
            complexity, or edge cases.
          </p>
          <div className="hint-ladder">
            <h4>One nudge at a time</h4>
            {hints >= 1 && (
              <p>
                <b>01 / Approach</b>
                {q.algorithm.idea}
              </p>
            )}
            {hints >= 2 && (
              <p>
                <b>02 / Invariant</b>
                {q.algorithm.invariant}
              </p>
            )}
            {hints >= 3 && (
              <p>
                <b>03 / Watch for</b>
                {q.algorithm.pitfall}
              </p>
            )}
            <button
              className="btn"
              disabled={hints === 3}
              onClick={() => setHints(hints + 1)}
            >
              <Lightbulb size={16} />
              {hints === 3
                ? "All hints revealed"
                : `Reveal hint ${hints + 1} of 3`}
            </button>
            <small>
              Hints are recorded on your first attempt so mastery stays honest.
            </small>
          </div>
          <div className="coach-prompts">
            {[
              "Explain the parameters",
              "What's the invariant?",
              "Help with edge cases",
              "Explain complexity",
            ].map((t) => (
              <button
                key={t}
                onClick={() => (
                  setHints((h) => Math.max(h, 1)),
                  setResponse(coachResponse(q, t))
                )}
              >
                {t}
                <ArrowRight size={13} />
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (ask.trim()) {
                setHints((h) => Math.max(h, 1));
                setResponse(coachResponse(q, ask));
                setAsk("");
              }
            }}
          >
            <label className="sr-only" htmlFor="coach-question">
              Ask the guide
            </label>
            <input
              id="coach-question"
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="Ask about this function…"
              maxLength={500}
            />
            <button aria-label="Ask the guide" disabled={!ask.trim()}>
              <Send size={16} />
            </button>
          </form>
          {response && (
            <div className="coach-response" role="status">
              {response}
            </div>
          )}
          <small className="coach-disclosure">
            Curriculum-based guidance. Runs locally, without a generative AI
            service.
          </small>
          <button className="btn" onClick={onExplore}>
            <FlaskConical size={16} /> Experiment with this function
          </button>
          <div className="function-concept">
            <Target size={19} />
            <h4>Transfer, then master.</h4>
            <p>
              A correct first answer without hints counts as independent.
              Repeating this question won't inflate your mastery. Use a fresh
              variation to show that the idea stuck.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
export function FunctionLab({ data, save }: { data: Studio; save: Save }) {
  const [id, setId] = useState("sum"),
    [raw, setRaw] = useState("3, 1, 4, 1, 5"),
    [k, setK] = useState("3"),
    [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [language, setLanguage] = useState<Settings["language"]>(
      data.settings.language,
    ),
    [prediction, setPrediction] = useState(""),
    [checked, setChecked] = useState(false);
  const model = functionModels.find((f) => f.id === id)!;
  const trace = useMemo(() => {
    try {
      const values = raw.trim()
        ? raw.split(",").map((s) => (s.trim() === "" ? NaN : Number(s.trim())))
        : [];
      if (
        values.length > 16 ||
        values.some((x) => !Number.isInteger(x) || Math.abs(x) > 100)
      )
        throw new Error(
          "Use up to 16 comma-separated integers between −100 and 100.",
        );
      const param = Number(k);
      if (!Number.isInteger(param) || param < 1 || param > 20)
        throw new Error("Use an integer k between 1 and 20.");
      return { values, frames: model.run({ values, k: param }), error: "" };
    } catch (e) {
      return {
        values: [],
        frames: [],
        error: e instanceof Error ? e.message : "Invalid input.",
      };
    }
  }, [raw, k, model]);
  const safeStep = Math.min(step, Math.max(0, trace.frames.length - 1)),
    frame = trace.frames[safeStep],
    result = trace.frames.at(-1)?.returned;
  useEffect(() => {
    setStep(0);
    setPlaying(false);
    setChecked(false);
  }, [id, raw, k]);
  useEffect(() => {
    if (!playing) return;
    if (step >= trace.frames.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 850);
    return () => clearTimeout(timer);
  }, [playing, step, trace.frames.length]);
  return (
    <div className="function-lab">
      <div className="lab-intro">
        <div>
          <span className="library-overline">
            <FlaskConical size={15} /> THE FUNCTION LABORATORY
          </span>
          <h2>
            See the thought
            <br />
            <em>inside the function.</em>
          </h2>
          <p>
            Change an input. Predict a return. Follow every state change until
            the contract makes sense.
          </p>
        </div>
        <div className="lab-equation">
          <span>input</span>
          <ArrowRight />
          <strong>ƒ</strong>
          <ArrowRight />
          <span>understanding</span>
        </div>
      </div>
      <div className="lab-grid">
        <aside className="lab-models">
          <p className="library-overline">TEN GUIDED EXPERIMENTS</p>
          {functionModels.map((f, i) => (
            <button
              key={f.id}
              className={id === f.id ? "active" : ""}
              onClick={() => {
                setId(f.id);
                setPrediction("");
                if (f.id === "lower") setRaw("1, 3, 5, 5, 8");
              }}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{f.name}()</strong>
                <small>{f.title}</small>
              </div>
              <ChevronRight size={15} />
            </button>
          ))}
          <div className="lab-note">
            <BookOpen size={20} />
            <p>
              These are executable models of the displayed reference functions.
              Your own code drafts remain in the lesson workbench.
            </p>
          </div>
        </aside>
        <div className="lab-workspace">
          <div className="lab-contract">
            <span className="library-overline">FUNCTION CONTRACT</span>
            <h3>{model.name}()</h3>
            <p>{model.contract}</p>
            <small>{model.parameter}</small>
          </div>
          <div className="lab-inputs">
            <label>
              values
              <input
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                aria-label="Function input values"
                placeholder="Empty input is allowed"
              />
            </label>
            <label>
              k
              <input
                type="number"
                min={1}
                max={20}
                value={k}
                onChange={(e) => setK(e.target.value)}
                aria-label="Function parameter k"
              />
            </label>
            <button
              className="btn"
              onClick={() => {
                setRaw("");
                setK("3");
              }}
            >
              Try empty input
            </button>
          </div>
          {trace.error ? (
            <p role="alert" className="form-error">
              {trace.error}
            </p>
          ) : (
            <>
              <div className="lab-predict">
                <label htmlFor="lab-prediction">
                  Before you run: what will it return?
                </label>
                <div>
                  <input
                    id="lab-prediction"
                    value={prediction}
                    onChange={(e) => {
                      setPrediction(e.target.value);
                      setChecked(false);
                    }}
                    placeholder="Your prediction"
                  />
                  <button
                    className="btn"
                    disabled={!prediction.trim()}
                    onClick={() => setChecked(true)}
                  >
                    Check prediction
                  </button>
                </div>
                {checked && (
                  <p role="status">
                    {Number(prediction) === result
                      ? "Correct — now inspect why each step preserves the invariant."
                      : "Not quite. Step through the function and track the changing variables."}{" "}
                    <small>Lab experiments don't affect mastery.</small>
                  </p>
                )}
              </div>
              <div className="lab-trace">
                <div className="trace-top">
                  <span className="library-overline">EXECUTION CANVAS</span>
                  <span>
                    Step {safeStep + 1} / {trace.frames.length}
                  </span>
                </div>
                <div className="trace-values">
                  {trace.values.length ? (
                    trace.values.map((x, i) => (
                      <div
                        key={i}
                        className={frame?.active.includes(i) ? "active" : ""}
                      >
                        <small>{i}</small>
                        <strong>{x}</strong>
                      </div>
                    ))
                  ) : (
                    <span className="empty-array">[ ] · empty sequence</span>
                  )}
                </div>
                <h4 aria-live="polite">{frame?.operation}</h4>
                <div className="trace-variables">
                  {Object.entries(frame?.variables || {}).map(
                    ([name, value]) => (
                      <div key={name}>
                        <small>{name}</small>
                        <strong>{value}</strong>
                      </div>
                    ),
                  )}
                </div>
                {frame?.stack && (
                  <div className="call-stack">
                    <span>CALL STACK</span>
                    {frame.stack.length ? (
                      frame.stack.map((s, i) => <code key={i}>{s}</code>)
                    ) : (
                      <em>Caller resumed</em>
                    )}
                  </div>
                )}
                {frame?.returned !== undefined && (
                  <div className="return-value">
                    RETURN <strong>{frame.returned}</strong>
                    <Check size={19} />
                  </div>
                )}
                <div className="trace-controls">
                  <button
                    className="btn"
                    onClick={() => {
                      setStep(0);
                      setPlaying(false);
                    }}
                    aria-label="Reset trace"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    className="btn"
                    disabled={safeStep === 0 || playing}
                    onClick={() => setStep(safeStep - 1)}
                    aria-label="Previous trace step"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="btn primary"
                    disabled={safeStep === trace.frames.length - 1 && !playing}
                    onClick={() => setPlaying(!playing)}
                  >
                    <Play size={15} />
                    {playing ? "Pause" : "Play trace"}
                  </button>
                  <button
                    className="btn"
                    disabled={safeStep === trace.frames.length - 1 || playing}
                    onClick={() => setStep(safeStep + 1)}
                  >
                    Step <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="lab-source">
            <div>
              <h3>One idea. Three languages.</h3>
              <select
                aria-label="Reference code language"
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as Settings["language"])
                }
              >
                {["C", "Java", "Python"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <pre>
              <code>{functionCode(model, language)}</code>
            </pre>
            <button
              className="btn"
              onClick={() =>
                void navigator.clipboard
                  .writeText(functionCode(model, language))
                  .then(() => toast.success("Reference function copied."))
                  .catch(() =>
                    toast.error(
                      "Clipboard unavailable. Select and copy the code.",
                    ),
                  )
              }
            >
              Copy reference function
            </button>
            <p>
              {language === "C"
                ? "C function: call from main with the array length and parameter."
                : language === "Java"
                  ? "Java method: place inside your Main class."
                  : "Python function: call with a list and parameter."}{" "}
              {id === "fold" ? "Start the helper at i=0." : ""}
            </p>
          </div>
          <div className="lab-insights">
            <div>
              <Lightbulb size={19} />
              <h4>The invariant</h4>
              <p>{model.invariant}</p>
            </div>
            <div>
              <Target size={19} />
              <h4>The cost of this idea</h4>
              <p>{model.complexity}</p>
              <p>
                Count how many values are visited and how much state stays
                alive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
