import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AnimatedBackground from "@/components/organisms/AnimatedBackground";
import Navbar             from "@/components/organisms/Navbar";
import Footer             from "@/components/organisms/Footer";
import GlassCard          from "@/components/atoms/GlassCard";
import Button             from "@/components/atoms/Button";
import Badge              from "@/components/atoms/Badge";
import Avatar             from "@/components/atoms/Avatar";
import Loader             from "@/components/atoms/Loader";
import ThemeToggle        from "@/components/molecules/ThemeToggle";
import LanguageSelector   from "@/components/molecules/LanguageSelector";

import ROUTES from "@/constants/routes";
import "./styles.css";

/* ═══════════════════════════════════════════════════════════
   STATIC PLACEHOLDER DATA  — no backend, no API, no state lib
═══════════════════════════════════════════════════════════ */

const USER = { name: "Alex Johnson", role: "AI Engineer", status: "online" };

const TODAY = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
});

/* ── Stat cards ──────────────────────────────────────────── */
const STATS = [
    { id: "agents",    icon: "⬡", label: "Active AI Agents", value: "5",   trend: "+2",  trendUp: true,  variant: "primary" },
    { id: "running",   icon: "◈", label: "Running Tasks",    value: "12",  trend: "+4",  trendUp: true,  variant: "success" },
    { id: "completed", icon: "◉", label: "Completed Tasks",  value: "148", trend: "+18", trendUp: true,  variant: "default" },
    { id: "projects",  icon: "◇", label: "Projects",         value: "7",   trend: "-1",  trendUp: false, variant: "warning" },
];

/* ── Agents ──────────────────────────────────────────────── */
const AGENTS = [
    {
        id: "planner",  name: "Planner Agent",  role: "Orchestration",
        status: "online",  badgeVariant: "success",  statusLabel: "Ready",
        activity: "Awaiting new task assignment",
        progress: 100,
    },
    {
        id: "research", name: "Research Agent", role: "Data Retrieval",
        status: "busy",    badgeVariant: "primary",  statusLabel: "Processing",
        activity: "Fetching IBM Watson documentation…",
        progress: 62,
    },
    {
        id: "analyzer", name: "Analyzer Agent", role: "Pattern Recognition",
        status: "busy",    badgeVariant: "primary",  statusLabel: "Processing",
        activity: "Analyzing sentiment across 3 datasets",
        progress: 38,
    },
    {
        id: "writer",   name: "Writer Agent",   role: "Content Generation",
        status: "online",  badgeVariant: "warning",  statusLabel: "Waiting",
        activity: "Waiting for Analyzer to complete",
        progress: 0,
    },
    {
        id: "reviewer", name: "Reviewer Agent", role: "Quality Assurance",
        status: "offline", badgeVariant: "ghost",    statusLabel: "Offline",
        activity: "Idle — no pending reviews",
        progress: 0,
    },
];

/* ── Projects ────────────────────────────────────────────── */
const PROJECTS = [
    { id: 1, name: "Market Research Report",  date: "Jul 28, 2025", status: "active",    statusVariant: "success" },
    { id: 2, name: "Product Launch Strategy", date: "Jul 25, 2025", status: "completed", statusVariant: "default" },
    { id: 3, name: "Competitor Analysis",     date: "Jul 22, 2025", status: "active",    statusVariant: "success" },
    { id: 4, name: "Q3 Forecast Summary",     date: "Jul 18, 2025", status: "pending",   statusVariant: "warning" },
    { id: 5, name: "Customer Insights",       date: "Jul 14, 2025", status: "completed", statusVariant: "default" },
];

/* ── Analytics ───────────────────────────────────────────── */
const ANALYTICS = [
    { id: "prompts",   label: "Prompt Count",   value: "3,842", pct: 78, color: "var(--accent)" },
    { id: "responses", label: "AI Responses",   value: "3,791", pct: 74, color: "var(--accent-secondary)" },
    { id: "time",      label: "Time Saved (h)", value: "124",   pct: 60, color: "var(--success)" },
    { id: "files",     label: "Files Processed",value: "289",   pct: 44, color: "var(--warning)" },
];

/* ── Notifications ───────────────────────────────────────── */
const NOTIFICATIONS = [
    { id: 1, icon: "◎", title: "Research completed",   body: "Market Research Report analysis finished.",  time: "2m ago",  priority: "high",   priorityVariant: "danger"  },
    { id: 2, icon: "◇", title: "Workspace created",    body: "New AI workspace 'Q3 Forecast' is ready.",  time: "14m ago", priority: "medium", priorityVariant: "warning" },
    { id: 3, icon: "⬡", title: "New agent available",  body: "Summarizer Agent v2.1 is now available.",   time: "1h ago",  priority: "low",    priorityVariant: "default" },
    { id: 4, icon: "◈", title: "System updated",       body: "Core runtime upgraded to v2.0.4.",          time: "3h ago",  priority: "low",    priorityVariant: "ghost"   },
];

/* ── Quick actions ───────────────────────────────────────── */
const QUICK_ACTIONS = [
    { id: "workspace", icon: "⬡", label: "Create Workspace",  variant: "primary" },
    { id: "upload",    icon: "◈", label: "Upload File",       variant: "outline" },
    { id: "invite",    icon: "◎", label: "Invite Team",       variant: "outline" },
    { id: "settings",  icon: "◉", label: "Open Settings",     variant: "ghost"   },
];

/* ── Sidebar data ────────────────────────────────────────── */
const RECENT_CHATS = [
    { id: 1, title: "Summarize Q3 data",      time: "5m ago"  },
    { id: 2, title: "Write product brief",     time: "1h ago"  },
    { id: 3, title: "Analyze competitor list", time: "3h ago"  },
];

const PINNED_PROJECTS = [
    { id: 1, name: "Market Research Report" },
    { id: 2, name: "Product Launch Strategy" },
];

const FAV_AGENTS = [
    { id: "planner",  label: "Planner Agent"  },
    { id: "research", label: "Research Agent" },
];

const NAV_ITEMS = [
    { label: "Dashboard", href: "/workspace" },
    { label: "Agents",    href: "/agents"    },
    { label: "Projects",  href: "/projects"  },
    { label: "Settings",  href: ROUTES.SETTINGS },
];

/* ═══════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════════ */
function Dashboard() {
    const navigate = useNavigate();
    const [notifRead, setNotifRead] = useState({});

    const markRead = (id) => setNotifRead((prev) => ({ ...prev, [id]: true }));

    return (
        <AnimatedBackground showGrid showNoise showParticles={false}>

            <Navbar
                navigationItems={NAV_ITEMS}
                title="AI Workspace"
                subtitle="Multi-Agent System"
                user={USER}
                sticky
                showSearch
                showTheme={false}
                showLanguage={false}
                showProfile
            />

            <div className="dash-layout">

                {/* ═══════════════════════════════════════
                    SIDEBAR
                ═══════════════════════════════════════ */}
                <aside className="dash-sidebar" aria-label="Sidebar">
                    <GlassCard blur="sm" padding="md" hover={false} bordered className="sidebar-card">
                        <h2 className="sidebar-heading">Recent Chats</h2>
                        <ul className="sidebar-list" role="list">
                            {RECENT_CHATS.map((c) => (
                                <li key={c.id} className="sidebar-item">
                                    <span className="sidebar-item-icon" aria-hidden="true">◈</span>
                                    <div className="sidebar-item-body">
                                        <span className="sidebar-item-title">{c.title}</span>
                                        <span className="sidebar-item-time">{c.time}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    <GlassCard blur="sm" padding="md" hover={false} bordered className="sidebar-card">
                        <h2 className="sidebar-heading">Pinned Projects</h2>
                        <ul className="sidebar-list" role="list">
                            {PINNED_PROJECTS.map((p) => (
                                <li key={p.id} className="sidebar-item">
                                    <span className="sidebar-item-icon sidebar-item-icon--pin" aria-hidden="true">◇</span>
                                    <span className="sidebar-item-title">{p.name}</span>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    <GlassCard blur="sm" padding="md" hover={false} bordered className="sidebar-card">
                        <h2 className="sidebar-heading">Favourite Agents</h2>
                        <ul className="sidebar-list" role="list">
                            {FAV_AGENTS.map((a) => (
                                <li key={a.id} className="sidebar-item">
                                    <span className="sidebar-item-icon sidebar-item-icon--agent" aria-hidden="true">⬡</span>
                                    <span className="sidebar-item-title">{a.label}</span>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                </aside>

                {/* ═══════════════════════════════════════
                    MAIN CONTENT
                ═══════════════════════════════════════ */}
                <main className="dash-main" id="main-content">

                    {/* ── HEADER ──────────────────────── */}
                    <header className="dash-header">
                        <div className="dash-greeting">
                            <p className="dash-greeting-sub">Good day,</p>
                            <h1 className="dash-greeting-name">
                                Welcome back,{" "}
                                <span className="dash-name-accent">{USER.name}</span>
                            </h1>
                            <p className="dash-greeting-desc">
                                Manage your AI workspace and monitor your intelligent agents in real time.
                            </p>
                        </div>
                        <div className="dash-header-controls">
                            <span className="dash-date" aria-label={`Today is ${TODAY}`}>{TODAY}</span>
                            <ThemeToggle />
                            <LanguageSelector />
                        </div>
                    </header>

                    {/* ── ROW 1 — Stat cards ──────────── */}
                    <section aria-labelledby="stats-heading" className="dash-section">
                        <h2 id="stats-heading" className="sr-only">Statistics overview</h2>
                        <ul className="stats-grid" role="list">
                            {STATS.map((s) => (
                                <li key={s.id}>
                                    <GlassCard blur="md" padding="md" hover bordered className="stat-card">
                                        <div className="stat-top">
                                            <span className="stat-icon" aria-hidden="true">{s.icon}</span>
                                            <Badge variant={s.variant} className="stat-badge">
                                                {s.trendUp ? "▲" : "▼"} {s.trend}
                                            </Badge>
                                        </div>
                                        <div className="stat-value" aria-label={`${s.label}: ${s.value}`}>
                                            {s.value}
                                        </div>
                                        <div className="stat-label">{s.label}</div>
                                    </GlassCard>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* ── ROW 2 — Agents + Projects ───── */}
                    <section aria-label="Agents and projects" className="dash-section">
                        <div className="row2-grid">

                            {/* Agent Monitor */}
                            <GlassCard blur="md" padding="md" hover={false} bordered className="agent-monitor">
                                <div className="panel-header">
                                    <h2 className="panel-title">
                                        <span aria-hidden="true">⬡</span> AI Agent Monitor
                                    </h2>
                                    <Badge variant="success" dot pulse>Live</Badge>
                                </div>

                                <ul className="agent-list" role="list">
                                    {AGENTS.map((agent) => (
                                        <li key={agent.id} className="agent-row">
                                            <Avatar
                                                name={agent.name}
                                                size="sm"
                                                status={agent.status}
                                            />
                                            <div className="agent-info">
                                                <div className="agent-info-top">
                                                    <span className="agent-name">{agent.name}</span>
                                                    <Badge variant={agent.badgeVariant} dot={agent.status === "busy"}>
                                                        {agent.statusLabel}
                                                    </Badge>
                                                </div>
                                                <span className="agent-activity">{agent.activity}</span>
                                                {agent.progress > 0 && (
                                                    <div
                                                        className="agent-progress-track"
                                                        role="progressbar"
                                                        aria-valuenow={agent.progress}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                        aria-label={`${agent.name} progress: ${agent.progress}%`}
                                                    >
                                                        <div
                                                            className="agent-progress-fill"
                                                            style={{ width: `${agent.progress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {agent.status === "busy" && (
                                                <Loader size="xs" aria-label={`${agent.name} is processing`} />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>

                            {/* Recent Projects */}
                            <GlassCard blur="md" padding="md" hover={false} bordered className="projects-panel">
                                <div className="panel-header">
                                    <h2 className="panel-title">
                                        <span aria-hidden="true">◇</span> Recent Projects
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate(ROUTES.WORKSPACE)}
                                        aria-label="View all projects"
                                    >
                                        View All ›
                                    </Button>
                                </div>

                                <ul className="project-list" role="list">
                                    {PROJECTS.map((p) => (
                                        <li key={p.id} className="project-row">
                                            <div className="project-info">
                                                <span className="project-name">{p.name}</span>
                                                <span className="project-date">{p.date}</span>
                                            </div>
                                            <div className="project-actions">
                                                <Badge variant={p.statusVariant}>{p.status}</Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    aria-label={`Open project ${p.name}`}
                                                >
                                                    Open
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>
                        </div>
                    </section>

                    {/* ── ROW 3 — Analytics ───────────── */}
                    <section aria-labelledby="analytics-heading" className="dash-section">
                        <GlassCard blur="md" padding="lg" hover={false} bordered className="analytics-panel">
                            <div className="panel-header">
                                <h2 id="analytics-heading" className="panel-title">
                                    <span aria-hidden="true">◈</span> Analytics Overview
                                </h2>
                                <Badge variant="default">Last 30 days</Badge>
                            </div>

                            <div className="analytics-grid">
                                {ANALYTICS.map((a) => (
                                    <div key={a.id} className="analytics-item">
                                        <div className="analytics-top">
                                            <span className="analytics-label">{a.label}</span>
                                            <span className="analytics-value">{a.value}</span>
                                        </div>
                                        {/* CSS-only bar chart */}
                                        <div
                                            className="analytics-bar-track"
                                            role="img"
                                            aria-label={`${a.label}: ${a.pct}%`}
                                        >
                                            <div
                                                className="analytics-bar-fill"
                                                style={{
                                                    width:      `${a.pct}%`,
                                                    background: a.color,
                                                    boxShadow:  `0 0 8px ${a.color}`,
                                                }}
                                            />
                                        </div>
                                        <div className="analytics-pct">{a.pct}%</div>
                                    </div>
                                ))}
                            </div>

                            {/* CSS-only area chart placeholder */}
                            <div className="chart-area" aria-label="Activity trend chart (placeholder)" role="img">
                                <div className="chart-area-inner">
                                    {/* SVG sparkline — no library */}
                                    <svg
                                        viewBox="0 0 400 80"
                                        preserveAspectRatio="none"
                                        className="chart-svg"
                                        aria-hidden="true"
                                    >
                                        <defs>
                                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"    />
                                            </linearGradient>
                                        </defs>
                                        {/* Area fill */}
                                        <path
                                            d="M0,60 C30,55 60,30 90,25 C120,20 150,40 180,35 C210,30 240,15 270,20 C300,25 330,10 360,8 C380,6 400,4 400,4 L400,80 L0,80 Z"
                                            fill="url(#chartGrad)"
                                        />
                                        {/* Line */}
                                        <path
                                            d="M0,60 C30,55 60,30 90,25 C120,20 150,40 180,35 C210,30 240,15 270,20 C300,25 330,10 360,8 C380,6 400,4 400,4"
                                            fill="none"
                                            stroke="var(--accent)"
                                            strokeWidth="1.5"
                                        />
                                        {/* Data points */}
                                        {[
                                            [0,60],[90,25],[180,35],[270,20],[360,8],[400,4],
                                        ].map(([x, y], i) => (
                                            <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />
                                        ))}
                                    </svg>
                                    <div className="chart-x-labels" aria-hidden="true">
                                        {["Jul 1","Jul 8","Jul 15","Jul 22","Jul 28","Today"].map((l) => (
                                            <span key={l} className="chart-x-label">{l}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </section>

                    {/* ── ROW 4 — Notifications ───────── */}
                    <section aria-labelledby="notif-heading" className="dash-section">
                        <GlassCard blur="md" padding="md" hover={false} bordered className="notif-panel">
                            <div className="panel-header">
                                <h2 id="notif-heading" className="panel-title">
                                    <span aria-hidden="true">◉</span> Notifications
                                </h2>
                                <Badge variant="danger">{NOTIFICATIONS.length}</Badge>
                            </div>

                            <ul className="notif-list" role="list">
                                {NOTIFICATIONS.map((n) => (
                                    <li
                                        key={n.id}
                                        className={["notif-item", notifRead[n.id] ? "notif-item--read" : ""].filter(Boolean).join(" ")}
                                    >
                                        <span className="notif-icon" aria-hidden="true">{n.icon}</span>
                                        <div className="notif-body">
                                            <div className="notif-top">
                                                <span className="notif-title">{n.title}</span>
                                                <Badge variant={n.priorityVariant}>{n.priority}</Badge>
                                            </div>
                                            <span className="notif-text">{n.body}</span>
                                        </div>
                                        <div className="notif-right">
                                            <span className="notif-time">{n.time}</span>
                                            {!notifRead[n.id] && (
                                                <button
                                                    type="button"
                                                    className="notif-dismiss"
                                                    aria-label={`Dismiss notification: ${n.title}`}
                                                    onClick={() => markRead(n.id)}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </section>

                    {/* ── ROW 5 — Quick Actions ───────── */}
                    <section aria-labelledby="actions-heading" className="dash-section">
                        <h2 id="actions-heading" className="panel-title dash-section-title">
                            <span aria-hidden="true">◇</span> Quick Actions
                        </h2>
                        <div className="actions-grid">
                            {QUICK_ACTIONS.map((a) => (
                                <GlassCard
                                    key={a.id}
                                    blur="md"
                                    padding="lg"
                                    hover
                                    bordered
                                    className="action-card"
                                    onClick={() => {}}
                                >
                                    <span className="action-icon" aria-hidden="true">{a.icon}</span>
                                    <Button
                                        variant={a.variant}
                                        size="md"
                                        fullWidth
                                        aria-label={a.label}
                                        className="action-btn"
                                    >
                                        {a.label}
                                    </Button>
                                </GlassCard>
                            ))}
                        </div>
                    </section>

                </main>{/* /dash-main */}
            </div>{/* /dash-layout */}

            <Footer
                projectName="AI Workspace"
                version="2.0.0"
                showLinks={false}
                showStatus
            />

        </AnimatedBackground>
    );
}

export default Dashboard;
