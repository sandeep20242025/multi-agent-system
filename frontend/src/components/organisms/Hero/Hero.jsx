import { useId } from "react";
import clsx from "clsx";

import Button   from "@/components/atoms/Button";
import GlassCard from "@/components/atoms/GlassCard";
import Badge    from "@/components/atoms/Badge";

import styles from "./Hero.module.css";

/* ─────────────────────────────────────────────────────────
   AGENT NETWORK DATA
   Pure UI — no business logic, no backend.
───────────────────────────────────────────────────────── */
const AGENTS = [
    {
        id:     "planner",
        label:  "Planner",
        role:   "Task orchestration",
        icon:   "⬡",
        status: "active",
    },
    {
        id:     "research",
        label:  "Research",
        role:   "Data retrieval",
        icon:   "◎",
        status: "active",
    },
    {
        id:     "analyzer",
        label:  "Analyzer",
        role:   "Pattern recognition",
        icon:   "◈",
        status: "processing",
    },
    {
        id:     "writer",
        label:  "Writer",
        role:   "Content generation",
        icon:   "◇",
        status: "idle",
    },
    {
        id:     "reviewer",
        label:  "Reviewer",
        role:   "Quality assurance",
        icon:   "◉",
        status: "idle",
    },
];

/* Map status → Badge variant */
const STATUS_VARIANT = {
    active:     "success",
    processing: "primary",
    idle:       "ghost",
};

/* Map status → readable label */
const STATUS_LABEL = {
    active:     "Active",
    processing: "Processing",
    idle:       "Standby",
};

/**
 * Hero — Organism
 *
 * Two-column landing section for an AI Multi-Agent System.
 * Left: headline copy + CTA.  Right: agent network visualisation.
 * Transparent background — designed to sit over AnimatedBackground.
 *
 * Props
 * ─────
 *   title           — string       Main heading text.
 *   subtitle        — string       Short italicised accent line above title.
 *   description     — string       Body copy below the heading.
 *   primaryAction   — { label, onClick, icon? }
 *   secondaryAction — { label, onClick, icon? }
 *   className       — string       Extra class on the <section> root.
 */
function Hero({
    title           = "Multi-Agent\nAI Workspace",
    subtitle        = "AI Powered",
    description     = "Orchestrate intelligent agents that plan, research, analyze, write, and review — all working in concert to solve complex problems autonomously.",
    primaryAction   = { label: "Launch Workspace" },
    secondaryAction = { label: "Learn More" },
    className,
}) {
    const headingId = useId();

    /* Split title on \n so each line can be styled separately */
    const titleLines = title.split("\n");

    return (
        <section
            className={clsx(styles.section, className)}
            aria-labelledby={headingId}
        >
            <div className={styles.grid}>

                {/* ══════════════════════════════════════
                    LEFT COLUMN — Copy & CTAs
                ══════════════════════════════════════ */}
                <div className={styles.left}>

                    {/* Eyebrow badge */}
                    {subtitle && (
                        <Badge
                            variant="primary"
                            dot
                            pulse
                            className={styles.badge}
                        >
                            {subtitle}
                        </Badge>
                    )}

                    {/* Heading */}
                    <h1 id={headingId} className={styles.title}>
                        {titleLines.map((line, i) => (
                            <span
                                key={i}
                                className={clsx(
                                    styles.titleLine,
                                    i === 1 && styles.titleLineAccent
                                )}
                            >
                                {line}
                            </span>
                        ))}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className={styles.description}>{description}</p>
                    )}

                    {/* CTA buttons */}
                    <div className={styles.cta}>
                        {primaryAction?.label && (
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={primaryAction.onClick}
                                leftIcon={primaryAction.icon}
                                className={styles.ctaPrimary}
                            >
                                {primaryAction.label}
                            </Button>
                        )}
                        {secondaryAction?.label && (
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={secondaryAction.onClick}
                                leftIcon={secondaryAction.icon}
                            >
                                {secondaryAction.label}
                            </Button>
                        )}
                    </div>

                    {/* Stat strip */}
                    <dl className={styles.stats}>
                        <div className={styles.stat}>
                            <dt className={styles.statLabel}>Agents</dt>
                            <dd className={styles.statValue}>5+</dd>
                        </div>
                        <div className={styles.statDivider} aria-hidden="true" />
                        <div className={styles.stat}>
                            <dt className={styles.statLabel}>Capabilities</dt>
                            <dd className={styles.statValue}>∞</dd>
                        </div>
                        <div className={styles.statDivider} aria-hidden="true" />
                        <div className={styles.stat}>
                            <dt className={styles.statLabel}>Latency goal</dt>
                            <dd className={styles.statValue}>0ms</dd>
                        </div>
                    </dl>
                </div>

                {/* ══════════════════════════════════════
                    RIGHT COLUMN — Agent Network Card
                ══════════════════════════════════════ */}
                <div className={styles.right} aria-label="Agent network diagram">
                    <GlassCard
                        blur="lg"
                        padding="lg"
                        hover={false}
                        bordered
                        className={styles.networkCard}
                    >
                        {/* Card header */}
                        <div className={styles.networkHeader}>
                            <span className={styles.networkTitle}>
                                Agent Network
                            </span>
                            <Badge variant="success" dot pulse>
                                Online
                            </Badge>
                        </div>

                        {/* Agent list with connector lines */}
                        <ol className={styles.agentList} aria-label="Active agents">
                            {AGENTS.map((agent, index) => (
                                <li key={agent.id} className={styles.agentItem}>

                                    {/* Connector line above (skipped for first) */}
                                    {index > 0 && (
                                        <div
                                            className={styles.connector}
                                            aria-hidden="true"
                                        >
                                            <div className={styles.connectorLine} />
                                            <div
                                                className={styles.connectorPulse}
                                                style={{
                                                    animationDelay: `${index * 0.3}s`,
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Agent node */}
                                    <div
                                        className={clsx(
                                            styles.agentNode,
                                            styles[`node_${agent.status}`]
                                        )}
                                        style={{
                                            animationDelay: `${index * 0.15}s`,
                                        }}
                                    >
                                        {/* Icon box */}
                                        <div
                                            className={styles.agentIcon}
                                            aria-hidden="true"
                                        >
                                            {agent.icon}
                                        </div>

                                        {/* Text */}
                                        <div className={styles.agentInfo}>
                                            <span className={styles.agentLabel}>
                                                {agent.label}
                                            </span>
                                            <span className={styles.agentRole}>
                                                {agent.role}
                                            </span>
                                        </div>

                                        {/* Status badge */}
                                        <Badge
                                            variant={STATUS_VARIANT[agent.status]}
                                            dot={agent.status === "active"}
                                            pulse={agent.status === "active"}
                                            className={styles.agentStatus}
                                        >
                                            {STATUS_LABEL[agent.status]}
                                        </Badge>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        {/* Card footer — system line */}
                        <div className={styles.networkFooter} aria-hidden="true">
                            <span className={styles.footerDot} />
                            <span className={styles.footerText}>
                                Multi-Agent Runtime v2.0
                            </span>
                            <span className={styles.footerDot} />
                        </div>
                    </GlassCard>
                </div>

            </div>

            {/* Scroll hint */}
            <div className={styles.scrollHint} aria-hidden="true">
                <span className={styles.scrollLabel}>Scroll</span>
                <span className={styles.scrollArrow} />
            </div>
        </section>
    );
}

export default Hero;
