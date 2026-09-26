"use client";
import { useEffect, useRef, useState } from "react";
import {
  Appearance,
  SkillMap,
  CodeWorkbench,
  FocusTimer,
  ReviewQueue,
  Milestones,
  AccountPanel,
  HackathonNews,
  SearchVisualizer,
} from "./features";
import { loadWorkspace, saveWorkspace, type StorageMode } from "@/lib/storage";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Code2,
  Flame,
  Flower2,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  ListOrdered,
  NotebookPen,
  Network,
  Globe2,
  Cloud,
  Palette,
  Paintbrush,
  Play,
  RefreshCw,
  Route,
  Settings2,
  Sparkles,
  Target,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Toaster, toast } from "sonner";
import {
  topics,
  defaults,
  questionFor,
  recommendation,
  topicStats,
  type Topic,
  type Studio,
  type Settings,
  type Attempt,
} from "@/lib/curriculum";

type View =
  | "studio"
  | "path"
  | "practice"
  | "progress"
  | "journal"
  | "map"
  | "review"
  | "hackathons";
type Modal =
  | { type: "lesson"; topic: Topic; practice?: boolean }
  | { type: "problem"; topic: Topic; slug: string }
  | { type: "workflow" }
  | { type: "diagnostic" }
  | { type: "method" }
  | { type: "appearance" }
  | { type: "account" }
  | null;
type Save = (payload: Record<string, unknown>) => Promise<any>;
const blank: Studio = { settings: defaults, attempts: [], lessons: [] };
const navs: { id: View; label: string; icon: typeof Palette }[] = [
  { id: "studio", label: "My studio", icon: LayoutDashboard },
  { id: "path", label: "Learning path", icon: Route },
  { id: "map", label: "Skill constellation", icon: Network },
  { id: "practice", label: "Practice gallery", icon: Code2 },
  { id: "progress", label: "My progress", icon: ChartNoAxesCombined },
  { id: "journal", label: "Mistake journal", icon: NotebookPen },
  { id: "review", label: "Review queue", icon: RefreshCw },
  { id: "hackathons", label: "Hackathon observatory", icon: Globe2 },
];
function dateKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
function streak(attempts: Attempt[]) {
  const days = new Set(attempts.map((a) => dateKey(new Date(a.created_at))));
  let n = 0,
    d = new Date();
  if (!days.has(dateKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dateKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
function newSeed(n = 0) {
  return Math.floor(Math.random() * 600000000) * 3 + (n % 3);
}
function Picker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function SideNav({
  view,
  onNavigate,
  mistakes,
  onWorkflow,
  onAppearance,
  onAccount,
}: {
  view: View;
  onNavigate: (v: View) => void;
  mistakes: number;
  onWorkflow: () => void;
  onAppearance: () => void;
  onAccount: () => void;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar className="app-sidebar">
      <SidebarHeader className="p-0">
        <a
          className="brand"
          href="#studio"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("studio");
          }}
        >
          <Paintbrush className="brand-mark" />
          <span>
            DSA <em>Verse</em>
            <small>THE ART OF THINKING</small>
          </span>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <p className="nav-caption">YOUR WORKSPACE</p>
        <nav aria-label="Main navigation">
          {navs.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${view === n.id ? "active" : ""}`}
              onClick={() => {
                onNavigate(n.id);
                setOpenMobile(false);
              }}
              aria-current={view === n.id ? "page" : undefined}
            >
              <n.icon size={18} />
              {n.label}
              {n.id === "journal" && mistakes > 0 && (
                <span className="count">{mistakes}</span>
              )}
            </button>
          ))}
        </nav>
        <p className="nav-caption" style={{ marginTop: 33 }}>
          MAKE IT YOURS
        </p>
        <button
          className="nav-item"
          onClick={() => {
            onWorkflow();
            setOpenMobile(false);
          }}
        >
          <Settings2 size={18} />
          My workflow
        </button>
        <button className="nav-item" onClick={onAppearance}>
          <Palette size={18} />
          Change theme
        </button>
        <button className="nav-item" onClick={onAccount}>
          <Cloud size={18} />
          Progress & backups
        </button>
      </SidebarContent>
      <SidebarFooter className="sidebar-bottom">
        <div className="studio-note">
          <Flower2 />
          <p>
            Every expert was once
            <br />a beginner with
            <br />a blank canvas.
          </p>
          <small>KEEP SHOWING UP.</small>
        </div>
        <div className="avatar-row">
          <div className="avatar">G</div>
          <div>
            <b>Gourav’s atelier</b>
            <small>A work in progress, always.</small>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
export default function StudioApp() {
  const [view, setView] = useState<View>("studio"),
    [data, setData] = useState<Studio>(blank),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [modal, setModal] = useState<Modal>(null),
    [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<StorageMode>("choose"),
    [email, setEmail] = useState<string | undefined>();
  const dataRef = useRef(data);
  dataRef.current = data;
  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await loadWorkspace();
      setMode(d.mode);
      setEmail(d.email);
      setData(d.data);
      if (d.mode === "choose") setModal({ type: "account" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load progress.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    const hash = location.hash.slice(1);
    if (navs.some((n) => n.id === hash)) setView(hash as View);
  }, []);
  function navigate(v: View) {
    setView(v);
    history.replaceState(null, "", `#${v}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const save: Save = async (payload) => {
    if (mode === "choose") {
      setModal({ type: "account" });
      throw new Error("Choose a workspace first.");
    }
    setBusy(true);
    try {
      const d = await saveWorkspace(payload, mode);
      setData(d);
      return d;
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Your change could not be saved.",
      );
      throw e;
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const life = new AbortController();
    const register = (t: any) => {
      try {
        Promise.resolve(context.registerTool(t, { signal: life.signal })).catch(
          () => {},
        );
      } catch {}
    };
    register({
      name: "get_learning_plan",
      title: "Read learning plan",
      description:
        "Read the current DSA recommendation and topic mastery estimates.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute(input: unknown) {
        if (!input || typeof input !== "object" || Object.keys(input).length)
          throw new Error("Expected an empty object");
        const s = dataRef.current,
          r = recommendation(s);
        return {
          nextTopic: r.topic.id,
          reason: r.reason,
          topics: topics.map((t) => ({
            id: t.id,
            title: t.title,
            ...topicStats(s.attempts, t.id),
            last: undefined,
          })),
        };
      },
    });
    register({
      name: "open_dsa_lesson",
      title: "Open DSA lesson",
      description:
        "Open a lesson in the visible studio. Does not record completion or change saved progress.",
      inputSchema: {
        type: "object",
        properties: {
          topicId: { type: "string", enum: topics.map((t) => t.id) },
        },
        required: ["topicId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      async execute(input: any) {
        if (!input || Object.keys(input).some((k) => k !== "topicId"))
          throw new Error("Provide topicId only");
        const t = topics.find((t) => t.id === input.topicId);
        if (!t) throw new Error("Unknown topic");
        setModal({ type: "lesson", topic: t });
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
        return { opened: t.id, title: t.title };
      },
    });
    return () => life.abort();
  }, []);
  const rec = recommendation(data),
    mistakes = data.attempts.filter((a) => !a.correct || a.hint),
    graded = data.attempts.filter((a) => a.kind !== "external");
  const average = Math.round(
      topics.reduce((s, t) => s + topicStats(data.attempts, t.id).score, 0) /
        topics.length,
    ),
    mastered = topics.filter(
      (t) => topicStats(data.attempts, t.id).score >= 70,
    ).length,
    solved = new Set(
      data.attempts
        .filter((a) => a.kind === "external" && a.correct)
        .map((a) => a.label),
    ).size;
  const today = data.attempts.filter(
      (a) => dateKey(new Date(a.created_at)) === dateKey(new Date()),
    ),
    lessonDone = data.lessons.includes(rec.topic.id);
  const title = {
    studio: "Your learning studio",
    path: "A path, painted for you",
    practice: "The practice gallery",
    progress: "Watch your thinking grow",
    journal: "Lessons from the messy bits",
    map: "A constellation of understanding",
    review: "Keep the connections alive",
    hackathons: "The hackathon observatory",
  }[view];
  const subtitle = {
    studio: "A fresh canvas. A little progress. All at your own pace.",
    path: "One concept builds on the next. Your results guide the pace.",
    practice: "A thoughtful mix of personal drills and real coding challenges.",
    progress: "Honest signals of understanding, built from your own practice.",
    journal: "Keep the insight. Revisit the problem. Leave the mistake behind.",
    map: "See how every idea connects—and where your next discovery begins.",
    review: "Spaced practice turns familiar ideas into lasting understanding.",
    hackathons:
      "Global stories, new challenges, and a reason to build something together.",
  }[view];
  function openLesson(t: Topic, practice = false) {
    setModal({ type: "lesson", topic: t, practice });
  }
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "225px" } as React.CSSProperties}
    >
      <Toaster position="bottom-right" richColors />
      <SideNav
        view={view}
        onNavigate={navigate}
        mistakes={mistakes.length}
        onWorkflow={() => setModal({ type: "workflow" })}
        onAppearance={() => setModal({ type: "appearance" })}
        onAccount={() => setModal({ type: "account" })}
      />
      <main className="shell-main">
        <header className="topbar">
          <div className="breadcrumb">
            <SidebarTrigger className="mobile-menu" />
            <span>Your workspace</span>
            <ChevronRight size={12} />
            <strong>{navs.find((n) => n.id === view)?.label}</strong>
          </div>
          <div className="top-actions">
            <button
              className="storage-indicator"
              onClick={() => setModal({ type: "account" })}
            >
              <Cloud size={13} />
              {mode === "cloud"
                ? "Cloud synced"
                : mode === "device"
                  ? "Saved on this device"
                  : "Choose storage"}
            </button>
            <span className="date" suppressHydrationWarning>
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              })}
            </span>
            <span className="divider" />
            <span className="streak-label">
              <Flame />
              {streak(data.attempts)} day streak
            </span>
            <span className="round-avatar">G</span>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">A PRACTICE IN PROGRESS</p>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <button
              className="btn"
              onClick={() => setModal({ type: "workflow" })}
            >
              <Settings2 />
              Customize workflow
            </button>
          </div>
          {loading && (
            <p className="loading-banner" role="status">
              Opening your learning canvas…
            </p>
          )}
          {error && (
            <div className="alert-line" role="alert">
              <span>{error}</span>
              <button onClick={load}>Retry</button>
            </div>
          )}
          {view === "studio" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <p className="eyebrow">
                    YOUR NEXT BRUSHSTROKE · {rec.mode.toUpperCase()}
                  </p>
                  <h2>{rec.topic.title}</h2>
                  <p className="description">{rec.topic.summary}</p>
                  <div className="hero-bottom">
                    <button
                      className="btn primary"
                      onClick={() => openLesson(rec.topic)}
                    >
                      <Play size={14} />{" "}
                      {lessonDone
                        ? "Continue learning"
                        : "Begin today’s lesson"}
                      <ArrowRight size={15} />
                    </button>
                    <small>
                      <Clock />
                      {data.settings.minutes} min session
                    </small>
                  </div>
                </div>
                <img
                  className="hero-image"
                  src="/atelier-painting.webp"
                  alt="An oil painting of a sunlit artist’s studio with a cobalt chair, sketches, and an easel"
                />
                <span className="hero-paper-label">
                  small steps, beautiful progress
                </span>
              </section>
              <Stats
                average={average}
                solved={solved}
                streak={streak(data.attempts)}
                mastered={mastered}
              />
              <div className="workspace-grid">
                <div>
                  <div className="section-heading">
                    <h2>Your learning path</h2>
                    <button
                      className="btn text"
                      onClick={() => navigate("path")}
                    >
                      View full path <ArrowRight size={13} />
                    </button>
                  </div>
                  <p className="section-subtitle">
                    A little structure. Room to grow.
                  </p>
                  <PathTable
                    data={data}
                    current={rec.topic.id}
                    onOpen={openLesson}
                    compact
                  />
                  <section className="practice-strip">
                    <div className="section-heading">
                      <h2>Picked for your palette</h2>
                      <button
                        className="btn text"
                        onClick={() => navigate("practice")}
                      >
                        All practice <ArrowRight size={13} />
                      </button>
                    </div>
                    <div className="practice-cards">
                      <div className="problem-card">
                        <div className="problem-meta">
                          <Paintbrush size={13} />
                          VERSE ORIGINAL{" "}
                          <span className="badge green">For you</span>
                        </div>
                        <h3>{rec.topic.title}: a fresh check</h3>
                        <div className="problem-bottom">
                          <span>Tailored inputs · Instant feedback</span>
                          <button
                            className="arrow-button"
                            aria-label="Open personal drill"
                            onClick={() => openLesson(rec.topic, true)}
                          >
                            <ArrowUpRight />
                          </button>
                        </div>
                      </div>
                      <ProblemCard
                        topic={rec.topic}
                        index={
                          topicStats(data.attempts, rec.topic.id).score >= 50 &&
                          rec.topic.problems.some(
                            (p) => p.difficulty === "Medium",
                          )
                            ? 1
                            : 0
                        }
                        onOpen={(slug) =>
                          setModal({ type: "problem", topic: rec.topic, slug })
                        }
                      />
                    </div>
                  </section>
                </div>
                <aside className="right-column">
                  <section className="paper palette">
                    <div className="palette-head">
                      <h2>Today’s palette</h2>
                      <Palette />
                    </div>
                    <p>{data.settings.minutes} minutes, thoughtfully spent.</p>
                    <PaletteItem
                      n={1}
                      title="Understand the idea"
                      subtitle={`${Math.round(data.settings.minutes * 0.3)} min · A lesson & a worked example`}
                      done={lessonDone}
                      current={!lessonDone}
                      onClick={() => openLesson(rec.topic)}
                      label={lessonDone ? "Revisit lesson" : "Start here"}
                    />
                    <PaletteItem
                      n={2}
                      title="Put it into practice"
                      subtitle={`${Math.round(data.settings.minutes * 0.5)} min · A drill chosen for you`}
                      done={today.some(
                        (a) =>
                          a.topic === rec.topic.id && a.kind !== "external",
                      )}
                      onClick={() => openLesson(rec.topic, true)}
                      label="Open practice"
                    />
                    <PaletteItem
                      n={3}
                      title="Reflect & remember"
                      subtitle={`${data.settings.minutes - Math.round(data.settings.minutes * 0.3) - Math.round(data.settings.minutes * 0.5)} min · Capture one takeaway`}
                      done={today.some((a) => a.reflection)}
                      onClick={() => navigate("journal")}
                      label="My journal"
                    />
                  </section>
                  <section className="insight">
                    <div className="eyebrow">
                      <Sparkles />A NOTE FROM YOUR TUTOR
                    </div>
                    <h3>
                      {graded.length
                        ? "Your practice shapes the path."
                        : "Let’s find your starting point."}
                    </h3>
                    <p>
                      {graded.length
                        ? rec.reason
                        : "Already know a little DSA? A 6-question check will help us understand where you are."}
                    </p>
                    <button
                      className="link-button"
                      onClick={() =>
                        setModal({
                          type: graded.length ? "method" : "diagnostic",
                        })
                      }
                    >
                      {graded.length
                        ? "How your path adapts"
                        : "Take the starting-point check"}
                      <ArrowRight />
                    </button>
                  </section>
                  <FocusTimer save={save} minutes={data.settings.minutes} />
                </aside>
              </div>
            </>
          )}
          {view === "map" && <SkillMap data={data} onOpen={openLesson} />}
          {view === "review" && (
            <ReviewQueue data={data} onOpen={(t) => openLesson(t, true)} />
          )}
          {view === "hackathons" && <HackathonNews data={data} save={save} />}
          {view === "path" && (
            <>
              <div className="assessment-card">
                <div>
                  <p className="eyebrow">YOUR COMPASS</p>
                  <h2>{rec.topic.title}</h2>
                  <p>{rec.reason}</p>
                </div>
                <button
                  className="btn primary"
                  onClick={() => openLesson(rec.topic)}
                >
                  Continue my path <ArrowRight />
                </button>
              </div>
              <PathTable
                data={data}
                current={rec.topic.id}
                onOpen={openLesson}
              />
              <p className="progress-explain">
                The sequence is recommended, not locked. Explore any lesson.
                Balanced pace advances at a 70% mastery estimate; change the
                threshold with your workflow.
              </p>
            </>
          )}
          {view === "practice" && (
            <>
              <SearchVisualizer />
              <PracticeGallery
                data={data}
                rec={rec.topic}
                onDrill={(t) => openLesson(t, true)}
                onProblem={(t, slug) =>
                  setModal({ type: "problem", topic: t, slug })
                }
              />
            </>
          )}
          {view === "progress" && (
            <>
              <Stats
                average={average}
                solved={solved}
                streak={streak(data.attempts)}
                mastered={mastered}
              />
              <div className="assessment-card">
                <div>
                  <h2>Know where you stand.</h2>
                  <p>
                    Six short checks across the essentials. Each answer helps
                    your next recommendation.
                  </p>
                </div>
                <button
                  className="btn primary"
                  onClick={() => setModal({ type: "diagnostic" })}
                >
                  <Target />
                  Take an assessment
                </button>
              </div>
              <div className="progress-grid">
                <section className="paper panel">
                  <div className="section-heading">
                    <h2>Your skill palette</h2>
                    <button
                      className="btn text"
                      onClick={() => setModal({ type: "method" })}
                    >
                      How it works
                    </button>
                  </div>
                  {topics.map((t) => {
                    const s = topicStats(data.attempts, t.id);
                    return (
                      <div className="skill-bar" key={t.id}>
                        <div>
                          <span>{t.title}</span>
                          <span>{s.n ? s.score + "%" : "Not assessed"}</span>
                        </div>
                        <Progress
                          value={s.score}
                          aria-label={`${t.title} mastery ${s.score}%`}
                        />
                      </div>
                    );
                  })}
                  <p className="progress-explain">
                    Estimates use graded checks and hint use. External solves
                    are self-reported and do not increase these scores.
                  </p>
                </section>
                <div>
                  <section className="paper panel">
                    <h2>A week of showing up</h2>
                    <Activity attempts={data.attempts} />
                    <div className="section-heading">
                      <span style={{ fontSize: 13, color: "#7c846e" }}>
                        Graded accuracy
                      </span>
                      <b>
                        {graded.length
                          ? Math.round(
                              (graded.filter((a) => a.correct).length /
                                graded.length) *
                                100,
                            ) + "%"
                          : "—"}
                      </b>
                    </div>
                    <div className="section-heading">
                      <span style={{ fontSize: 13, color: "#7c846e" }}>
                        Independent correct checks
                      </span>
                      <b>{graded.filter((a) => a.correct && !a.hint).length}</b>
                    </div>
                    <p className="progress-explain">
                      Based on {graded.length} graded attempts. A fresh check
                      gives stronger evidence than rereading a solution.
                    </p>
                  </section>
                  <section className="paper panel" style={{ marginTop: 22 }}>
                    <h2>Recent brushstrokes</h2>
                    {data.attempts.length ? (
                      data.attempts.slice(0, 6).map((a) => (
                        <div className="history-item" key={a.id}>
                          {a.correct ? <CheckCheck /> : <RefreshCw />}
                          <div>
                            <p>{topics.find((t) => t.id === a.topic)?.title}</p>
                            <small>
                              {a.kind === "external"
                                ? "Self-reported practice"
                                : a.correct
                                  ? "Correct check"
                                  : "Review needed"}{" "}
                              ·{" "}
                              {new Date(a.created_at).toLocaleDateString(
                                "en-GB",
                                { day: "numeric", month: "short" },
                              )}
                              {a.hint ? " · Used a hint" : ""}
                            </small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="progress-explain">
                        Your first check will appear here. Nothing to prove
                        yet—just begin.
                      </p>
                    )}
                  </section>
                </div>
              </div>
            </>
          )}
          {view === "progress" && <Milestones data={data} />}
          {view === "journal" && (
            <>
              {mistakes.length === 0 ? (
                <div className="paper empty">
                  <NotebookPen />
                  <h2>A place to make sense of mistakes.</h2>
                  <p>
                    Checks you miss or solve with hints will appear here, along
                    with your reflections. Your journal grows with your
                    practice.
                  </p>
                  <button
                    className="btn primary"
                    onClick={() => openLesson(rec.topic, true)}
                  >
                    Try a personal drill <ArrowRight />
                  </button>
                </div>
              ) : (
                mistakes.map((a) => (
                  <JournalEntry
                    key={a.id}
                    attempt={a}
                    save={save}
                    busy={busy}
                    onReview={() =>
                      openLesson(
                        topics.find((t) => t.id === a.topic)!,
                        true,
                      )
                    }
                  />
                ))
              )}
            </>
          )}
          <footer className="footer">
            <Flower2 />
            Learning is an art. You’re allowed to take your time.
          </footer>
        </div>
      </main>
      <Dialog
        open={!!modal}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
      >
        <DialogContent className="modal-content">
          {modal?.type === "appearance" && <Appearance />}
          {modal?.type === "account" && (
            <AccountPanel
              data={data}
              mode={mode}
              email={email}
              save={save}
              onChange={() => {
                setModal(null);
                void load();
              }}
            />
          )}
          {modal?.type === "workflow" && (
            <Workflow
              settings={data.settings}
              save={save}
              busy={busy}
              close={() => setModal(null)}
            />
          )}{" "}
          {modal?.type === "lesson" && (
            <Lesson
              key={modal.topic.id}
              topic={modal.topic}
              initialPractice={modal.practice}
              data={data}
              save={save}
              busy={busy}
              onProblem={(slug) =>
                setModal({ type: "problem", topic: modal.topic, slug })
              }
            />
          )}{" "}
          {modal?.type === "problem" && (
            <ExternalProblem
              topic={modal.topic}
              slug={modal.slug}
              save={save}
              busy={busy}
              close={() => setModal(null)}
            />
          )}{" "}
          {modal?.type === "diagnostic" && (
            <Diagnostic
              data={data}
              save={save}
              busy={busy}
              onFinish={() => {
                setModal(null);
                navigate("progress");
              }}
            />
          )}
          {modal?.type === "method" && <Method />}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
function Stats({
  average,
  solved,
  streak,
  mastered,
}: {
  average: number;
  solved: number;
  streak: number;
  mastered: number;
}) {
  return (
    <section className="stats" aria-label="Learning overview">
      <div className="stat">
        <div className="stat-title">
          <Palette />
          Mastery estimate
        </div>
        <div className="stat-value">
          {average}
          <span>/ 100</span>
        </div>
        <p className="stat-caption">Your whole DSA canvas</p>
      </div>
      <div className="stat">
        <div className="stat-title">
          <CheckCheck />
          Problems solved
        </div>
        <div className="stat-value">
          {solved}
          <span>problems</span>
        </div>
        <p className="stat-caption">Self-reported coding solves</p>
      </div>
      <div className="stat">
        <div className="stat-title">
          <Flame />
          Consistency
        </div>
        <div className="stat-value">
          {streak}
          <span>day streak</span>
        </div>
        <p className="stat-caption">A little practice adds up</p>
      </div>
      <div className="stat">
        <div className="stat-title">
          <GraduationCap />
          Topics understood
        </div>
        <div className="stat-value">
          {mastered}
          <span>/ {topics.length}</span>
        </div>
        <p className="stat-caption">At least 70% estimated mastery</p>
      </div>
    </section>
  );
}
function PaletteItem({
  n,
  title,
  subtitle,
  done,
  current,
  onClick,
  label,
}: {
  n: number;
  title: string;
  subtitle: string;
  done?: boolean;
  current?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <div className="palette-item">
      <span className={`circle ${done ? "done" : current ? "current" : ""}`}>
        {done ? <Check size={13} /> : n}
      </span>
      <div>
        <b>{title}</b>
        <p>{subtitle}</p>
        <button className="link-button" onClick={onClick}>
          {label}
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
function PathTable({
  data,
  current,
  onOpen,
  compact = false,
}: {
  data: Studio;
  current: string;
  onOpen: (t: Topic) => void;
  compact?: boolean;
}) {
  const idx = topics.findIndex((t) => t.id === current);
  const shown = compact
    ? topics.slice(Math.max(0, idx - 1), Math.max(0, idx - 1) + 5)
    : topics;
  return (
    <div className="paper">
      <Table className="path-table">
        <TableHeader>
          <TableRow>
            <TableHead>THE SEQUENCE</TableHead>
            <TableHead className="hide-md">PRACTICE</TableHead>
            <TableHead>MASTERY</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead className="hide-sm">
              <span className="sr-only">Open lesson</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.map((t) => {
            const s = topicStats(data.attempts, t.id),
              i = topics.indexOf(t),
              active = t.id === current;
            return (
              <TableRow
                key={t.id}
                className={active ? "recommended" : ""}
                onClick={() => onOpen(t)}
              >
                <TableCell>
                  <div className="topic-name">
                    <span className="step-number">
                      {s.score >= 70 ? (
                        <Check size={13} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <div>
                      <button
                        className="topic-title topic-open"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(t);
                        }}
                      >
                        {t.title}
                      </button>
                      <div className="topic-group">{t.group}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hide-md">
                  <span style={{ fontSize: 11, color: "#8e9583" }}>
                    2 problems + drills
                  </span>
                </TableCell>
                <TableCell>
                  <div className="mastery-cell">
                    <Progress
                      value={s.score}
                      aria-label={`${s.score}% mastery`}
                    />
                    <span>{s.score}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`badge ${s.score >= 70 ? "green" : active ? "blue" : s.n ? "ochre" : "gray"}`}
                  >
                    {s.score >= 70
                      ? "Understood"
                      : active
                        ? "Up next"
                        : s.n
                          ? "Practising"
                          : "To explore"}
                  </span>
                </TableCell>
                <TableCell className="hide-sm">
                  <button
                    className="link-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(t);
                    }}
                    aria-label={`Open ${t.title} lesson`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="table-footer">
        <Sparkles />
        Your next step adapts after every graded check.
      </div>
    </div>
  );
}
function ProblemCard({
  topic,
  index,
  onOpen,
}: {
  topic: Topic;
  index: number;
  onOpen: (slug: string) => void;
}) {
  const p = topic.problems[index];
  return (
    <div className="problem-card">
      <div className="problem-meta">
        <Code2 size={13} />
        LEETCODE
        <span
          className={`badge ${p.difficulty === "Easy" ? "green" : "ochre"}`}
        >
          {p.difficulty}
        </span>
      </div>
      <h3>{p.title}</h3>
      <div className="problem-bottom">
        <span>{topic.title}</span>
        <button
          className="arrow-button"
          aria-label={`Open ${p.title}`}
          onClick={() => onOpen(p.slug)}
        >
          <ArrowUpRight />
        </button>
      </div>
    </div>
  );
}
function PracticeGallery({
  data,
  rec,
  onDrill,
  onProblem,
}: {
  data: Studio;
  rec: Topic;
  onDrill: (t: Topic) => void;
  onProblem: (t: Topic, slug: string) => void;
}) {
  const [filter, setFilter] = useState("all"),
    [difficulty, setDifficulty] = useState("all"),
    [search, setSearch] = useState("");
  const selected = topics.filter((t) => filter === "all" || filter === t.id);
  const problems = selected
    .flatMap((t) => t.problems.map((p, i) => ({ t, p, i })))
    .filter(
      ({ p, t }) =>
        (difficulty === "all" || p.difficulty === difficulty) &&
        (p.title + " " + t.title).toLowerCase().includes(search.toLowerCase()),
    );
  return (
    <>
      <div className="assessment-card">
        <div>
          <p className="eyebrow">CHOSEN FOR YOU</p>
          <h2>{rec.title}: your next personal drill</h2>
          <p>
            Fresh inputs, a helpful nudge if needed, and feedback on your
            reasoning.
          </p>
        </div>
        <button className="btn primary" onClick={() => onDrill(rec)}>
          <Paintbrush />
          Start a drill
        </button>
      </div>
      <div className="filter-row">
        <input
          aria-label="Search practice questions"
          placeholder="Find a problem or concept…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Picker
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All topics" },
            ...topics.map((t) => ({ value: t.id, label: t.title })),
          ]}
        />
        <Picker
          value={difficulty}
          onChange={setDifficulty}
          options={[
            { value: "all", label: "All difficulties" },
            { value: "Easy", label: "Easy" },
            { value: "Medium", label: "Medium" },
          ]}
        />
      </div>
      <p className="section-subtitle" style={{ marginTop: 5 }}>
        {problems.length} coding questions · Open on LeetCode, then record how
        it went.
      </p>
      <div className="gallery-grid">
        {problems.map(({ t, p, i }) => (
          <ProblemCard
            key={p.slug}
            topic={t}
            index={i}
            onOpen={(slug) => onProblem(t, slug)}
          />
        ))}
      </div>
      {!problems.length && (
        <div className="paper empty">
          <h2>No matching questions</h2>
          <p>Try a different topic or a shorter search.</p>
          <button
            className="btn"
            onClick={() => {
              setSearch("");
              setFilter("all");
              setDifficulty("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <div className="section-heading" style={{ marginTop: 32 }}>
        <h2>Practise any concept</h2>
        <span className="badge ochre">VERSE ORIGINALS</span>
      </div>
      <div className="gallery-grid">
        {selected
          .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
          .map((t) => (
            <div className="problem-card" key={t.id}>
              <div className="problem-meta">
                <Paintbrush size={13} />
                PERSONAL DRILL
              </div>
              <h3>{t.title}</h3>
              <div className="problem-bottom">
                <span>
                  {topicStats(data.attempts, t.id).n
                    ? "Keep building your intuition"
                    : "A good place to begin"}
                </span>
                <button
                  className="arrow-button"
                  aria-label={`Practise ${t.title}`}
                  onClick={() => onDrill(t)}
                >
                  <ArrowRight />
                </button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
function Workflow({
  settings,
  save,
  busy,
  close,
}: {
  settings: Settings;
  save: Save;
  busy: boolean;
  close: () => void;
}) {
  const [draft, setDraft] = useState(settings);
  return (
    <>
      <DialogHeader>
        <p className="eyebrow">MAKE ROOM FOR YOUR KIND OF LEARNING</p>
        <DialogTitle>Your personal workflow</DialogTitle>
        <DialogDescription>
          Set a rhythm that fits your day. Your next lesson will follow it.
        </DialogDescription>
      </DialogHeader>
      <label className="field" htmlFor="goal">
        What are you working toward?
      </label>
      <input
        id="goal"
        value={draft.goal}
        maxLength={120}
        onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
      />
      <div className="form-grid">
        <div>
          <label className="field">Daily practice</label>
          <Picker
            value={String(draft.minutes)}
            onChange={(v) => setDraft({ ...draft, minutes: +v })}
            options={[15, 20, 30, 45, 60, 90].map((n) => ({
              value: String(n),
              label: `${n} minutes a day`,
            }))}
          />
        </div>
        <div>
          <label className="field">Teaching language</label>
          <Picker
            value={draft.language}
            onChange={(v) =>
              setDraft({ ...draft, language: v as Settings["language"] })
            }
            options={[
              { value: "C", label: "C" },
              { value: "Java", label: "Java" },
              { value: "Python", label: "Python" },
            ]}
          />
        </div>
      </div>
      <label className="field">Learning pace</label>
      <Picker
        value={draft.pace}
        onChange={(v) => setDraft({ ...draft, pace: v as Settings["pace"] })}
        options={[
          {
            value: "gentle",
            label: "Gentle — more reinforcement · 85% to advance",
          },
          {
            value: "balanced",
            label: "Balanced — steady progress · 70% to advance",
          },
          {
            value: "intensive",
            label: "Intensive — explore sooner · 65% to advance",
          },
        ]}
      />
      <label className="field">Topic focus</label>
      <Picker
        value={draft.focus}
        onChange={(v) => setDraft({ ...draft, focus: v })}
        options={[
          { value: "auto", label: "Let my results guide me" },
          ...topics.map((t) => ({ value: t.id, label: t.title })),
        ]}
      />
      <div className="complexity-note">
        <b>Your {draft.minutes}-minute rhythm</b>
        <br />
        {Math.round(draft.minutes * 0.3)} min learning →{" "}
        {Math.round(draft.minutes * 0.5)} min practice →{" "}
        {draft.minutes -
          Math.round(draft.minutes * 0.3) -
          Math.round(draft.minutes * 0.5)}{" "}
        min reflection
      </div>
      <p className="method-note">
        Due reviews take priority, then your chosen focus, then the next topic
        in the sequence. Your goal is a reminder of why you’re practising.
      </p>
      <div className="dialog-actions">
        <button className="btn" onClick={close}>
          Keep current workflow
        </button>
        <button
          className="btn primary"
          disabled={busy || !draft.goal.trim()}
          onClick={async () => {
            try {
              await save({ action: "settings", settings: draft });
              toast.success("Your learning rhythm is saved.");
              close();
            } catch {}
          }}
        >
          {busy ? "Saving…" : "Save my workflow"}
          <Check size={15} />
        </button>
      </div>
    </>
  );
}
function Lesson({
  topic,
  initialPractice,
  data,
  save,
  busy,
  onProblem,
}: {
  topic: Topic;
  initialPractice?: boolean;
  data: Studio;
  save: Save;
  busy: boolean;
  onProblem: (slug: string) => void;
}) {
  const [tab, setTab] = useState(initialPractice ? "practice" : "learn"),
    [language, setLanguage] = useState<Settings["language"]>(
      data.settings.language,
    ),
    [round, setRound] = useState(0);
  return (
    <>
      <DialogHeader>
        <p className="eyebrow">
          LESSON {String(topics.indexOf(topic) + 1).padStart(2, "0")} ·{" "}
          {topic.group.toUpperCase()}
        </p>
        <DialogTitle>{topic.title}</DialogTitle>
        <DialogDescription>{topic.summary}</DialogDescription>
      </DialogHeader>
      <Tabs value={tab} onValueChange={setTab} className="lesson-tabs">
        <TabsList>
          <TabsTrigger value="learn">
            <BookOpen size={14} />
            The idea
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code2 size={14} />
            Worked code
          </TabsTrigger>
          <TabsTrigger value="practice">
            <Paintbrush size={14} />
            Your turn
          </TabsTrigger>
        </TabsList>
        <TabsContent value="learn">
          <div className="lesson-body">
            <p className="analogy">{topic.analogy}</p>
            <h3>Think it through</h3>
            {topic.steps.map((s, i) => (
              <div className="lesson-step" key={s}>
                <span>{i + 1}</span>
                {s}
              </div>
            ))}
            <div className="complexity-note">
              <b>The cost of the approach</b>
              <br />
              {topic.complexity}
            </div>
            <h3>A mistake worth avoiding</h3>
            <p>{topic.pitfall}</p>
            <div className="dialog-actions">
              <button className="btn" onClick={() => setTab("code")}>
                See the code <Code2 />
              </button>
              <button
                className="btn primary"
                disabled={busy}
                onClick={async () => {
                  try {
                    await save({ action: "lesson", topic: topic.id });
                    setTab("practice");
                  } catch {}
                }}
              >
                {busy ? "Saving…" : "I’ve read it — let’s practise"}
                <ArrowRight />
              </button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="code">
          <div className="lesson-body">
            <div className="section-heading">
              <h3 style={{ margin: 0 }}>Read, trace, then explain.</h3>
              <div style={{ width: 135 }}>
                <Picker
                  value={language}
                  onChange={(v) => setLanguage(v as Settings["language"])}
                  options={[
                    { value: "C", label: "C" },
                    { value: "Java", label: "Java" },
                    { value: "Python", label: "Python" },
                  ]}
                />
              </div>
            </div>
            <CodeWorkbench
              key={`${topic.id}:${language}`}
              topic={topic}
              data={data}
              language={language}
              save={save}
            />
            <h3>Ask yourself</h3>
            <p>
              What changes on each iteration? What stays true? Can you trace a
              one-element input and a boundary case?
            </p>
            <div className="dialog-actions">
              <button
                className="btn"
                onClick={() => onProblem(topic.problems[0].slug)}
              >
                Open coding challenge <ArrowUpRight />
              </button>
              <button
                className="btn primary"
                onClick={() => setTab("practice")}
              >
                Check my understanding <ArrowRight />
              </button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="practice">
          <Quiz
            key={round}
            topic={topic}
            kind="drill"
            attempts={data.attempts}
            save={save}
            busy={busy}
            onNext={() => setRound(round + 1)}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
function Quiz({
  topic,
  kind,
  attempts,
  save,
  busy,
  onNext,
  onAnswered,
  nextLabel = "Try a fresh check",
}: {
  topic: Topic;
  kind: "drill" | "diagnostic";
  attempts: Attempt[];
  save: Save;
  busy: boolean;
  onNext: () => void;
  onAnswered?: (correct: boolean) => void;
  nextLabel?: string;
}) {
  const [seed] = useState(() =>
      newSeed(
        attempts.filter((a) => a.topic === topic.id && a.kind !== "external")
          .length,
      ),
    ),
    [answer, setAnswer] = useState(""),
    [hint, setHint] = useState(false),
    [reflection, setReflection] = useState(""),
    [result, setResult] = useState<{
      correct: boolean;
      answer: string;
      explanation: string;
    } | null>(null),
    [start] = useState(Date.now()),
    [err, setErr] = useState("");
  const q = questionFor(topic.id, seed);
  return (
    <div className="lesson-body">
      <span className="badge ochre">
        {kind === "diagnostic"
          ? "STARTING-POINT CHECK"
          : "VERSE ORIGINAL · FRESH INPUTS"}
      </span>
      <p className="quiz-prompt">{q.prompt}</p>
      {q.display && (
        <div className="array-visual">
          {q.display.map((n, i) => (
            <div key={i} className="array-box">
              {n}
              <small>{i}</small>
            </div>
          ))}
        </div>
      )}
      <div className="quiz-options" role="group" aria-label="Answer choices">
        {q.options.map((o, i) => (
          <button
            key={o}
            disabled={!!result || busy}
            aria-pressed={answer === o}
            className={`${answer === o ? "selected" : ""} ${result && (o === result.answer ? "correct" : o === answer ? "wrong" : "")}`}
            onClick={() => setAnswer(o)}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {o}
          </button>
        ))}
      </div>
      {hint && (
        <div className="hint">
          <b>A little nudge:</b> {q.hint}
        </div>
      )}
      {!result && (
        <>
          <label className="field" htmlFor={`reflection-${seed}`}>
            Your reasoning (optional)
          </label>
          <textarea
            id={`reflection-${seed}`}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            maxLength={3000}
            placeholder="What made you choose this answer?"
            rows={2}
          />
          <div className="dialog-actions">
            <button
              className="btn text"
              onClick={() => setHint(true)}
              disabled={hint}
            >
              <Lightbulb /> {hint ? "Hint revealed" : "Give me a hint"}
            </button>
            <button
              className="btn primary"
              disabled={!answer || busy}
              onClick={async () => {
                setErr("");
                try {
                  const d = await save({
                    action: "attempt",
                    topic: topic.id,
                    kind,
                    seed,
                    answer,
                    hint,
                    seconds: Math.min(
                      14400,
                      Math.round((Date.now() - start) / 1000),
                    ),
                    reflection,
                  });
                  setResult(d.result);
                  onAnswered?.(d.result.correct);
                } catch {
                  setErr(
                    "Not saved yet. Your answer is still selected; please retry.",
                  );
                }
              }}
            >
              {busy ? "Checking & saving…" : "Check my answer"}
              <ArrowRight />
            </button>
          </div>
          <p className="method-note">
            Hints are welcome. Independent answers count more toward your
            mastery estimate.
          </p>
          {err && (
            <p className="toast-err" role="alert">
              {err}
            </p>
          )}
        </>
      )}
      {result && (
        <>
          <div
            className={`feedback ${result.correct ? "" : "wrong"}`}
            role="status"
          >
            <b>
              {result.correct
                ? "That’s a good brushstroke."
                : "A useful mistake. Let’s unpack it."}
            </b>
            <p>{result.explanation}</p>
            {!result.correct && (
              <p style={{ marginTop: 8 }}>
                Correct answer: <strong>{result.answer}</strong>
              </p>
            )}
          </div>
          <div className="check-summary">
            <Check />
            Saved to your progress.{" "}
            {(!result.correct || hint) && "Added to your mistake journal."}
          </div>
          <div className="dialog-actions">
            <span className="method-note">
              Your next recommendation has been updated.
            </span>
            <button className="btn primary" onClick={onNext}>
              {nextLabel}
              <ArrowRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
function ExternalProblem({
  topic,
  slug,
  save,
  busy,
  close,
}: {
  topic: Topic;
  slug: string;
  save: Save;
  busy: boolean;
  close: () => void;
}) {
  const p = topic.problems.find((p) => p.slug === slug)!;
  const [outcome, setOutcome] = useState("independent"),
    [reflection, setReflection] = useState(""),
    [minutes, setMinutes] = useState("15"),
    [seed] = useState(() => newSeed()),
    [opened, setOpened] = useState(false);
  return (
    <>
      <DialogHeader>
        <p className="eyebrow">LEETCODE · {p.difficulty.toUpperCase()}</p>
        <DialogTitle>{p.title}</DialogTitle>
        <DialogDescription>
          Practise {topic.title.toLowerCase()} in a real coding challenge, then
          return to record what you learned.
        </DialogDescription>
      </DialogHeader>
      <div className="complexity-note">
        <b>Before you code</b>
        <br />
        {topic.steps[0]}
        <br />
        Explain a brute-force approach, then look for repeated work you can
        remove.
      </div>
      <a
        className="btn primary"
        href={`https://leetcode.com/problems/${slug}/`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setOpened(true)}
      >
        Open question on LeetCode <ArrowUpRight />
      </a>
      <p className="method-note">
        LeetCode opens in a new tab. Submissions are not imported automatically.
        The result below is your own report, separate from graded mastery.
      </p>
      <label className="field">How did it go?</label>
      <Picker
        value={outcome}
        onChange={setOutcome}
        options={[
          { value: "independent", label: "Solved independently" },
          { value: "hinted", label: "Solved with a hint or solution" },
          { value: "stuck", label: "Not solved yet — I need another look" },
        ]}
      />
      <label className="field" htmlFor="minutes">
        Time spent (minutes)
      </label>
      <input
        id="minutes"
        type="number"
        min={1}
        max={240}
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
      />
      <label className="field" htmlFor="takeaway">
        One takeaway to remember
      </label>
      <textarea
        id="takeaway"
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        maxLength={3000}
        rows={3}
        placeholder="The pattern I noticed, the bug I fixed, or the idea I need to revisit…"
      />
      <div className="dialog-actions">
        <button className="btn" onClick={close}>
          Back to my studio
        </button>
        <button
          className="btn primary"
          disabled={
            busy ||
            !Number.isInteger(+minutes) ||
            +minutes < 1 ||
            +minutes > 240
          }
          onClick={async () => {
            try {
              await save({
                action: "attempt",
                kind: "external",
                topic: topic.id,
                slug,
                seed,
                answer: outcome,
                hint: outcome === "hinted",
                seconds: +minutes * 60,
                reflection,
              });
              toast.success("Practice recorded. Keep your brush moving.");
              close();
            } catch {}
          }}
        >
          {busy ? "Saving…" : "Record my result"}
          <Check />
        </button>
      </div>
    </>
  );
}
function Diagnostic({
  data,
  save,
  busy,
  onFinish,
}: {
  data: Studio;
  save: Save;
  busy: boolean;
  onFinish: () => void;
}) {
  const chosen = ["complexity", "arrays", "hashing", "search", "stacks", "dp"];
  const [step, setStep] = useState(0),
    [correct, setCorrect] = useState(0);
  return (
    <>
      <DialogHeader>
        <p className="eyebrow">FIND YOUR STARTING POINT</p>
        <DialogTitle>
          {step < 6
            ? "A small check. A clearer direction."
            : "Your first colours are on the canvas."}
        </DialogTitle>
        <DialogDescription>
          {step < 6
            ? `Question ${step + 1} of 6 · ${topics.find((t) => t.id === chosen[step])!.title}. Each answer is saved independently.`
            : "This is a starting signal, not a verdict on your ability."}
        </DialogDescription>
      </DialogHeader>
      <Progress
        value={(step / 6) * 100}
        aria-label={`Assessment progress ${step} of 6`}
      />
      {step < 6 ? (
        <Quiz
          key={step}
          topic={topics.find((t) => t.id === chosen[step])!}
          kind="diagnostic"
          attempts={data.attempts}
          save={save}
          busy={busy}
          onAnswered={(yes) => setCorrect((n) => n + (yes ? 1 : 0))}
          onNext={() => setStep(step + 1)}
          nextLabel={step === 5 ? "See my results" : "Next question"}
        />
      ) : (
        <div className="diagnostic-result">
          <Target style={{ margin: "0 auto", color: "#8b9777" }} />
          <div className="big-number">
            {correct}
            <span style={{ fontSize: 28, color: "#a3aa94" }}> / 6</span>
          </div>
          <p>
            {correct >= 5
              ? "A promising foundation. Now build reliable understanding with fresh checks."
              : correct >= 3
                ? "Some ideas are already taking shape. We’ll strengthen the gaps together."
                : "A blank canvas is a good place to start. The early lessons will walk you through each idea."}
          </p>
          <div className="complexity-note">
            Recommended next: <b>{recommendation(data).topic.title}</b>
          </div>
          <p className="method-note">
            One question per topic is not enough to establish mastery. Keep
            practising to make these estimates more reliable.
          </p>
          <button
            className="btn primary"
            style={{ marginTop: 20 }}
            onClick={onFinish}
          >
            View my skill palette <ArrowRight />
          </button>
        </div>
      )}
    </>
  );
}
function JournalEntry({
  attempt: a,
  save,
  busy,
  onReview,
}: {
  attempt: Attempt;
  save: Save;
  busy: boolean;
  onReview: () => void;
}) {
  const [note, setNote] = useState(a.reflection);
  const q = a.kind === "external" ? null : questionFor(a.topic, a.seed);
  return (
    <article className="paper journal-entry">
      <div className="section-heading">
        <span className="notebook-tag">
          {topics.find((t) => t.id === a.topic)?.title}
        </span>
        <span className={`badge ${a.hint ? "ochre" : "blue"}`}>
          {a.hint ? "Used a hint" : "Worth revisiting"}
        </span>
      </div>
      <h3>{a.label}</h3>
      {q && (
        <p>
          <b>The insight:</b> {q.explanation}
        </p>
      )}
      <textarea
        aria-label={`Reflection on ${a.label}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={3000}
        placeholder="In my own words, what will I do differently next time?"
      />
      <div className="journal-actions">
        <button className="btn text" onClick={onReview}>
          <RefreshCw />
          Try a fresh check
        </button>
        <button
          className="btn small"
          disabled={busy || note === a.reflection}
          onClick={async () => {
            try {
              await save({ action: "reflection", id: a.id, reflection: note });
              toast.success("Your takeaway is saved.");
            } catch {}
          }}
        >
          Save reflection <Check size={13} />
        </button>
      </div>
    </article>
  );
}
function Activity({ attempts }: { attempts: Attempt[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return {
      label: d.toLocaleDateString("en", {
        weekday: "short",
        timeZone: "Asia/Kolkata",
      }),
      n: attempts.filter((a) => dateKey(new Date(a.created_at)) === dateKey(d))
        .length,
    };
  });
  const max = Math.max(3, ...days.map((d) => d.n));
  return (
    <div
      className="activity-bars"
      aria-label="Attempts per day in the past week"
    >
      {days.map((d, i) => (
        <div className="activity-day" key={i}>
          <span>{d.n}</span>
          <i style={{ height: `${(d.n / max) * 105}px` }} />
          <small>{d.label}</small>
        </div>
      ))}
    </div>
  );
}
function Method() {
  return (
    <>
      <DialogHeader>
        <p className="eyebrow">A THOUGHTFUL PATH, NOT A GUESS</p>
        <DialogTitle>How your learning adapts</DialogTitle>
        <DialogDescription>
          Your tutor uses transparent rules and your recorded practice.
        </DialogDescription>
      </DialogHeader>
      <div className="lesson-body">
        <h3>1. Build evidence</h3>
        <p>
          Each topic uses your six most recent graded checks. Newer answers
          weigh more. An independent correct answer earns full credit; a hinted
          correct answer earns 65%. Incorrect answers point to a gap.
        </p>
        <h3>2. Earn confidence through repetition</h3>
        <p>
          One check can contribute at most 33% mastery, two at most 67%. At
          least three are needed for a strong estimate. LeetCode results are
          self-reported and do not raise this score.
        </p>
        <h3>3. Pick the next useful step</h3>
        <p>
          First, review a topic that is due. Otherwise, practise your chosen
          focus or the earliest topic below your pace threshold: gentle 85%,
          balanced 70%, intensive 65%.
        </p>
        <h3>4. Return before the idea fades</h3>
        <p>
          Topics at 70–89% are reviewed after 3 days; 90% or higher after 7
          days. A weaker result brings the topic back into active practice.
        </p>
        <div className="complexity-note">
          These are learning estimates, not interview-readiness scores. This
          tutor uses a curated curriculum and generated practice variations; it
          is not a live AI chat or an automatic code judge.
        </div>
      </div>
    </>
  );
}
