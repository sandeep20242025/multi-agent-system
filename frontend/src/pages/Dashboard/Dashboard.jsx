/**
 * Dashboard — Page
 *
 * Renders inside WorkspaceLayout as the main content slot.
 * All data is static / placeholder — no API calls, no backend.
 * Styling: CSS Modules (Dashboard.module.css) + CSS tokens only.
 */

import { useState } from "react";

import GlassCard        from "@/components/atoms/GlassCard";
import Button           from "@/components/atoms/Button";
import Badge            from "@/components/atoms/Badge";
import Avatar           from "@/components/atoms/Avatar";
import Loader           from "@/components/atoms/Loader";

import styles from "./Dashboard.module.css";

/* ═══════════════════════════════════════════════════════════
   STATIC PLACEHOLDER DATA
═══════════════════════════════════════════════════════════ */

const USER = { name: "Alex Johnson", role: "AI Engineer", status: "online" };

const TODAY = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
});

/* ── Statistics (6 cards) ──────────────────────────────── */
const STATS = [
    { id: "projects",    icon: "◇", label: "Projects",       value: "7",    trend: "+1",  trendUp: true,  variant: "primary" },
    { id: "agents",      icon: "⬡", label: "AI Agents",      value: "5",    trend: "+2",  trendUp: true,  variant: "success" },
    { id: "chats",       icon: "◎", label: "Conversations",  value: "38",   trend: "+5",  trendUp: true,  variant: "default" },
    { id: "files",       icon: "◈", label: "Uploaded Files", value: "124",  trend: "+12", trendUp: true,  variant: "warning" },
    { id: "tasks",       icon: "◉", label: "AI Tasks Done",  value: "286",  trend: "+34", trendUp: true,  variant: "primary" },
    { id: "rate",        icon: "✦", label: "Success Rate",   value: "94%",  trend: "+2%", trendUp: true,  variant: "success" },
];

/* ── Quick action cards (6) ────────────────────────────── */
const QUICK_ACTIONS = [
    { id: "chat",      icon: "◎", title: "New Chat",       desc: "Start a new AI conversation",          variant: "primary"  },
    { id: "project",   icon: "◇", title: "New Project",    desc: "Create a multi-agent project",          variant: "outline"  },
    { id: "upload",    icon: "◈", title: "Upload Files",   desc: "Add documents to your knowledge base",  variant: "outline"  },
    { id: "agent",     icon: "⬡", title: "Create Agent",   desc: "Define a new intelligent agent",        variant: "outline"  },
    { id: "knowledge", icon: "◉", title: "Knowledge Base", desc: "Browse and manage your knowledge",      variant: "outline"  },
    { id: "settings",  icon: "⚙", title: "Settings",       desc: "Configure workspace preferences",       variant: "ghost"    },
];

/* ── Recent projects ───────────────────────────────────── */
const PROJECTS = [
    { id: 1, name: "Market Research Report",  status: "active",    statusVariant: "success", updated: "Jul 28, 2025", progress: 72 },
    { id: 2, name: "Product Launch Strategy", status: "completed", statusVariant: "default", updated: "Jul 25, 2025", progress: 100 },
    { id: 3, name: "Competitor Analysis",     status: "active",    statusVariant: "success", updated: "Jul 22, 2025", progress: 55 },
    { id: 4, name: "Q3 Forecast Summary",     status: "pending",   statusVariant: "warning", updated: "Jul 18, 2025", progress: 20 },
    { id: 5, name: "Customer Insights Hub",   status: "completed", statusVariant: "default", updated: "Jul 14, 2025", progress: 100 },
];

/* ── Running agents (5) ────────────────────────────────── */
const AGENTS = [
    { id: "planner",  name: "Planner Agent",  role: "Orchestration",     status: "online",  statusVariant: "success", currentTask: "Awaiting task assignment",            progress: 100 },
    { id: "research", name: "Research Agent", role: "Data Retrieval",     status: "busy",    statusVariant: "primary", currentTask: "Fetching IBM Watson documentation…",  progress: 62  },
    { id: "analyzer", name: "Analyzer Agent", role: "Pattern Recognition",status: "busy",    statusVariant: "primary", currentTask: "Analyzing sentiment across 3 datasets", progress: 38 },
    { id: "writer",   name: "Writer Agent",   role: "Content Generation", status: "online",  statusVariant: "warning", currentTask: "Waiting for Analyzer to complete",    progress: 0   },
    { id: "reviewer", name: "Reviewer Agent", role: "Quality Assurance",  status: "offline", statusVariant: "ghost",   currentTask: "Idle — no pending reviews",           progress: 0   },
];

/* ── Recent conversations ───────────────────────────────── */
const CONVERSATIONS = [
    { id: 1, title: "Summarize Q3 performance data",       agent: "Analyzer Agent", time: "5m ago"  },
    { id: 2, title: "Write executive product brief",       agent: "Writer Agent",   time: "1h ago"  },
    { id: 3, title: "Analyze top 10 competitor sites",     agent: "Research Agent", time: "3h ago"  },
    { id: 4, title: "Generate investor summary report",    agent: "Writer Agent",   time: "6h ago"  },
    { id: 5, title: "Review and correct market analysis",  agent: "Reviewer Agent", time: "1d ago"  },
];

/* ── Recent uploaded files ─────────────────────────────── */
const FILES = [
    { id: 1, name: "Q3-Financial-Report.pdf",  type: "PDF",  size: "2.4 MB", uploaded: "Jul 28, 2025" },
    { id: 2, name: "competitor-matrix.xlsx",   type: "XLSX", size: "840 KB", uploaded: "Jul 26, 2025" },
    { id: 3, name: "brand-guidelines.docx",    type: "DOCX", size: "1.1 MB", uploaded: "Jul 24, 2025" },
    { id: 4, name: "customer-survey-2025.csv", type: "CSV",  size: "312 KB", uploaded: "Jul 21, 2025" },
    { id: 5, name: "product-roadmap-v3.pdf",   type: "PDF",  size: "4.7 MB", uploaded: "Jul 18, 2025" },
];

/* ── Activity timeline ─────────────────────────────────── */
const TIMELINE = [
    { id: 1, icon: "◈", type: "task",    label: "Task Completed",  desc: "Market Research Report analysis finished",       time: "2m ago"  },
    { id: 2, icon: "◎", type: "chat",    label: "Chat Started",    desc: "New conversation with Writer Agent",             time: "18m ago" },
    { id: 3, icon: "◇", type: "project", label: "Project Created", desc: "Q3 Forecast Summary workspace created",          time: "1h ago"  },
    { id: 4, icon: "◈", type: "file",    label: "File Uploaded",   desc: "competitor-matrix.xlsx added to knowledge base", time: "2h ago"  },
    { id: 5, icon: "⬡", type: "agent",   label: "Agent Started",   desc: "Research Agent v2.1 deployed successfully",      time: "3h ago"  },
    { id: 6, icon: "◉", type: "task",    label: "Task Completed",  desc: "Product Launch Strategy review finished",         time: "5h ago"  },
];

/* ── System status ─────────────────────────────────────── */
const SYSTEM_STATUS = [
    { id: "cpu",      label: "CPU Usage",     value: "34%",   pct: 34, status: "success" },
    { id: "memory",   label: "Memory",        value: "61%",   pct: 61, status: "warning" },
    { id: "ai",       label: "AI Provider",   value: "Online",pct: 100, status: "success" },
    { id: "db",       label: "Database",      value: "OK",    pct: 100, status: "success" },
    { id: "api",      label: "API Gateway",   value: "Healthy",pct: 100,status: "success" },
    { id: "storage",  label: "Storage",       value: "48%",   pct: 48, status: "default" },
];

/* File type icon map */
const FILE_ICONS = { PDF: "◈", XLSX: "◇", DOCX: "◎", CSV: "◉" };
const TIMELINE_COLORS = { task: "var(--success)", chat: "var(--accent)", project: "var(--accent-secondary)", file: "var(--warning)", agent: "var(--accent)" };

/* ═══════════════════════════════════════════════════════════
   DASHBOARD COMPONENT
═══════════════════════════════════════════════════════════ */
function Dashboard() {
    const [dismissed, setDismissed] = useState({});
    const dismiss = (id) => setDismissed((p) => ({ ...p, [id]: true }));

    return (
        <div className={styles.page}>

            {/* ══════════════════════════════════════════════
                WELCOME SECTION
            ══════════════════════════════════════════════ */}
            <header className={styles.welcome}>
                <div className={styles.welcomeText}>
                    <p className={styles.welcomeSub}>Good day, Engineer</p>
                    <h1 className={styles.welcomeTitle}>
                        Welcome back,{" "}
                        <span className={styles.welcomeAccent}>{USER.name}</span>
                    </h1>
                    <p className={styles.welcomeDesc}>
                        Your AI workspace is active. Monitor agents, manage projects, and accelerate intelligent workflows.
                    </p>
                </div>
                <div className={styles.welcomeMeta}>
                    <Badge variant="success" dot pulse>Workspace Active</Badge>
                    <span className={styles.welcomeDate} aria-label={`Today is ${TODAY}`}>{TODAY}</span>
                </div>
            </header>

            {/* ══════════════════════════════════════════════
                STATISTICS
            ══════════════════════════════════════════════ */}
            <section aria-labelledby="stats-title" className={styles.section}>
                <h2 id="stats-title" className={styles.sectionTitle}>
                    <span aria-hidden="true">◈</span> Overview
                </h2>
                <ul className={styles.statsGrid} role="list">
                    {STATS.map((s, i) => (
                        <li key={s.id} style={{ animationDelay: `${i * 0.06}s` }} className={styles.statItem}>
                            <GlassCard blur="md" padding="md" hover bordered className={styles.statCard}>
                                <div className={styles.statTop}>
                                    <span className={styles.statIcon} aria-hidden="true">{s.icon}</span>
                                    <Badge variant={s.variant} className={styles.statTrend}>
                                        {s.trendUp ? "▲" : "▼"} {s.trend}
                                    </Badge>
                                </div>
                                <div
                                    className={styles.statValue}
                                    aria-label={`${s.label}: ${s.value}`}
                                    style={{ animationDelay: `${i * 0.06 + 0.1}s` }}
                                >
                                    {s.value}
                                </div>
                                <div className={styles.statLabel}>{s.label}</div>
                            </GlassCard>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ══════════════════════════════════════════════
                QUICK ACTIONS
            ══════════════════════════════════════════════ */}
            <section aria-labelledby="actions-title" className={styles.section}>
                <h2 id="actions-title" className={styles.sectionTitle}>
                    <span aria-hidden="true">◇</span> Quick Actions
                </h2>
                <ul className={styles.actionsGrid} role="list">
                    {QUICK_ACTIONS.map((a, i) => (
                        <li key={a.id} style={{ animationDelay: `${i * 0.05}s` }} className={styles.actionItem}>
                            <GlassCard
                                blur="md"
                                padding="md"
                                hover
                                bordered
                                className={styles.actionCard}
                                onClick={() => {}}
                            >
                                <span className={styles.actionIcon} aria-hidden="true">{a.icon}</span>
                                <div className={styles.actionBody}>
                                    <span className={styles.actionTitle}>{a.title}</span>
                                    <span className={styles.actionDesc}>{a.desc}</span>
                                </div>
                                <Button
                                    variant={a.variant}
                                    size="sm"
                                    aria-label={a.title}
                                    className={styles.actionBtn}
                                >
                                    Launch
                                </Button>
                            </GlassCard>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ══════════════════════════════════════════════
                ROW — PROJECTS + RUNNING AGENTS
            ══════════════════════════════════════════════ */}
            <div className={styles.row2}>

                {/* Recent Projects */}
                <section aria-labelledby="projects-title" className={styles.section}>
                    <h2 id="projects-title" className={styles.sectionTitle}>
                        <span aria-hidden="true">◇</span> Recent Projects
                    </h2>
                    <GlassCard blur="md" padding="md" hover={false} bordered className={styles.tableCard}>
                        <table className={styles.table} aria-label="Recent projects table">
                            <thead>
                                <tr>
                                    <th className={styles.th} scope="col">Project Name</th>
                                    <th className={styles.th} scope="col">Status</th>
                                    <th className={styles.th} scope="col">Progress</th>
                                    <th className={styles.th} scope="col">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PROJECTS.map((p) => (
                                    <tr key={p.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            <span className={styles.projectName}>{p.name}</span>
                                        </td>
                                        <td className={styles.td}>
                                            <Badge variant={p.statusVariant}>{p.status}</Badge>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.progOuter}
                                                role="progressbar"
                                                aria-valuenow={p.progress}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-label={`${p.name} progress: ${p.progress}%`}
                                            >
                                                <div
                                                    className={styles.progFill}
                                                    style={{ width: `${p.progress}%` }}
                                                />
                                            </div>
                                            <span className={styles.progLabel}>{p.progress}%</span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.dateText}>{p.updated}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </GlassCard>
                </section>

                {/* Running Agents */}
                <section aria-labelledby="agents-title" className={styles.section}>
                    <h2 id="agents-title" className={styles.sectionTitle}>
                        <span aria-hidden="true">⬡</span> Running Agents
                        <Badge variant="success" dot pulse className={styles.liveBadge}>Live</Badge>
                    </h2>
                    <div className={styles.agentCards}>
                        {AGENTS.map((a) => (
                            <GlassCard
                                key={a.id}
                                blur="sm"
                                padding="md"
                                hover
                                bordered
                                className={styles.agentCard}
                            >
                                <div className={styles.agentTop}>
                                    <Avatar name={a.name} size="sm" status={a.status} />
                                    <div className={styles.agentInfo}>
                                        <span className={styles.agentName}>{a.name}</span>
                                        <span className={styles.agentRole}>{a.role}</span>
                                    </div>
                                    <div className={styles.agentRight}>
                                        <Badge variant={a.statusVariant}>{a.status}</Badge>
                                        {a.status === "busy" && (
                                            <Loader size="xs" aria-label={`${a.name} processing`} />
                                        )}
                                    </div>
                                </div>
                                <p className={styles.agentTask}>{a.currentTask}</p>
                                {a.progress > 0 && (
                                    <div
                                        className={styles.agentProgTrack}
                                        role="progressbar"
                                        aria-valuenow={a.progress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`${a.name}: ${a.progress}%`}
                                    >
                                        <div
                                            className={styles.agentProgFill}
                                            style={{ width: `${a.progress}%` }}
                                        />
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                    </div>
                </section>
            </div>

            {/* ══════════════════════════════════════════════
                ROW — CONVERSATIONS + FILES
            ══════════════════════════════════════════════ */}
            <div className={styles.row3}>

                {/* Recent Conversations */}
                <section aria-labelledby="conv-title" className={styles.section}>
                    <h2 id="conv-title" className={styles.sectionTitle}>
                        <span aria-hidden="true">◎</span> Recent Conversations
                    </h2>
                    <GlassCard blur="md" padding="md" hover={false} bordered>
                        <ul className={styles.convList} role="list">
                            {CONVERSATIONS.map((c) => (
                                <li key={c.id} className={styles.convItem}>
                                    <span className={styles.convIcon} aria-hidden="true">◎</span>
                                    <div className={styles.convBody}>
                                        <span className={styles.convTitle}>{c.title}</span>
                                        <span className={styles.convAgent}>{c.agent}</span>
                                    </div>
                                    <span className={styles.convTime}>{c.time}</span>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                </section>

                {/* Recent Uploaded Files */}
                <section aria-labelledby="files-title" className={styles.section}>
                    <h2 id="files-title" className={styles.sectionTitle}>
                        <span aria-hidden="true">◈</span> Recent Files
                    </h2>
                    <GlassCard blur="md" padding="md" hover={false} bordered>
                        <ul className={styles.fileList} role="list">
                            {FILES.map((f) => (
                                <li key={f.id} className={styles.fileItem}>
                                    <span className={styles.fileIcon} aria-hidden="true">
                                        {FILE_ICONS[f.type] ?? "◈"}
                                    </span>
                                    <div className={styles.fileBody}>
                                        <span className={styles.fileName}>{f.name}</span>
                                        <div className={styles.fileMeta}>
                                            <Badge variant="default" className={styles.fileTypeBadge}>{f.type}</Badge>
                                            <span className={styles.fileSize}>{f.size}</span>
                                        </div>
                                    </div>
                                    <span className={styles.fileDate}>{f.uploaded}</span>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                </section>
            </div>

            {/* ══════════════════════════════════════════════
                ROW — TIMELINE + SYSTEM STATUS
            ══════════════════════════════════════════════ */}
            <div className={styles.row4}>

                {/* Activity Timeline */}
                <section aria-labelledby="timeline-title" className={styles.section}>
                    <h2 id="timeline-title" className={styles.sectionTitle}>
                        <span aria-hidden="true">◉</span> Activity Timeline
                    </h2>
                    <GlassCard blur="md" padding="md" hover={false} bordered>
                        <ol className={styles.timeline} aria-label="Activity timeline">
                            {TIMELINE.map((t, i) => (
                                <li
                                    key={t.id}
                                    className={styles.timelineItem}
                                    style={{ animationDelay: `${i * 0.07}s` }}
                                >
                                    {/* Vertical line */}
                                    {i < TIMELINE.length - 1 && (
                                        <span className={styles.timelineLine} aria-hidden="true" />
                                    )}
                                    <span
                                        className={styles.timelineDot}
                                        aria-hidden="true"
                                        style={{ color: TIMELINE_COLORS[t.type] }}
                                    >
                                        {t.icon}
                                    </span>
                                    <div className={styles.timelineBody}>
                                        <span className={styles.timelineLabel}>{t.label}</span>
                                        <span className={styles.timelineDesc}>{t.desc}</span>
                                    </div>
                                    <span className={styles.timelineTime}>{t.time}</span>
                                </li>
                            ))}
                        </ol>
                    </GlassCard>
                </section>

                {/* System Status Panel */}
                <section aria-labelledby="status-title" className={styles.section}>
                    <h2 id="status-title" className={styles.sectionTitle}>
                        <span aria-hidden="true">◉</span> System Status
                    </h2>
                    <GlassCard blur="md" padding="md" hover={false} bordered className={styles.statusCard}>
                        {/* Overall health row */}
                        <div className={styles.statusHealth}>
                            <span className={styles.statusHealthDot} aria-hidden="true" />
                            <span className={styles.statusHealthLabel}>All Systems Operational</span>
                            <Badge variant="success" dot pulse>Live</Badge>
                        </div>

                        <ul className={styles.statusList} role="list">
                            {SYSTEM_STATUS.map((s) => (
                                <li key={s.id} className={styles.statusItem}>
                                    <span className={styles.statusItemLabel}>{s.label}</span>
                                    <div className={styles.statusBarOuter}
                                        role="progressbar"
                                        aria-valuenow={s.pct}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`${s.label}: ${s.value}`}
                                    >
                                        <div
                                            className={[
                                                styles.statusBarFill,
                                                styles[`statusBar_${s.status}`],
                                            ].filter(Boolean).join(" ")}
                                            style={{ width: `${s.pct}%` }}
                                        />
                                    </div>
                                    <Badge variant={s.status} className={styles.statusValue}>
                                        {s.value}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                </section>
            </div>

        </div>
    );
}

export default Dashboard;
