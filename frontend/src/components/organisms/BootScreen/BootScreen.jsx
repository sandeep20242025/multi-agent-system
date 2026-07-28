import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./BootScreen.module.css";

/* ─────────────────────────────────────────────────────────
   BootScreen — Organism
   Premium AI OS boot sequence. Two-panel layout:
     Left  — logo mark, project name, version, runtime status
     Right — live scrolling boot log + progress bar
   Calls onComplete() after the last step then fades out.

   Props
   ─────
   onComplete    () => void    called when boot finishes
   projectName   string        (default: "AI Workspace")
   version       string        (default: "2.0.0")
   logo          ReactNode     custom logo mark; defaults to ◈ ring
   duration      number        ms between log steps (default: 700)
   className     string
───────────────────────────────────────────────────────── */

const BOOT_STEPS = [
    { id: "core",      text: "Initializing AI Core…",        category: "SYSTEM"  },
    { id: "neural",    text: "Loading Neural Engine…",        category: "ENGINE"  },
    { id: "memory",    text: "Connecting Memory…",            category: "SYSTEM"  },
    { id: "planner",   text: "Starting Planner Agent…",       category: "AGENT"   },
    { id: "research",  text: "Starting Research Agent…",      category: "AGENT"   },
    { id: "analyzer",  text: "Starting Analyzer Agent…",      category: "AGENT"   },
    { id: "writer",    text: "Starting Writer Agent…",        category: "AGENT"   },
    { id: "reviewer",  text: "Starting Reviewer Agent…",      category: "AGENT"   },
    { id: "workspace", text: "Synchronizing Workspace…",      category: "SYSTEM"  },
    { id: "ready",     text: "System Ready",                  category: "STATUS"  },
];

const CATEGORY_VARIANT = {
    SYSTEM: "system",
    ENGINE: "engine",
    AGENT:  "agent",
    STATUS: "status",
};

/* Timestamp helper — HH:MM:SS */
function timestamp() {
    return new Date().toLocaleTimeString("en-US", {
        hour:   "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

/* ── Default logo mark ────────────────────────────────── */
function DefaultLogo() {
    return (
        <div className={styles.logoRingWrap} aria-hidden="true">
            <div className={styles.ringOuter} />
            <div className={styles.ringInner} />
            <div className={styles.ringCore}  />
            <span className={styles.logoSymbol}>◈</span>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
function BootScreen({
    onComplete,
    projectName = "AI Workspace",
    version     = "2.0.0",
    logo,
    duration    = 700,
    className,
}) {
    /* visibleSteps: array of { ...step, ts } entries revealed so far */
    const [visibleSteps, setVisibleSteps] = useState([]);
    const [progress,     setProgress]     = useState(0);
    const [exiting,      setExiting]      = useState(false);

    const timerRef  = useRef(null);
    const logEndRef = useRef(null);

    const total = BOOT_STEPS.length;

    /* Scroll log to bottom whenever a new line appears */
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [visibleSteps.length]);

    /* Boot sequence ticker */
    useEffect(() => {
        let step = 0;

        function tick() {
            if (step >= total) {
                /* All steps done — trigger fade-out then call onComplete */
                timerRef.current = setTimeout(() => {
                    setExiting(true);
                    timerRef.current = setTimeout(() => {
                        onComplete?.();
                    }, 700); /* match CSS fade-out duration */
                }, 400);
                return;
            }

            const current = BOOT_STEPS[step];
            step += 1;

            setVisibleSteps((prev) => [
                ...prev,
                { ...current, ts: timestamp() },
            ]);
            setProgress(Math.round((step / total) * 100));

            timerRef.current = setTimeout(tick, duration);
        }

        /* Initial delay so mount animation is visible */
        timerRef.current = setTimeout(tick, 350);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [total, duration, onComplete]);

    const isDone  = useCallback((i) => i < visibleSteps.length - 1, [visibleSteps.length]);
    const isLast  = useCallback((i) => i === visibleSteps.length - 1, [visibleSteps.length]);

    const done    = progress === 100;
    const logoNode = logo ?? <DefaultLogo />;

    return (
        <div
            className={clsx(styles.overlay, exiting && styles.overlayExit, className)}
            role="status"
            aria-label="AI system initializing, please wait"
            aria-live="polite"
            aria-busy={!done}
        >
            {/* ── Ambient background layers ──────────── */}
            <div className={styles.bgGlow1}  aria-hidden="true" />
            <div className={styles.bgGlow2}  aria-hidden="true" />
            <div className={styles.scanLine} aria-hidden="true" />
            <div className={styles.grid}     aria-hidden="true" />

            {/* ── Two-panel card ─────────────────────── */}
            <div className={styles.card}>

                {/* ════════════════════════════════════
                    LEFT PANEL — Identity & Status
                ════════════════════════════════════ */}
                <div className={styles.leftPanel}>

                    {/* Logo */}
                    <div className={styles.logoArea}>
                        {logoNode}
                    </div>

                    {/* Project name + version */}
                    <div className={styles.identity}>
                        <span className={styles.projectName}>{projectName}</span>
                        <span className={styles.versionTag}>v{version}</span>
                    </div>

                    {/* System diagnostics table */}
                    <dl className={styles.diagList} aria-label="System diagnostics">
                        <div className={styles.diagRow}>
                            <dt className={styles.diagKey}>Runtime</dt>
                            <dd className={styles.diagVal}>
                                <span className={clsx(styles.indicator, done && styles.indicatorActive)} aria-hidden="true" />
                                {done ? "Online" : "Starting"}
                            </dd>
                        </div>
                        <div className={styles.diagRow}>
                            <dt className={styles.diagKey}>Agents</dt>
                            <dd className={styles.diagVal}>
                                {/* Count of agent steps revealed */}
                                {visibleSteps.filter(s => s.category === "AGENT").length} / 5
                            </dd>
                        </div>
                        <div className={styles.diagRow}>
                            <dt className={styles.diagKey}>Core</dt>
                            <dd className={styles.diagVal}>
                                {visibleSteps.length > 0 ? "Loaded" : "Pending"}
                            </dd>
                        </div>
                        <div className={styles.diagRow}>
                            <dt className={styles.diagKey}>Memory</dt>
                            <dd className={styles.diagVal}>
                                {visibleSteps.some(s => s.id === "memory") ? "Connected" : "—"}
                            </dd>
                        </div>
                    </dl>

                    {/* Progress bar lives in the left panel */}
                    <div className={styles.progressArea}>
                        <div
                            className={styles.progressTrack}
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Boot progress ${progress} percent`}
                        >
                            <div
                                className={styles.progressFill}
                                style={{ width: `${progress}%` }}
                            />
                            {progress > 0 && progress < 100 && (
                                <div
                                    className={styles.progressHead}
                                    style={{ left: `${progress}%` }}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                        <div className={styles.progressMeta} aria-hidden="true">
                            <span className={styles.progressLabel}>
                                {done ? "READY" : "INITIALIZING"}
                            </span>
                            <span className={styles.progressPct}>{progress}%</span>
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════
                    RIGHT PANEL — Live Boot Log
                ════════════════════════════════════ */}
                <div className={styles.rightPanel}>

                    {/* Panel header */}
                    <div className={styles.logHeader} aria-hidden="true">
                        <span className={styles.logHeaderTitle}>Boot Log</span>
                        <span className={styles.logHeaderDots}>
                            <span className={styles.logDot} style={{ background: "var(--danger)" }} />
                            <span className={styles.logDot} style={{ background: "var(--warning)" }} />
                            <span className={styles.logDot} style={{ background: "var(--success)" }} />
                        </span>
                    </div>

                    {/* Scrollable log body */}
                    <div
                        className={styles.logBody}
                        aria-label="Boot log"
                        aria-relevant="additions"
                        aria-atomic="false"
                    >
                        {visibleSteps.map((step, i) => (
                            <div
                                key={step.id}
                                className={clsx(
                                    styles.logLine,
                                    styles[`cat_${CATEGORY_VARIANT[step.category]}`],
                                    isDone(i) && styles.logLineDone,
                                    isLast(i) && styles.logLineLast,
                                )}
                            >
                                <span className={styles.logTs} aria-hidden="true">
                                    {step.ts}
                                </span>
                                <span
                                    className={clsx(
                                        styles.logCat,
                                        styles[`catLabel_${CATEGORY_VARIANT[step.category]}`]
                                    )}
                                    aria-hidden="true"
                                >
                                    {step.category}
                                </span>
                                <span className={styles.logText}>{step.text}</span>
                                {isDone(i) && (
                                    <span className={styles.logOk} aria-hidden="true">
                                        ✓
                                    </span>
                                )}
                                {isLast(i) && !done && (
                                    <span className={styles.cursor} aria-hidden="true" />
                                )}
                            </div>
                        ))}

                        {/* Auto-scroll anchor */}
                        <div ref={logEndRef} aria-hidden="true" />
                    </div>

                    {/* Log footer status line */}
                    <div className={styles.logFooter} aria-hidden="true">
                        <span className={styles.logFooterDot} />
                        <span className={styles.logFooterText}>
                            {done
                                ? "All systems nominal"
                                : `Step ${visibleSteps.length} of ${total}`}
                        </span>
                    </div>
                </div>

            </div>{/* /card */}
        </div>
    );
}

export default BootScreen;
