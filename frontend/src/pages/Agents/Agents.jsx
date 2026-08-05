/**
 * Agents — Page
 *
 * Renders inside WorkspaceLayout as the main content slot.
 * Static placeholder data — no API, no backend.
 * Styling: CSS Modules (Agents.module.css) + CSS tokens only.
 */

import { useState, useMemo } from "react";

import GlassCard from "@/components/atoms/GlassCard";
import Button    from "@/components/atoms/Button";
import Badge     from "@/components/atoms/Badge";
import Avatar    from "@/components/atoms/Avatar";
import Loader    from "@/components/atoms/Loader";
import SearchBar from "@/components/molecules/SearchBar";

import styles from "./Agents.module.css";

/* ═══════════════════════════════════════════════════════════
   STATIC AGENT DATA
═══════════════════════════════════════════════════════════ */

const INITIAL_AGENTS = [
    {
        id: "planner",
        name: "Planner",
        fullName: "Planner Agent",
        icon: "◇",
        role: "Orchestration",
        description:
            "Coordinates the full pipeline — decomposes high-level goals into subtasks, assigns work to other agents, and tracks overall progress.",
        status: "online",
        statusVariant: "success",
        currentTask: "Awaiting task assignment",
        progress: 0,
        color: "var(--accent)",
    },
    {
        id: "researcher",
        name: "Researcher",
        fullName: "Researcher Agent",
        icon: "◎",
        role: "Data Retrieval",
        description:
            "Autonomously searches, scrapes, and synthesises information from internal knowledge bases and the web to fuel downstream agents.",
        status: "busy",
        statusVariant: "primary",
        currentTask: "Fetching IBM Watson API documentation…",
        progress: 62,
        color: "var(--accent-secondary)",
    },
    {
        id: "analyst",
        name: "Analyst",
        fullName: "Analyst Agent",
        icon: "◈",
        role: "Pattern Recognition",
        description:
            "Processes structured and unstructured datasets — performs statistical analysis, detects trends, and produces actionable insights.",
        status: "busy",
        statusVariant: "primary",
        currentTask: "Analysing sentiment across 3 datasets",
        progress: 38,
        color: "var(--accent-purple)",
    },
    {
        id: "writer",
        name: "Writer",
        fullName: "Writer Agent",
        icon: "◉",
        role: "Content Generation",
        description:
            "Crafts reports, briefs, emails, and long-form content based on structured inputs — adheres to brand tone and formatting guidelines.",
        status: "online",
        statusVariant: "warning",
        currentTask: "Waiting for Analyst to complete",
        progress: 0,
        color: "var(--warning)",
    },
    {
        id: "reviewer",
        name: "Reviewer",
        fullName: "Reviewer Agent",
        icon: "⬡",
        role: "Quality Assurance",
        description:
            "Reviews outputs from other agents for accuracy, coherence, and policy compliance before surfacing results to the user.",
        status: "offline",
        statusVariant: "ghost",
        currentTask: "Idle — no pending reviews",
        progress: 0,
        color: "var(--text-muted)",
    },
];

const FILTER_OPTIONS = ["All", "online", "busy", "offline"];

const FILTER_LABELS = {
    All: "All",
    online: "Online",
    busy: "Busy",
    offline: "Offline",
};

/* ═══════════════════════════════════════════════════════════
   AGENT CARD
═══════════════════════════════════════════════════════════ */

function AgentCard({ agent, onStart, onStop, onViewDetails }) {
    const isBusy    = agent.status === "busy";
    const isOffline = agent.status === "offline";
    const isOnline  = agent.status === "online";

    return (
        <GlassCard
            blur="md"
            padding="md"
            hover
            bordered
            className={styles.card}
        >
            {/* ── Card header ── */}
            <div className={styles.cardHeader}>
                <div className={styles.agentMeta}>
                    <div
                        className={styles.iconWrap}
                        aria-hidden="true"
                        style={{ "--agent-color": agent.color }}
                    >
                        {agent.icon}
                    </div>
                    <div className={styles.nameBlock}>
                        <span className={styles.agentName}>{agent.fullName}</span>
                        <span className={styles.agentRole}>{agent.role}</span>
                    </div>
                </div>

                <div className={styles.statusBlock}>
                    <Badge
                        variant={agent.statusVariant}
                        dot
                        pulse={isBusy}
                    >
                        {agent.status}
                    </Badge>
                    {isBusy && (
                        <Loader
                            size="xs"
                            aria-label={`${agent.fullName} is processing`}
                        />
                    )}
                </div>
            </div>

            {/* ── Description ── */}
            <p className={styles.description}>{agent.description}</p>

            {/* ── Current task ── */}
            <div className={styles.taskRow}>
                <span className={styles.taskLabel}>Current Task</span>
                <span className={styles.taskValue}>{agent.currentTask}</span>
            </div>

            {/* ── Progress bar (only when busy or partial) ── */}
            {agent.progress > 0 && (
                <div
                    className={styles.progressTrack}
                    role="progressbar"
                    aria-valuenow={agent.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${agent.fullName}: ${agent.progress}%`}
                >
                    <div
                        className={styles.progressFill}
                        style={{
                            width: `${agent.progress}%`,
                            "--agent-color": agent.color,
                        }}
                    />
                    <span className={styles.progressLabel}>{agent.progress}%</span>
                </div>
            )}

            {/* ── Actions ── */}
            <div className={styles.actions}>
                <Button
                    variant="primary"
                    size="sm"
                    disabled={isBusy || isOnline}
                    onClick={() => onStart(agent.id)}
                    aria-label={`Start ${agent.fullName}`}
                >
                    ▶ Start
                </Button>
                <Button
                    variant="danger"
                    size="sm"
                    disabled={isOffline}
                    onClick={() => onStop(agent.id)}
                    aria-label={`Stop ${agent.fullName}`}
                >
                    ■ Stop
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(agent.id)}
                    aria-label={`View details for ${agent.fullName}`}
                    className={styles.detailsBtn}
                >
                    View Details →
                </Button>
            </div>
        </GlassCard>
    );
}

/* ═══════════════════════════════════════════════════════════
   DETAIL MODAL (lightweight inline panel)
═══════════════════════════════════════════════════════════ */

function DetailPanel({ agent, onClose }) {
    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${agent.fullName}`}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <GlassCard blur="lg" padding="lg" hover={false} bordered className={styles.panel}>
                {/* Header */}
                <div className={styles.panelHeader}>
                    <div className={styles.panelMeta}>
                        <div
                            className={styles.panelIcon}
                            aria-hidden="true"
                            style={{ "--agent-color": agent.color }}
                        >
                            {agent.icon}
                        </div>
                        <div>
                            <h2 className={styles.panelName}>{agent.fullName}</h2>
                            <span className={styles.panelRole}>{agent.role}</span>
                        </div>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close details panel"
                    >
                        ✕
                    </button>
                </div>

                {/* Status row */}
                <div className={styles.panelRow}>
                    <span className={styles.panelKey}>Status</span>
                    <Badge variant={agent.statusVariant} dot pulse={agent.status === "busy"}>
                        {agent.status}
                    </Badge>
                </div>

                {/* Description */}
                <div className={styles.panelSection}>
                    <span className={styles.panelKey}>Description</span>
                    <p className={styles.panelDesc}>{agent.description}</p>
                </div>

                {/* Current task */}
                <div className={styles.panelRow}>
                    <span className={styles.panelKey}>Current Task</span>
                    <span className={styles.panelVal}>{agent.currentTask}</span>
                </div>

                {/* Progress */}
                {agent.progress > 0 && (
                    <div className={styles.panelSection}>
                        <span className={styles.panelKey}>Progress</span>
                        <div
                            className={styles.progressTrack}
                            role="progressbar"
                            aria-valuenow={agent.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${agent.fullName}: ${agent.progress}%`}
                        >
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${agent.progress}%`,
                                    "--agent-color": agent.color,
                                }}
                            />
                            <span className={styles.progressLabel}>{agent.progress}%</span>
                        </div>
                    </div>
                )}

                <div className={styles.panelFooter}>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   AGENTS PAGE
═══════════════════════════════════════════════════════════ */

function Agents() {
    const [agents, setAgents]       = useState(INITIAL_AGENTS);
    const [search, setSearch]       = useState("");
    const [filter, setFilter]       = useState("All");
    const [detail, setDetail]       = useState(null); // agent id

    /* ── Derived list ── */
    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return agents.filter((a) => {
            const matchSearch =
                !q ||
                a.fullName.toLowerCase().includes(q) ||
                a.role.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q);
            const matchFilter = filter === "All" || a.status === filter;
            return matchSearch && matchFilter;
        });
    }, [agents, search, filter]);

    /* ── Status counts for filter chips ── */
    const counts = useMemo(() => {
        const c = { All: agents.length, online: 0, busy: 0, offline: 0 };
        agents.forEach((a) => {
            if (a.status in c) c[a.status]++;
        });
        return c;
    }, [agents]);

    /* ── Actions ── */
    function handleStart(id) {
        setAgents((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, status: "online", statusVariant: "success" } : a
            )
        );
    }

    function handleStop(id) {
        setAgents((prev) =>
            prev.map((a) =>
                a.id === id
                    ? { ...a, status: "offline", statusVariant: "ghost", currentTask: "Idle — stopped", progress: 0 }
                    : a
            )
        );
    }

    const activeDetail = detail ? agents.find((a) => a.id === detail) : null;

    return (
        <>
            <div className={styles.page}>

                {/* ── Page header ── */}
                <header className={styles.pageHeader}>
                    <div className={styles.headerText}>
                        <h1 className={styles.pageTitle}>
                            <span aria-hidden="true">⬡</span> AI Agents
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Monitor, start, and stop your intelligent agents.
                        </p>
                    </div>
                    <div className={styles.headerMeta}>
                        <Badge variant="success" dot pulse>
                            {counts.online + counts.busy} active
                        </Badge>
                        <Badge variant="ghost">{counts.offline} idle</Badge>
                    </div>
                </header>

                {/* ── Toolbar: Search + Filter ── */}
                <div className={styles.toolbar}>
                    <SearchBar
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search agents…"
                        className={styles.searchBar}
                    />

                    <div className={styles.filters} role="group" aria-label="Filter agents by status">
                        {FILTER_OPTIONS.map((f) => (
                            <button
                                key={f}
                                className={[
                                    styles.filterChip,
                                    filter === f ? styles.filterActive : "",
                                ].join(" ")}
                                onClick={() => setFilter(f)}
                                aria-pressed={filter === f}
                            >
                                {FILTER_LABELS[f]}
                                <span className={styles.chipCount}>{counts[f]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Agent cards grid ── */}
                {visible.length > 0 ? (
                    <ul className={styles.grid} role="list" aria-label="Agent list">
                        {visible.map((agent, i) => (
                            <li
                                key={agent.id}
                                style={{ animationDelay: `${i * 0.06}s` }}
                                className={styles.gridItem}
                            >
                                <AgentCard
                                    agent={agent}
                                    onStart={handleStart}
                                    onStop={handleStop}
                                    onViewDetails={(id) => setDetail(id)}
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className={styles.empty} role="status">
                        <span aria-hidden="true">⬡</span>
                        <p>No agents match your search.</p>
                    </div>
                )}
            </div>

            {/* ── Detail overlay ── */}
            {activeDetail && (
                <DetailPanel
                    agent={activeDetail}
                    onClose={() => setDetail(null)}
                />
            )}
        </>
    );
}

export default Agents;
