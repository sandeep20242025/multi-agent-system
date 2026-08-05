import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import AnimatedBackground from "@/components/organisms/AnimatedBackground";
import Navbar             from "@/components/organisms/Navbar";
import Hero               from "@/components/organisms/Hero";
import Footer             from "@/components/organisms/Footer";
import GlassCard          from "@/components/atoms/GlassCard";
import Badge              from "@/components/atoms/Badge";
import Button             from "@/components/atoms/Button";

import ROUTES from "@/constants/routes";

import "./styles.css";

/* ─────────────────────────────────────────────────────────
   STATIC DATA  — defined outside component, never re-created
───────────────────────────────────────────────────────── */

const NAV_ITEMS = [
    { label: "Features",  href: "#features"  },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Agents",    href: "#agents"    },
    { label: "Stack",     href: "#stack"     },
];

/* ── Features ─────────────────────────────────────────── */
const FEATURES = [
    {
        id:          "planning",
        icon:        "⬡",
        title:       "Intelligent Planning",
        description: "Decompose complex tasks into structured sub-goals. The Planner agent coordinates the full pipeline before any execution begins.",
        badge:       "Core",
        badgeVariant:"primary",
    },
    {
        id:          "research",
        icon:        "◎",
        title:       "Deep Research",
        description: "Retrieve, rank, and synthesize information from structured knowledge sources with semantic precision.",
        badge:       "Active",
        badgeVariant:"success",
    },
    {
        id:          "analysis",
        icon:        "◈",
        title:       "Pattern Analysis",
        description: "Surface insights, detect anomalies, and extract structured signal from unstructured data in real time.",
        badge:       "Active",
        badgeVariant:"success",
    },
    {
        id:          "writing",
        icon:        "◇",
        title:       "Content Generation",
        description: "Produce polished, context-aware content across any format — reports, code, summaries, or long-form documents.",
        badge:       "Active",
        badgeVariant:"success",
    },
    {
        id:          "memory",
        icon:        "◉",
        title:       "Persistent Memory",
        description: "Agents retain and reference prior context across sessions, enabling iterative refinement without restating the problem.",
        badge:       "v2",
        badgeVariant:"default",
    },
];

/* ── How It Works timeline ────────────────────────────── */
const TIMELINE = [
    { id: "prompt",   label: "User Prompt",     icon: "◈", desc: "You describe the task" },
    { id: "planner",  label: "Planner",          icon: "⬡", desc: "Breaks it into sub-goals" },
    { id: "research", label: "Researcher",       icon: "◎", desc: "Gathers relevant data" },
    { id: "analyzer", label: "Analyzer",         icon: "◈", desc: "Extracts patterns & insights" },
    { id: "writer",   label: "Writer",           icon: "◇", desc: "Generates polished output" },
    { id: "reviewer", label: "Reviewer",         icon: "◉", desc: "Validates quality & accuracy" },
    { id: "response", label: "Final Response",   icon: "✦", desc: "Delivered to you" },
];

/* ── AI Agents ────────────────────────────────────────── */
const AGENTS = [
    {
        id:          "planner",
        name:        "Planner Agent",
        role:        "Orchestration",
        icon:        "⬡",
        description: "Decomposes your goal into a directed task graph and coordinates all downstream agents.",
        status:      "active",
        capabilities: ["Task decomposition", "Agent routing", "Context injection"],
    },
    {
        id:          "research",
        name:        "Research Agent",
        role:        "Data Retrieval",
        icon:        "◎",
        description: "Queries knowledge bases, ranks sources by relevance, and distills information into structured facts.",
        status:      "active",
        capabilities: ["Semantic search", "Source ranking", "Fact extraction"],
    },
    {
        id:          "analyzer",
        name:        "Analyzer Agent",
        role:        "Pattern Recognition",
        icon:        "◈",
        description: "Runs statistical and semantic analysis on retrieved data to surface non-obvious insights.",
        status:      "processing",
        capabilities: ["Trend detection", "Anomaly analysis", "Insight generation"],
    },
    {
        id:          "writer",
        name:        "Writer Agent",
        role:        "Content Generation",
        icon:        "◇",
        description: "Transforms structured analysis into fluent, audience-appropriate prose across any format.",
        status:      "active",
        capabilities: ["Multi-format output", "Tone adaptation", "Citation formatting"],
    },
    {
        id:          "reviewer",
        name:        "Reviewer Agent",
        role:        "Quality Assurance",
        icon:        "◉",
        description: "Validates factual accuracy, logical consistency, and output quality before delivery.",
        status:      "active",
        capabilities: ["Fact checking", "Logic validation", "Quality scoring"],
    },
];

/* ── Tech Stack ───────────────────────────────────────── */
const STACK = [
    {
        id:       "frontend",
        layer:    "Frontend",
        tech:     "React",
        detail:   "Vite + React 19 + CSS Modules",
        icon:     "⚛",
        variant:  "primary",
    },
    {
        id:       "backend",
        layer:    "Backend",
        tech:     "FastAPI",
        detail:   "Python async API gateway",
        icon:     "⚡",
        variant:  "success",
    },
    {
        id:       "database",
        layer:    "Database",
        tech:     "Supabase",
        detail:   "PostgreSQL + real-time subscriptions",
        icon:     "◈",
        variant:  "warning",
    },
    {
        id:       "ai",
        layer:    "AI",
        tech:     "Google Gemini",
        detail:   "Multi-modal large language model",
        icon:     "✦",
        variant:  "default",
    },
];

const STATUS_VARIANT = {
    active:     "success",
    processing: "primary",
    idle:       "ghost",
};

/* ─────────────────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────────────────── */
function Landing() {
    const navigate = useNavigate();

    const goToWorkspace = useCallback(() => navigate(ROUTES.WORKSPACE), [navigate]);
    const goToRegister  = useCallback(() => navigate(ROUTES.REGISTER),  [navigate]);

    return (
        <AnimatedBackground showParticles showGrid showNoise>

            {/* ── Navigation ─────────────────────────── */}
            <Navbar
                navigationItems={NAV_ITEMS}
                title="AI Workspace"
                subtitle="Multi-Agent System"
                showSearch={false}
                sticky
            />

            {/* ── Hero ───────────────────────────────── */}
            <Hero
                title={"Multi-Agent\nAI Workspace"}
                subtitle="IBM SkillsBuild Hackathon"
                description="Orchestrate intelligent agents that plan, research, analyze, write, and review — working in concert to solve complex problems autonomously."
                primaryAction={{
                    label:   "Launch Workspace",
                    onClick: goToWorkspace,
                    icon:    "▶",
                }}
                secondaryAction={{
                    label:   "Get Started",
                    onClick: goToRegister,
                }}
            />

            {/* ══════════════════════════════════════════
                FEATURES SECTION
            ══════════════════════════════════════════ */}
            <section
                id="features"
                className="landing-section"
                aria-labelledby="features-heading"
            >
                <div className="section-inner">
                    <header className="section-header">
                        <Badge variant="primary" dot>Capabilities</Badge>
                        <h2 id="features-heading" className="section-title">
                            What the System Can Do
                        </h2>
                        <p className="section-subtitle">
                            Five purpose-built cognitive capabilities, each delivered
                            by a dedicated specialist agent.
                        </p>
                    </header>

                    <ul className="feature-grid" role="list">
                        {FEATURES.map((f) => (
                            <li key={f.id}>
                                <GlassCard
                                    blur="md"
                                    padding="lg"
                                    hover
                                    bordered
                                    className="feature-card"
                                >
                                    <div className="feature-icon-row">
                                        <span className="feature-icon" aria-hidden="true">
                                            {f.icon}
                                        </span>
                                        <Badge variant={f.badgeVariant}>
                                            {f.badge}
                                        </Badge>
                                    </div>
                                    <h3 className="feature-title">{f.title}</h3>
                                    <p className="feature-desc">{f.description}</p>
                                </GlassCard>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════════ */}
            <section
                id="how-it-works"
                className="landing-section landing-section--alt"
                aria-labelledby="how-heading"
            >
                <div className="section-inner">
                    <header className="section-header">
                        <Badge variant="success" dot>Pipeline</Badge>
                        <h2 id="how-heading" className="section-title">
                            How It Works
                        </h2>
                        <p className="section-subtitle">
                            A single prompt triggers a fully autonomous multi-agent
                            pipeline from planning to delivery.
                        </p>
                    </header>

                    {/* Horizontal scrollable timeline */}
                    <div
                        className="timeline-scroll"
                        role="list"
                        aria-label="Agent pipeline steps"
                    >
                        {TIMELINE.map((step, i) => (
                            <div
                                key={step.id}
                                className="timeline-step"
                                role="listitem"
                            >
                                {/* Connector line before every step except first */}
                                {i > 0 && (
                                    <div className="timeline-connector" aria-hidden="true">
                                        <div className="timeline-line" />
                                        <div
                                            className="timeline-pulse"
                                            style={{ animationDelay: `${i * 0.35}s` }}
                                        />
                                    </div>
                                )}

                                <GlassCard
                                    blur="sm"
                                    padding="md"
                                    hover={false}
                                    bordered
                                    className={
                                        i === 0 || i === TIMELINE.length - 1
                                            ? "timeline-card timeline-card--endpoint"
                                            : "timeline-card"
                                    }
                                >
                                    <div className="timeline-node" aria-hidden="true">
                                        <span className="timeline-icon">{step.icon}</span>
                                    </div>
                                    <span className="timeline-label">{step.label}</span>
                                    <span className="timeline-desc">{step.desc}</span>
                                </GlassCard>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                AI AGENTS SECTION
            ══════════════════════════════════════════ */}
            <section
                id="agents"
                className="landing-section"
                aria-labelledby="agents-heading"
            >
                <div className="section-inner">
                    <header className="section-header">
                        <Badge variant="primary" dot pulse>Live Agents</Badge>
                        <h2 id="agents-heading" className="section-title">
                            Meet the Agents
                        </h2>
                        <p className="section-subtitle">
                            Each agent is a specialist. Together they form an
                            autonomous, self-correcting intelligence network.
                        </p>
                    </header>

                    <ul className="agent-grid" role="list">
                        {AGENTS.map((agent) => (
                            <li key={agent.id}>
                                <GlassCard
                                    blur="md"
                                    padding="lg"
                                    hover
                                    bordered
                                    className="agent-card"
                                >
                                    {/* Header row */}
                                    <div className="agent-header">
                                        <div className="agent-icon-wrap" aria-hidden="true">
                                            <span className="agent-icon">{agent.icon}</span>
                                        </div>
                                        <div className="agent-meta">
                                            <span className="agent-name">{agent.name}</span>
                                            <span className="agent-role">{agent.role}</span>
                                        </div>
                                        <Badge
                                            variant={STATUS_VARIANT[agent.status]}
                                            dot={agent.status === "active"}
                                            pulse={agent.status === "active"}
                                        >
                                            {agent.status === "active"
                                                ? "Active"
                                                : agent.status === "processing"
                                                    ? "Processing"
                                                    : "Standby"}
                                        </Badge>
                                    </div>

                                    <p className="agent-desc">{agent.description}</p>

                                    {/* Capability chips */}
                                    <ul
                                        className="agent-caps"
                                        role="list"
                                        aria-label={`${agent.name} capabilities`}
                                    >
                                        {agent.capabilities.map((cap) => (
                                            <li key={cap} className="agent-cap">
                                                {cap}
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                TECHNOLOGY STACK
            ══════════════════════════════════════════ */}
            <section
                id="stack"
                className="landing-section landing-section--alt"
                aria-labelledby="stack-heading"
            >
                <div className="section-inner">
                    <header className="section-header">
                        <Badge variant="default">Built With</Badge>
                        <h2 id="stack-heading" className="section-title">
                            Technology Stack
                        </h2>
                        <p className="section-subtitle">
                            Production-grade technologies chosen for performance,
                            reliability, and AI-native development.
                        </p>
                    </header>

                    <ul className="stack-grid" role="list">
                        {STACK.map((s) => (
                            <li key={s.id}>
                                <GlassCard
                                    blur="sm"
                                    padding="lg"
                                    hover
                                    bordered
                                    className="stack-card"
                                >
                                    <div className="stack-icon-row">
                                        <span className="stack-icon" aria-hidden="true">
                                            {s.icon}
                                        </span>
                                        <Badge variant={s.variant}>{s.layer}</Badge>
                                    </div>
                                    <span className="stack-tech">{s.tech}</span>
                                    <span className="stack-detail">{s.detail}</span>
                                </GlassCard>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                CALL TO ACTION
            ══════════════════════════════════════════ */}
            <section
                className="landing-section landing-cta"
                aria-labelledby="cta-heading"
            >
                <div className="section-inner">
                    <GlassCard
                        blur="lg"
                        padding="lg"
                        hover={false}
                        bordered
                        className="cta-card"
                    >
                        {/* Glow orbs inside CTA card */}
                        <div className="cta-glow cta-glow--left"  aria-hidden="true" />
                        <div className="cta-glow cta-glow--right" aria-hidden="true" />

                        <Badge variant="primary" dot pulse>Ready to Build</Badge>

                        <h2 id="cta-heading" className="cta-title">
                            Start Building with{" "}
                            <span className="cta-title-accent">AI</span>
                        </h2>
                        <p className="cta-subtitle">
                            Deploy your multi-agent workspace in minutes.
                            No configuration required.
                        </p>

                        <div className="cta-actions">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={goToRegister}
                                aria-label="Get started with AI Workspace"
                            >
                                Get Started
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={goToWorkspace}
                                aria-label="Open the workspace"
                            >
                                Open Workspace
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────── */}
            <Footer
                projectName="AI Workspace"
                version="2.0.0"
                showLinks
                showStatus
            />

        </AnimatedBackground>
    );
}

export default Landing;
