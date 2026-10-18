"use client";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Lightbulb,
  Play,
  Search,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { FunctionLab } from "./library";
import { algorithms, exercises, exerciseStatus } from "@/lib/library/catalog";
import {
  describeAnswerDifference,
  explainExperiment,
  experimentCases,
  parseExperimentInput,
  type Experiment,
} from "@/lib/library/experiments";
import type { Algorithm } from "@/lib/library/algorithms";
import type { Studio, Settings } from "@/lib/curriculum";
type Save = (payload: Record<string, unknown>) => Promise<any>;

export function FunctionAcademy({
  data,
  save,
  initialAlgorithm,
  onPractice,
}: {
  data: Studio;
  save: Save;
  initialAlgorithm?: string;
  onPractice: (id: string) => void;
}) {
  const [tab, setTab] = useState("explore"),
    [id, setId] = useState(initialAlgorithm || algorithms[0].id),
    [query, setQuery] = useState("");
  const algorithm = algorithms.find((a) => a.id === id) || algorithms[0];
  const choices = useMemo(
    () =>
      algorithms.filter((a) =>
        `${a.title} ${a.topic}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <div className="function-academy">
      <div
        className="academy-tabs"
        role="tablist"
        aria-label="Function learning modes"
      >
        {[
          ["explore", "50 function experiments", FlaskConical],
          ["trace", "10 execution traces", Play],
          ["foundations", "How functions work", BookOpen],
        ].map(([key, label, Icon]) => {
          const I = Icon as typeof Play;
          return (
            <button
              key={key as string}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key as string)}
            >
              <I size={16} />
              {label as string}
            </button>
          );
        })}
      </div>
      {tab === "trace" ? (
        <FunctionLab data={data} save={save} />
      ) : tab === "foundations" ? (
        <FunctionFoundations initialLanguage={data.settings.language} />
      ) : (
        <>
          <div className="academy-intro">
            <div>
              <p className="library-overline">THE EXPERIMENTAL ATELIER</p>
              <h2>
                Learn a function
                <br />
                <em>by asking it better questions.</em>
              </h2>
              <p>
                Start with a contract. Predict what changes. Test your idea
                against examples and edge cases.
              </p>
            </div>
            <div className="academy-stamp">
              <strong>50</strong>
              <span>FUNCTION FAMILIES</span>
              <small>1,000 connected exercises</small>
            </div>
          </div>
          <div className="academy-layout">
            <aside className="academy-index">
              <label className="catalog-search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Find a function family"
                  placeholder="Find a function…"
                />
              </label>
              <p>{choices.length} families · 25 topics</p>
              <div className="academy-function-list">
                {choices.map((a) => (
                  <button
                    key={a.id}
                    aria-pressed={id === a.id}
                    onClick={() => setId(a.id)}
                  >
                    <small>{a.topic}</small>
                    <strong>{a.title}</strong>
                    <ArrowRight size={14} />
                  </button>
                ))}
                {!choices.length && (
                  <p>No function matches. Try “tree”, “window”, or “graph”.</p>
                )}
              </div>
            </aside>
            <FunctionExperiment
              key={algorithm.id}
              algorithm={algorithm}
              data={data}
              save={save}
              onPractice={() => onPractice(algorithm.id)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function FunctionExperiment({
  algorithm: a,
  data,
  save,
  onPractice,
}: {
  algorithm: Algorithm;
  data: Studio;
  save: Save;
  onPractice: () => void;
}) {
  const saved = data.drafts?.[`experiment:${a.id}`];
  const initial = useMemo(() => {
    try {
      const parsed = JSON.parse(saved || "{}");
      return {
        values:
          typeof parsed.values === "string" ? parsed.values : "[2, -1, 2, 4]",
        k: typeof parsed.k === "string" ? parsed.k : "2",
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
      };
    } catch {
      return { values: "[2, -1, 2, 4]", k: "2", notes: "" };
    }
  }, [saved]);
  const [raw, setRaw] = useState(initial.values),
    [parameter, setParameter] = useState(initial.k),
    [prediction, setPrediction] = useState(""),
    [result, setResult] = useState<Experiment | null>(null),
    [error, setError] = useState(""),
    [notes, setNotes] = useState(initial.notes),
    [saving, setSaving] = useState(false);
  const completed = exercises.filter(
    (q) => q.algorithm.id === a.id && exerciseStatus(data, q.id) === "solved",
  ).length;
  const cases = useMemo(
    () => (result ? experimentCases(a, result.input) : []),
    [a, result],
  );
  function reset() {
    setResult(null);
    setError("");
  }
  function run() {
    try {
      const input = parseExperimentInput(raw, parameter);
      setResult(explainExperiment(a, input));
      setError("");
    } catch (e) {
      setResult(null);
      setError(
        e instanceof Error ? e.message : "Unable to evaluate this input.",
      );
    }
  }
  async function keep() {
    setSaving(true);
    try {
      await save({
        action: "draft",
        key: `experiment:${a.id}`,
        code: JSON.stringify({ values: raw, k: parameter, notes }),
      });
      toast.success("Experiment saved in your workspace.");
    } catch {
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="academy-experiment">
      <div className="academy-contract">
        <div>
          <span className="topic-chip">{a.topic}</span>
          <span>{completed}/20 independent exercises</span>
        </div>
        <h3>{a.title}</h3>
        <p>{a.contract}</p>
        <small>
          <code>values</code> is an integer array. <code>k</code> is a positive
          parameter; functions that don't use it simply ignore it.
        </small>
      </div>
      <form
        className="experiment-form"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <div className="experiment-inputs">
          <label>
            values · JSON array
            <input
              aria-label="Experiment values"
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                reset();
              }}
              maxLength={150}
            />
          </label>
          <label>
            k
            <input
              aria-label="Experiment k"
              type="number"
              min={1}
              max={10}
              value={parameter}
              onChange={(e) => {
                setParameter(e.target.value);
                reset();
              }}
            />
          </label>
        </div>
        <p>
          Up to 9 integers, each −20…20. Keeping inputs small makes every step
          inspectable.
        </p>
        <div className="experiment-presets">
          {[
            ["Empty", "[]"],
            ["Singleton", "[4]"],
            ["Duplicates", "[2,2,2,2]"],
            ["Negative", "[-3,-1,-3,-2]"],
            ["Mixed", "[2,-1,2,4]"],
          ].map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setRaw(value);
                reset();
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="experiment-prediction">
          Predict the return value · optional
          <input
            aria-label="Experiment prediction"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder="A number or JSON array"
            maxLength={2000}
          />
        </label>
        <div className="experiment-actions">
          <button className="btn primary" type="submit">
            <Play size={16} /> Run the experiment
          </button>
          <button className="btn" type="button" onClick={onPractice}>
            Practice this function <ArrowRight size={16} />
          </button>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
      {result && (
        <div className="experiment-results">
          <div className="experiment-return" role="status">
            <span>RETURNED VALUE</span>
            <pre>{JSON.stringify(result.output)}</pre>
            {prediction.trim() && (
              <p>{describeAnswerDifference(prediction, result.output)}</p>
            )}
          </div>
          <div className="experiment-walkthrough">
            <h4>
              <Lightbulb size={18} /> Understand this call
            </h4>
            {result.observations.map((o, i) => (
              <div key={o.title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <section>
                  <h5>{o.title}</h5>
                  <p>{o.detail}</p>
                </section>
              </div>
            ))}
          </div>
          <div className="experiment-cases">
            <h4>Test the boundaries</h4>
            <p>
              These are reference results for the authored function. Use them to
              check your own implementation in your compiler.
            </p>
            <div className="question-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>values / k</th>
                    <th>Return</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.name}>
                      <td>{c.name}</td>
                      <td>
                        <code>
                          {JSON.stringify(c.input.values)}, k={c.input.k}
                        </code>
                      </td>
                      <td>
                        <code>{JSON.stringify(c.output)}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <div className="lab-insights">
        <div>
          <Target size={19} />
          <h4>Target implementation</h4>
          <p>{a.complexity}</p>
          <p>{a.idea}</p>
        </div>
        <div>
          <Lightbulb size={19} />
          <h4>A useful mistake to avoid</h4>
          <p>{a.pitfall}</p>
          <p>
            The playground's small reference evaluator may use a simpler
            approach than this target algorithm.
          </p>
        </div>
      </div>
      <div className="notes-panel experiment-notes">
        <label htmlFor="experiment-notes">
          What did this experiment teach you?
        </label>
        <textarea
          id="experiment-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={15000}
          placeholder="I expected… I observed… The invariant explains it because…"
        />
        <button className="btn" onClick={() => void keep()} disabled={saving}>
          {saving ? "Saving…" : "Save experiment & notes"}
        </button>
      </div>
      <p className="experiment-disclosure">
        Experiments run locally using authored evaluators. They don't compile
        arbitrary C, Java, or Python, and don't change mastery. Graded practice
        measures transfer to a fresh question.
      </p>
    </section>
  );
}

const concepts = [
  {
    title: "A contract before a loop",
    text: "A function accepts arguments, performs one specified job, and returns a result. Write down allowed inputs and promised outputs before choosing a data structure. Preconditions describe valid input; postconditions describe what the returned result means.",
  },
  {
    title: "Parameters are names; arguments are values",
    text: "In countAbove(values, k), values and k are parameter names. In countAbove([2,5,8], 4), the list and 4 are arguments. A new call gets a new local count. Changing a local integer does not rewrite the caller's integer.",
  },
  {
    title: "Returning is different from printing",
    text: "return hands a value back to the caller and ends the current call. Printing only displays something. Another function can use a returned integer in a calculation; console output does not automatically become that integer.",
  },
  {
    title: "Arrays, references, and side effects",
    text: "C passes an array parameter as a pointer, so the caller supplies its length separately. Java passes a copy of the array reference; Python binds the parameter to the same list object. In all three, changing an element can affect the caller's array/list. Our contracts preserve inputs; copy before sorting if the original order must survive.",
  },
  {
    title: "The invariant connects the steps",
    text: "An invariant is a statement that stays true at a chosen point in every iteration. For countAbove, count equals the number of qualifying values already visited. Show that it holds at initialization, survives one step, and gives the promised answer when the loop ends.",
  },
  {
    title: "Base cases make recursion finish",
    text: "A recursive function needs a terminating case and a smaller subproblem. Each unfinished call keeps its own local variables on the call stack. Expand calls first, then follow their return values in reverse order. The recursion trace makes that stack visible.",
  },
];
function FunctionFoundations({
  initialLanguage,
}: {
  initialLanguage: Settings["language"];
}) {
  const [language, setLanguage] = useState(initialLanguage),
    [active, setActive] = useState(0),
    [answer, setAnswer] = useState<string | null>(null);
  const code = {
    C: "int countAbove(const int values[], int n, int k) {\n    int count = 0;\n    for (int i = 0; i < n; i++) {\n        if (values[i] > k) count++;\n    }\n    return count;\n}\n// int a[] = {2, 5, 8};\n// int result = countAbove(a, 3, 4); // 2",
    Java: "static int countAbove(int[] values, int k) {\n    int count = 0;\n    for (int value : values) {\n        if (value > k) count++;\n    }\n    return count;\n}\n// Place this method in your class.\n// int result = countAbove(new int[]{2, 5, 8}, 4); // 2",
    Python:
      "def countAbove(values, k):\n    count = 0\n    for value in values:\n        if value > k:\n            count += 1\n    return count\n\nresult = countAbove([2, 5, 8], 4)  # 2",
  };
  return (
    <div className="function-foundations">
      <div className="academy-intro">
        <div>
          <p className="library-overline">BEFORE THE ALGORITHM</p>
          <h2>
            A function is
            <br />
            <em>a promise you can test.</em>
          </h2>
          <p>
            Read the six ideas in order, then use the experiments to test what
            you understand.
          </p>
        </div>
      </div>
      <div className="foundations-grid">
        <nav aria-label="Function concepts">
          {concepts.map((c, i) => (
            <button
              key={c.title}
              aria-current={i === active ? "step" : undefined}
              onClick={() => setActive(i)}
            >
              <span>0{i + 1}</span>
              {c.title}
            </button>
          ))}
        </nav>
        <article>
          <span className="library-overline">IDEA {active + 1} OF 6</span>
          <h3>{concepts[active].title}</h3>
          <p>{concepts[active].text}</p>
          <div className="function-flow" aria-label="Function call flow">
            <div>
              <small>ARGUMENTS</small>
              <code>[2, 5, 8], k=4</code>
            </div>
            <ArrowRight />
            <div>
              <small>FUNCTION</small>
              <code>countAbove</code>
            </div>
            <ArrowRight />
            <div>
              <small>RETURN</small>
              <strong>2</strong>
            </div>
          </div>
          <div className="lab-source">
            <div>
              <h3>The same promise in {language}</h3>
              <select
                aria-label="Function lesson language"
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
            <pre>{code[language]}</pre>
          </div>
          <div className="foundation-check">
            <h4>Check your understanding</h4>
            <p>
              When k changes from 4 to 5 for [2,5,8], what does countAbove
              return?
            </p>
            <div>
              {["1", "2", "3"].map((v) => (
                <button
                  key={v}
                  className="btn"
                  aria-pressed={answer === v}
                  onClick={() => setAnswer(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            {answer && (
              <p role="status">
                {answer === "1"
                  ? "Yes. Only 8 is strictly greater than 5. The parameter changes the predicate, not the original array."
                  : "Use a strict comparison: 5 > 5 is false. Only 8 qualifies, so the returned count is 1."}
              </p>
            )}
          </div>
          <div className="experiment-actions">
            <button
              className="btn"
              disabled={active === 0}
              onClick={() => setActive(active - 1)}
            >
              Previous idea
            </button>
            <button
              className="btn primary"
              disabled={active === concepts.length - 1}
              onClick={() => setActive(active + 1)}
            >
              Next idea <ArrowRight size={16} />
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
