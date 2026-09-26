"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCheck,
  Clock,
  Cloud,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Flag,
  Globe2,
  Lightbulb,
  Link2,
  MapPin,
  Minus,
  Network,
  Palette,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Timer,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  topics,
  topicStats,
  recommendation,
  type Topic,
  type Studio,
  type Settings,
} from "@/lib/curriculum";
import {
  cloud,
  cloudConfigured,
  chooseDevice,
  downloadText,
  type StorageMode,
} from "@/lib/storage";
import { studioSchema } from "@/lib/state";
import type { NewsFeed, NewsItem } from "@/lib/news";
type Save = (p: Record<string, unknown>) => Promise<any>;
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export const themes = [
  {
    id: "atelier",
    name: "Sunlit atelier",
    detail: "Canvas, cobalt & warm ochre",
    colours: ["#f8f6f0", "#283e75", "#c99861"],
  },
  {
    id: "midnight",
    name: "Midnight ink",
    detail: "Deep indigo & moonlit gold",
    colours: ["#151b2b", "#a6b8ff", "#d5ab66"],
  },
  {
    id: "botanical",
    name: "Botanical study",
    detail: "Forest green & handmade paper",
    colours: ["#edf1e6", "#315947", "#bb8861"],
  },
  {
    id: "gallery",
    name: "Modern gallery",
    detail: "Crisp white, charcoal & vermilion",
    colours: ["#f7f7f7", "#242424", "#cf573d"],
  },
];
export function ThemeChoices() {
  const [theme, setTheme] = useState("atelier");
  useEffect(() => {
    setTheme(localStorage.getItem("dsa-theme") || "atelier");
  }, []);
  function apply(id: string) {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    localStorage.setItem("dsa-theme", id);
  }
  return (
    <div className="theme-grid">
      {themes.map((t) => (
        <button
          key={t.id}
          className={`theme-card ${theme === t.id ? "selected" : ""}`}
          aria-pressed={theme === t.id}
          onClick={() => apply(t.id)}
        >
          <span className="theme-swatches">
            {t.colours.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
            {theme === t.id && <Check size={16} />}
          </span>
          <b>{t.name}</b>
          <small>{t.detail}</small>
        </button>
      ))}
    </div>
  );
}
export function Appearance() {
  return (
    <>
      <DialogHeader>
        <p className="eyebrow">A DIFFERENT LIGHT</p>
        <DialogTitle>Choose your canvas</DialogTitle>
        <DialogDescription>
          Four palettes for the way you like to think. Your choice stays on this
          device.
        </DialogDescription>
      </DialogHeader>
      <ThemeChoices />
    </>
  );
}
const positions = [
  [115, 83],
  [355, 65],
  [610, 85],
  [845, 107],
  [188, 235],
  [452, 224],
  [720, 258],
  [897, 362],
  [88, 407],
  [345, 383],
  [599, 408],
  [817, 504],
  [190, 570],
  [433, 560],
  [634, 642],
  [884, 646],
];
const connections: [[number, number], ...Array<[number, number]>] = [
  [0, 1],
  [0, 5],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 6],
  [1, 9],
  [2, 7],
  [2, 12],
  [3, 4],
  [4, 5],
  [5, 10],
  [6, 7],
  [6, 10],
  [7, 8],
  [8, 9],
  [8, 10],
  [8, 14],
  [9, 13],
  [10, 11],
  [10, 12],
  [11, 13],
  [12, 14],
  [13, 14],
  [2, 15],
  [14, 15],
];
export function SkillMap({
  data,
  onOpen,
}: {
  data: Studio;
  onOpen: (t: Topic) => void;
}) {
  const rec = recommendation(data),
    [chosen, setChosen] = useState(rec.topic.id),
    [zoom, setZoom] = useState(1);
  const t = topics.find((t) => t.id === chosen)!,
    s = topicStats(data.attempts, chosen);
  const dependencies = connections
    .filter((e) => e[1] === topics.indexOf(t))
    .map((e) => topics[e[0]]);
  return (
    <>
      <div className="map-toolbar">
        <div className="legend">
          <span>
            <i className="swatch empty-swatch" />
            Unexplored
          </span>
          <span>
            <i className="swatch progress-swatch" />
            Practising
          </span>
          <span>
            <i className="swatch mastered-swatch" />
            Understood
          </span>
          <span>
            <i className="swatch next-swatch" />
            Recommended
          </span>
        </div>
        <div className="zoom-buttons">
          <button
            className="btn small"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.15))}
          >
            <Minus />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            className="btn small"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
          >
            <Plus />
          </button>
        </div>
      </div>
      <div className="skill-map-grid">
        <section className="map-paper">
          <div className="map-overline">
            <Network size={15} /> YOUR KNOWLEDGE, CONNECTED
          </div>
          <div className="map-scroll">
            <svg
              width={`${zoom * 100}%`}
              viewBox="0 0 1000 740"
              className="skill-net"
              aria-label="Interactive DSA prerequisite map"
            >
              <g className="map-edges">
                {connections.map(([a, b]) => {
                  const [x, y] = positions[a],
                    [u, v] = positions[b];
                  return (
                    <path
                      key={`${a}-${b}`}
                      className={
                        topicStats(data.attempts, topics[a].id).score >= 70
                          ? "edge-known"
                          : ""
                      }
                      d={`M${x},${y} Q${(x + u) / 2 + 25},${(y + v) / 2 - 35} ${u},${v}`}
                    />
                  );
                })}
              </g>
              {topics.map((topic, i) => {
                const [x, y] = positions[i],
                  stat = topicStats(data.attempts, topic.id),
                  selected = chosen === topic.id,
                  isNext = topic.id === rec.topic.id;
                const lines = topic.title
                  .replace("Time & space complexity", "Time & space")
                  .replace("Recursion & backtracking", "Recursion")
                  .replace("Tries & bit manipulation", "Tries & bits")
                  .replace("Graphs: BFS & DFS", "Graphs")
                  .replace("Dynamic programming", "Dynamic programming")
                  .split(" & ");
                return (
                  <g
                    key={topic.id}
                    className={`map-node ${stat.score >= 70 ? "mastered" : stat.n ? "in-progress" : ""} ${selected ? "selected" : ""} ${isNext ? "next-node" : ""}`}
                    transform={`translate(${x},${y})`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${topic.title}, ${stat.score}% mastery${isNext ? ", recommended next" : ""}`}
                    onClick={() => setChosen(topic.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setChosen(topic.id);
                      }
                    }}
                  >
                    <circle className="node-halo" r="32" />
                    <circle className="node-core" r="24" />
                    <circle
                      className="node-progress"
                      r="29"
                      strokeDasharray={`${stat.score * 1.822} 182.2`}
                      transform="rotate(-90)"
                    />
                    <text textAnchor="middle" y="5" className="node-number">
                      {stat.score >= 70 ? "✓" : String(i + 1).padStart(2, "0")}
                    </text>
                    <text textAnchor="middle" y="51" className="node-title">
                      {lines[0]}
                    </text>
                    {lines[1] && (
                      <text textAnchor="middle" y="68" className="node-title">
                        & {lines[1]}
                      </text>
                    )}
                    <text
                      textAnchor="middle"
                      y={lines[1] ? 86 : 69}
                      className="node-score"
                    >
                      {stat.n
                        ? `${stat.score}% mastery`
                        : isNext
                          ? "START HERE"
                          : "Explore"}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="map-caption">
            Connections show useful prerequisites. Select a node to explore it;
            no topic is locked.
          </p>
        </section>
        <aside className="paper panel map-detail">
          <span className="badge blue">{t.group}</span>
          <h2>{t.title}</h2>
          <p>{t.summary}</p>
          <div className="skill-bar">
            <div>
              <span>Mastery estimate</span>
              <b>{s.score}%</b>
            </div>
            <Progress value={s.score} />
          </div>
          <div className="map-evidence">
            <span>{s.n} recent graded checks</span>
            <span>{s.n ? s.accuracy + "% accuracy" : "No evidence yet"}</span>
          </div>
          <h3>Connects to</h3>
          <div className="dependency-list">
            {dependencies.length ? (
              dependencies.map((d) => (
                <button key={d.id} onClick={() => setChosen(d.id)}>
                  <Link2 size={13} />
                  {d.title}
                </button>
              ))
            ) : (
              <span>Your foundation. Begin here.</span>
            )}
          </div>
          <div className="complexity-note">
            {chosen === rec.topic.id
              ? rec.reason
              : s.score >= 70
                ? "Keep this connection strong with a spaced review."
                : "Read the idea, trace the code, then check your understanding."}
          </div>
          <button className="btn primary" onClick={() => onOpen(t)}>
            Explore this lesson <ArrowRight />
          </button>
        </aside>
      </div>
    </>
  );
}
export function CodeWorkbench({
  topic,
  data,
  language,
  save,
}: {
  topic: Topic;
  data: Studio;
  language: Settings["language"];
  save: Save;
}) {
  const key = `${topic.id}:${language}`;
  const wrap = (code: string) =>
    language === "Java"
      ? `import java.util.*;\n\npublic class Main {\n${code
          .split("\n")
          .map((l) => "    " + l)
          .join(
            "\n",
          )}\n\n    public static void main(String[] args) {\n        // Add a test case and call the method above.\n    }\n}\n`
      : language === "C"
        ? `#include <stdio.h>\n#include <stdlib.h>\n\n${code}\n\nint main(void) {\n    /* Add a test case and call the function above. */\n    return 0;\n}\n`
        : code + "\n\n# Add a test case here.\n";
  const [code, setCode] = useState(
      data.drafts?.[key] ?? wrap(topic.code[language]),
    ),
    [saved, setSaved] = useState(data.drafts?.[key] ?? ""),
    [saving, setSaving] = useState(false);
  async function persist() {
    setSaving(true);
    try {
      await save({ action: "draft", key, code });
      setSaved(code);
      toast.success("Code draft saved.");
    } catch {
    } finally {
      setSaving(false);
    }
  }
  const ext = language === "Java" ? "java" : language === "C" ? "c" : "py";
  return (
    <section className="workbench">
      <div className="workbench-top">
        <span>
          <Code2 size={15} />{" "}
          {language === "Java" ? "Main.java" : `practice.${ext}`}
        </span>
        <span>{code === saved ? "Saved draft" : "Unsaved changes"}</span>
      </div>
      <textarea
        aria-label={`${language} code draft`}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        maxLength={40000}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const el = e.currentTarget,
              start = el.selectionStart,
              end = el.selectionEnd;
            setCode(code.slice(0, start) + "    " + code.slice(end));
            requestAnimationFrame(() => {
              el.selectionStart = el.selectionEnd = start + 4;
            });
          }
        }}
      />
      <div className="workbench-actions">
        <button
          className="btn small"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              toast.success("Code copied.");
            } catch {
              toast.error(
                "Copy was blocked. Select the code and copy it manually.",
              );
            }
          }}
        >
          <Copy />
          Copy
        </button>
        <button
          className="btn small"
          onClick={() =>
            downloadText(
              language === "Java" ? "Main.java" : `practice.${ext}`,
              code,
            )
          }
        >
          <Download />
          Download
        </button>
        <button
          className="btn small primary"
          disabled={saving || code === saved}
          onClick={persist}
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <a
          className="btn small"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://onecompiler.com/${language.toLowerCase()}`}
        >
          Open compiler <ExternalLink />
        </a>
      </div>
      <p className="method-note">
        This is your saved scratchpad. Copy your code into the linked compiler
        to run it, or submit on LeetCode. Drafts are separate for C, Java, and
        Python.
      </p>
    </section>
  );
}
export function FocusTimer({
  save,
  minutes = 25,
}: {
  save: Save;
  minutes?: number;
}) {
  const [duration, setDuration] = useState(Math.min(25, minutes)),
    [remaining, setRemaining] = useState(Math.min(25, minutes) * 60),
    [running, setRunning] = useState(false),
    [finished, setFinished] = useState(false),
    [recorded, setRecorded] = useState(false),
    [sessionId, setSessionId] = useState(""),
    deadline = useRef(0);
  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => {
      const next = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemaining(next);
      if (!next) {
        setRunning(false);
        setFinished(true);
      }
    }, 250);
    return () => clearInterval(i);
  }, [running]);
  function toggle() {
    if (running) {
      setRunning(false);
    } else {
      if (!sessionId) setSessionId(crypto.randomUUID());
      deadline.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  }
  function reset() {
    setRunning(false);
    setRemaining(duration * 60);
    setFinished(false);
    setRecorded(false);
    setSessionId("");
  }
  return (
    <section className="focus-widget">
      <div className="focus-head">
        <Timer size={16} />
        <span>A little deep work</span>
        <SelectField
          label="Focus duration"
          value={String(duration)}
          onChange={(v) => {
            setDuration(+v);
            setRemaining(+v * 60);
            setRunning(false);
            setFinished(false);
            setRecorded(false);
            setSessionId("");
          }}
          options={["15", "25", "45", "60"]}
        />
      </div>
      <div className="timer-digits" aria-live="off">
        {String(Math.floor(remaining / 60)).padStart(2, "0")}
        <span>:</span>
        {String(remaining % 60).padStart(2, "0")}
      </div>
      <div className="timer-actions">
        <button
          className="btn small primary"
          disabled={finished}
          onClick={toggle}
        >
          {running ? <Pause /> : <Play />}
          {running
            ? "Pause"
            : remaining === duration * 60
              ? "Begin focus"
              : "Continue"}
        </button>
        <button
          className="btn small"
          aria-label="Reset focus timer"
          onClick={reset}
        >
          <RefreshCw />
        </button>
      </div>
      {finished && (
        <button
          className="btn text"
          disabled={recorded}
          onClick={async () => {
            try {
              await save({
                action: "session",
                id: sessionId,
                minutes: duration,
              });
              setRecorded(true);
              toast.success("Focus session recorded.");
            } catch {}
          }}
        >
          {recorded ? "Session recorded ✓" : "Record completed session"}
        </button>
      )}
      <p>One task. One quiet stretch of time.</p>
    </section>
  );
}
export function ReviewQueue({
  data,
  onOpen,
}: {
  data: Studio;
  onOpen: (t: Topic) => void;
}) {
  const now = Date.now();
  const rows = topics
    .map((t) => {
      const s = topicStats(data.attempts, t.id);
      const days = s.score >= 90 ? 7 : 3;
      const due = s.last
        ? new Date(new Date(s.last.created_at).getTime() + days * 86400000)
        : null;
      return { t, s, due };
    })
    .filter((r) => r.s.n);
  return (
    <>
      <section className="assessment-card">
        <div>
          <p className="eyebrow">RETRIEVE, DON'T JUST REREAD</p>
          <h2>Make the ideas stay.</h2>
          <p>
            Weak topics need fresh practice. Strong topics return after 3 or 7
            days.
          </p>
        </div>
        <RefreshCw size={30} />
      </section>
      {!rows.length ? (
        <div className="paper empty">
          <Clock />
          <h2>Your review rhythm starts with a check.</h2>
          <p>
            As you practise, this queue will tell you what to revisit and when.
          </p>
          <button className="btn primary" onClick={() => onOpen(topics[0])}>
            Begin a lesson <ArrowRight />
          </button>
        </div>
      ) : (
        <div className="review-grid">
          {rows
            .sort((a, b) => a.s.score - b.s.score)
            .map(({ t, s, due }) => (
              <div className="paper panel" key={t.id}>
                <span
                  className={`badge ${s.score < 70 ? "ochre" : due && +due < now ? "blue" : "green"}`}
                >
                  {s.score < 70
                    ? "Reinforce now"
                    : due && +due < now
                      ? "Review due"
                      : "On track"}
                </span>
                <h2 style={{ marginTop: 16 }}>{t.title}</h2>
                <Progress value={s.score} />
                <p className="progress-explain">
                  {s.score}% mastery ·{" "}
                  {s.score < 70
                    ? "Practise a fresh variation."
                    : `Next review: ${due!.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                </p>
                <button
                  className="btn"
                  style={{ marginTop: 20 }}
                  onClick={() => onOpen(t)}
                >
                  Review this concept <ArrowRight />
                </button>
              </div>
            ))}
        </div>
      )}
    </>
  );
}
export function Milestones({ data }: { data: Studio }) {
  const a = data.attempts.filter((a) => a.kind !== "external");
  const awards = [
    {
      title: "First brushstroke",
      detail: "Complete your first graded check.",
      done: a.length > 0,
    },
    {
      title: "Finding the pattern",
      detail: "Get 10 checks right without hints.",
      done: a.filter((a) => a.correct && !a.hint).length >= 10,
    },
    {
      title: "Connected thinking",
      detail: "Bring 5 topics to 70% mastery.",
      done: topics.filter((t) => topicStats(a, t.id).score >= 70).length >= 5,
    },
    {
      title: "Learning from the mess",
      detail: "Write 3 practice reflections.",
      done: data.attempts.filter((a) => a.reflection.trim()).length >= 3,
    },
    {
      title: "Quiet concentration",
      detail: "Finish 3 focus sessions.",
      done: (data.sessions?.length || 0) >= 3,
    },
    {
      title: "A canvas of your own",
      detail: "Save a code draft in all 3 languages.",
      done: ["C", "Java", "Python"].every((l) =>
        Object.keys(data.drafts || {}).some((k) => k.endsWith(":" + l)),
      ),
    },
  ];
  return (
    <section className="milestone-section">
      <div className="section-heading">
        <h2>Little milestones</h2>
        <span className="badge ochre">
          {awards.filter((a) => a.done).length} / {awards.length} collected
        </span>
      </div>
      <div className="milestone-grid">
        {awards.map((a) => (
          <div key={a.title} className={`milestone ${a.done ? "earned" : ""}`}>
            <Trophy size={22} />
            <b>{a.title}</b>
            <p>{a.detail}</p>
            <small>{a.done ? "Earned" : "In the making"}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
export function AccountPanel({
  data,
  mode,
  email,
  save,
  onChange,
}: {
  data: Studio;
  mode: StorageMode;
  email?: string;
  save: Save;
  onChange: () => void;
}) {
  const [address, setAddress] = useState(""),
    [password, setPassword] = useState(""),
    [pending, setPending] = useState(false),
    [status, setStatus] = useState("");
  const file = useRef<HTMLInputElement>(null);
  async function auth(signup = false) {
    const c = cloud();
    if (!c) return;
    setPending(true);
    setStatus("");
    try {
      const { error, data } = signup
        ? await c.auth.signUp({ email: address, password })
        : await c.auth.signInWithPassword({ email: address, password });
      if (error) throw error;
      if (signup && !data.session)
        setStatus("Check your email to confirm your account, then sign in.");
      else onChange();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <DialogHeader>
        <p className="eyebrow">YOUR WORK, KEPT WITH CARE</p>
        <DialogTitle>
          {mode === "choose" ? "Choose your workspace" : "Progress & backups"}
        </DialogTitle>
        <DialogDescription>
          {mode === "cloud"
            ? `Signed in as ${email}. Your progress syncs to your account.`
            : mode === "device"
              ? "Your progress is stored in this browser. Export a backup before changing devices or clearing browser data."
              : "Choose device storage to start immediately, or sign in when cloud sync is configured."}
        </DialogDescription>
      </DialogHeader>
      {mode !== "cloud" && (
        <div className="storage-choice">
          <div>
            <Download />
            <h3>This device + backups</h3>
            <p>
              Save lessons, code, and progress in this browser. Move them with
              export/import.
            </p>
          </div>
          <button
            className="btn primary"
            disabled={pending}
            onClick={async () => {
              try {
                await chooseDevice();
                onChange();
              } catch (e) {
                setStatus(String(e));
              }
            }}
          >
            {mode === "device" ? "Continue on this device" : "Use this device"}
            <ArrowRight />
          </button>
        </div>
      )}
      {mode !== "choose" && (
        <div className="backup-actions">
          <button
            className="btn"
            onClick={() =>
              downloadText(
                `DSA-Verse-progress-${new Date().toISOString().slice(0, 10)}.json`,
                JSON.stringify(
                  {
                    app: "DSA-Verse",
                    version: 2,
                    exportedAt: new Date().toISOString(),
                    data,
                  },
                  null,
                  2,
                ),
                "application/json",
              )
            }
          >
            <Download />
            Export progress
          </button>
          <button className="btn" onClick={() => file.current?.click()}>
            <Upload />
            Import & merge backup
          </button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                if (f.size > 20000000)
                  throw new Error("Please choose a backup smaller than 20 MB.");
                const obj = JSON.parse(await f.text());
                const parsed = studioSchema.parse(obj.data || obj);
                await save({ action: "import", data: parsed });
                toast.success("Backup merged. Existing attempts are retained.");
              } catch {
                toast.error(
                  "This backup could not be imported. Your existing progress is unchanged.",
                );
              }
              e.target.value = "";
            }}
          />
        </div>
      )}
      <section className="cloud-box">
        <div className="section-heading">
          <h3>
            <Cloud size={19} /> Account sync
          </h3>
          <span className={`badge ${cloudConfigured ? "green" : "gray"}`}>
            {cloudConfigured ? "Available" : "Setup needed"}
          </span>
        </div>
        {!cloudConfigured ? (
          <p>
            Account sync is not enabled yet. You can start with device storage
            and export a backup whenever you need. Existing progress from
            another version of the atelier is not automatically transferred.
          </p>
        ) : mode === "cloud" ? (
          <>
            <p>
              Progress belongs to your signed-in account. Export a backup before
              importing or switching workspaces.
            </p>
            <button
              className="btn"
              onClick={async () => {
                await cloud()!.auth.signOut();
                onChange();
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <label className="field" htmlFor="cloud-email">
              Email
            </label>
            <input
              id="cloud-email"
              type="email"
              autoComplete="email"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <label className="field" htmlFor="cloud-password">
              Password
            </label>
            <input
              id="cloud-password"
              type="password"
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="dialog-actions">
              <button
                className="btn"
                disabled={pending || !address || password.length < 8}
                onClick={() => auth(true)}
              >
                Create account
              </button>
              <button
                className="btn primary"
                disabled={pending || !address || !password}
                onClick={() => auth(false)}
              >
                {pending ? "Signing in…" : "Sign in"}
              </button>
            </div>
            <p className="method-note">
              Device and account workspaces are separate. Export your device
              progress first, then import it after signing in to merge them.
            </p>
          </>
        )}
      </section>
      {status && (
        <p className="toast-err" role="status">
          {status}
        </p>
      )}
    </>
  );
}
export function HackathonNews({ data, save }: { data: Studio; save: Save }) {
  const [feed, setFeed] = useState<NewsFeed | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [region, setRegion] = useState("All regions"),
    [tag, setTag] = useState("All topics"),
    [kind, setKind] = useState("All sources"),
    [bookmarked, setBookmarked] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/hackathons");
      const d = await r.json();
      if (!r.ok)
        throw new Error(d.error || "News sources are temporarily unavailable.");
      setFeed(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load news.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const items = (feed?.items || []).filter(
    (i) =>
      (region === "All regions" || i.region === region) &&
      (tag === "All topics" || i.tags.includes(tag)) &&
      (kind === "All sources" || i.kind === kind) &&
      (!bookmarked || data.bookmarks?.includes(i.id)) &&
      (i.title + " " + i.source).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <section className="news-intro">
        <div>
          <p className="eyebrow">
            <Globe2 size={14} /> THE WORLD IS BUILDING
          </p>
          <h2>Find your next collaboration.</h2>
          <p>
            Hackathon coverage from news editions around the world and the
            developer community.
          </p>
        </div>
        <div className="news-refresh">
          <button className="btn" disabled={loading} onClick={load}>
            <RefreshCw className={loading ? "spin" : ""} />
            {loading ? "Gathering stories…" : "Refresh news"}
          </button>
          <small>
            {feed
              ? `Fetched ${new Date(feed.fetchedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`
              : "Reading the latest feeds"}
          </small>
        </div>
      </section>
      <div className="news-disclaimer">
        <ShieldCheck size={17} />
        <span>
          News discovery, not a verified registration calendar. Dates shown are
          publication dates; event dates, deadlines, eligibility, and fees must
          be checked with the organiser. Region labels can reflect the news
          edition.
        </span>
      </div>
      <div className="filter-row">
        <input
          aria-label="Search hackathon news"
          placeholder="Search AI, student events, a city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          label="Region filter"
          value={region}
          onChange={setRegion}
          options={[
            "All regions",
            "India",
            "Asia",
            "Europe",
            "North America",
            "South America",
            "Africa",
            "Oceania",
            "Worldwide",
          ]}
        />
        <SelectField
          label="Topic filter"
          value={tag}
          onChange={setTag}
          options={[
            "All topics",
            "AI / ML",
            "Web3",
            "Climate",
            "Health",
            "Students",
            "Software",
          ]}
        />
        <SelectField
          label="Source type"
          value={kind}
          onChange={setKind}
          options={["All sources", "News", "Community"]}
        />
        <button
          className={`btn ${bookmarked ? "primary" : ""}`}
          aria-pressed={bookmarked}
          onClick={() => setBookmarked(!bookmarked)}
        >
          <Bookmark />
          Saved
        </button>
      </div>
      {error && (
        <div className="alert-line" role="alert">
          {error}
          <button onClick={load}>Retry</button>
        </div>
      )}
      {feed?.stale && (
        <div className="alert-line">
          Showing the last successful feed while sources recover.
        </div>
      )}
      <div className="news-count">
        <span>
          {loading && !feed
            ? "Collecting headlines…"
            : `${items.length} stories to explore`}
        </span>
        <span>
          Cached for 15 minutes ·{" "}
          {feed?.sources.filter((s) => s.ok).length || 0}/
          {feed?.sources.length || 6} sources available
        </span>
      </div>
      {loading && !feed ? (
        <div className="news-loading">
          <Globe2 className="spin" />
          <p>Gathering the world’s latest hackathon stories…</p>
        </div>
      ) : (
        <div className="news-grid">
          {items.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              saved={!!data.bookmarks?.includes(item.id)}
              onBookmark={async () => {
                try {
                  await save({ action: "bookmark", id: item.id });
                } catch {}
              }}
            />
          ))}
        </div>
      )}
      {!loading && !items.length && !error && (
        <div className="paper empty">
          <Search />
          <h2>No stories match this palette.</h2>
          <p>Widen the filters or clear saved-only mode.</p>
          <button
            className="btn"
            onClick={() => {
              setSearch("");
              setTag("All topics");
              setRegion("All regions");
              setKind("All sources");
              setBookmarked(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <details className="source-details">
        <summary>Sources & freshness</summary>
        <p>
          Google News: United States, India, United Kingdom, Australia, and
          Singapore editions; DEV Community articles tagged hackathon. Duplicate
          headlines are merged. Topic and format tags are inferred from titles.
          Unsupported details are left unspecified.
        </p>
        {feed?.sources.map((s) => (
          <div key={s.source}>
            <span>{s.source}</span>
            <span>
              {s.ok ? `${s.count} parsed stories` : "Temporarily unavailable"}
            </span>
          </div>
        ))}
        <p>
          The feed cannot cover every event or language. Always follow the
          source before applying.
        </p>
      </details>
      <div className="organiser-links">
        <span>Browse organisers directly:</span>
        <a
          href="https://devpost.com/hackathons"
          target="_blank"
          rel="noreferrer"
        >
          Devpost <ArrowUpRight />
        </a>
        <a href="https://mlh.io" target="_blank" rel="noreferrer">
          Major League Hacking <ArrowUpRight />
        </a>
        <a
          href="https://devfolio.co/hackathons"
          target="_blank"
          rel="noreferrer"
        >
          Devfolio <ArrowUpRight />
        </a>
      </div>
    </>
  );
}
function NewsCard({
  item,
  saved,
  onBookmark,
}: {
  item: NewsItem;
  saved: boolean;
  onBookmark: () => void;
}) {
  return (
    <article className="news-card">
      <div className="news-card-top">
        <span className="badge blue">
          {item.kind === "Community" ? "Community post" : item.tags[0]}
        </span>
        <button
          className={`bookmark-button ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${item.title}`}
          aria-pressed={saved}
          onClick={onBookmark}
        >
          <Bookmark size={17} />
        </button>
      </div>
      <p className="news-source">{item.source}</p>
      <h3>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h3>
      <div className="news-meta">
        <span>
          <MapPin size={13} />
          {item.region}
          {item.regionBasis === "edition" ? " edition" : ""}
        </span>
        {item.mode !== "Unspecified" && (
          <span>
            <Globe2 size={13} />
            {item.mode} (inferred)
          </span>
        )}
      </div>
      <div className="news-card-bottom">
        <time dateTime={item.publishedAt || undefined}>
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Publication date unavailable"}
        </time>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Read ${item.title}`}
        >
          <ArrowUpRight size={20} />
        </a>
      </div>
    </article>
  );
}
export function SearchVisualizer() {
  const [mode, setMode] = useState("Binary search"),
    [target, setTarget] = useState(13),
    [step, setStep] = useState(0);
  const a = [2, 5, 8, 13, 21, 34, 55, 89];
  const frames: {
    active: number;
    left: number;
    right: number;
    message: string;
    found: boolean;
  }[] = [];
  if (mode === "Linear search") {
    for (let i = 0; i < a.length; i++) {
      frames.push({
        active: i,
        left: i,
        right: a.length - 1,
        message:
          a[i] === target
            ? `Found ${target} at index ${i}.`
            : `Compare ${a[i]} with ${target}.`,
        found: a[i] === target,
      });
      if (a[i] === target) break;
    }
  } else {
    let l = 0,
      r = a.length - 1;
    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      frames.push({
        active: m,
        left: l,
        right: r,
        message:
          a[m] === target
            ? `Found ${target} at index ${m}.`
            : a[m] < target
              ? `${a[m]} is too small. Keep the right half.`
              : `${a[m]} is too large. Keep the left half.`,
        found: a[m] === target,
      });
      if (a[m] === target) break;
      if (a[m] < target) l = m + 1;
      else r = m - 1;
    }
  }
  const f = frames[Math.min(step, frames.length - 1)];
  return (
    <section className="paper visualizer">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MAKE THE INVISIBLE VISIBLE</p>
          <h2>Follow a search, one step at a time.</h2>
        </div>
      </div>
      <div className="filter-row">
        <SelectField
          label="Search algorithm"
          value={mode}
          onChange={(v) => {
            setMode(v);
            setStep(0);
          }}
          options={["Binary search", "Linear search"]}
        />
        <SelectField
          label="Target value"
          value={String(target)}
          onChange={(v) => {
            setTarget(+v);
            setStep(0);
          }}
          options={a.map(String)}
        />
        <span className="badge blue">
          {mode === "Binary search" ? "O(log n)" : "O(n)"}
        </span>
      </div>
      <div className="trace-array">
        {a.map((n, i) => (
          <div
            key={n}
            className={`trace-cell ${i === f.active ? "active" : ""} ${i < f.left || i > f.right ? "discarded" : ""} ${i === f.active && f.found ? "found" : ""}`}
          >
            <b>{n}</b>
            <small>index {i}</small>
          </div>
        ))}
      </div>
      <div className="trace-description" role="status">
        {f.message}
      </div>
      <div className="dialog-actions">
        <span className="method-note">
          Comparison {Math.min(step + 1, frames.length)} of {frames.length}
        </span>
        <div className="timer-actions">
          <button className="btn" onClick={() => setStep(0)}>
            <RefreshCw />
            Restart
          </button>
          <button
            className="btn primary"
            disabled={step >= frames.length - 1}
            onClick={() => setStep(step + 1)}
          >
            Next step <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}
