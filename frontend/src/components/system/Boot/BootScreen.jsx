import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./BootScreen.module.css";

const DEFAULT_MESSAGES = [
    "Initializing core modules…",
    "Loading agent registry…",
    "Establishing secure context…",
    "Calibrating response matrix…",
    "System ready.",
];

/**
 * BootScreen — System/Boot
 *
 * Full-featured boot screen with render-prop slots for every visual region.
 * Does NOT implement real application loading — purely a UI / timing engine.
 *
 * ── Props ────────────────────────────────────────────────────────────────
 *
 *   messages    — string[]    log lines           (default: 5 boot steps)
 *   prefix      — string      log prefix          (default: "[SYS]")
 *   duration    — number      ms per step         (default: 600)
 *   onComplete  — () => void  called after last step
 *   className   — string
 *
 * ── Slot props (render props) ─────────────────────────────────────────────
 *
 *   logoSlot      — ReactNode | (state) => ReactNode
 *                   Replace the default spinning-ring logo block.
 *                   Receives { progress, step, total }.
 *
 *   loadingSlot   — ReactNode | (state) => ReactNode
 *                   Content rendered between the logo and the log.
 *                   Receives { progress, step, total }.
 *
 *   progressSlot  — ReactNode | (state) => ReactNode
 *                   Replace the default progress bar.
 *                   Receives { progress, step, total }.
 *
 * ── Slot usage ────────────────────────────────────────────────────────────
 *
 *   // Use default for everything
 *   <BootScreen onComplete={...} />
 *
 *   // Custom logo
 *   <BootScreen logoSlot={<MyLogo />} onComplete={...} />
 *
 *   // Custom progress bar with progress state
 *   <BootScreen
 *     progressSlot={({ progress }) => <MyProgressBar value={progress} />}
 *     onComplete={...}
 *   />
 */
function BootScreen({
    messages     = DEFAULT_MESSAGES,
    prefix       = "[SYS]",
    duration     = 600,
    onComplete,
    className,
    logoSlot,
    loadingSlot,
    progressSlot,
}) {
    const [visibleCount, setVisibleCount] = useState(0);
    const [progress,     setProgress]     = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        let step = 0;
        const total = messages.length;

        function tick() {
            if (step >= total) {
                onComplete?.();
                return;
            }
            step += 1;
            setVisibleCount(step);
            setProgress(Math.round((step / total) * 100));
            timerRef.current = setTimeout(tick, duration);
        }

        timerRef.current = setTimeout(tick, 320);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [messages, duration, onComplete]);

    /* State object passed to slot render-props */
    const slotState = { progress, step: visibleCount, total: messages.length };

    /* Resolve slot — accepts ReactNode or (state) => ReactNode */
    function resolveSlot(slot, fallback) {
        if (slot === undefined) return fallback;
        return typeof slot === "function" ? slot(slotState) : slot;
    }

    const isLast = (i) => i === visibleCount - 1;
    const isDone = (i) => i < visibleCount - 1;

    /* ── Default logo ─────────────────────────────────── */
    const defaultLogo = (
        <div className={styles.logoSlot}>
            <div className={styles.ringWrap} aria-hidden="true">
                <div className={styles.ringOuter} />
                <div className={styles.ringInner} />
                <div className={styles.ringGlow}  />
                <span className={styles.logoSymbol}>◈</span>
            </div>
            <span className={styles.logoName}>AI Workspace</span>
            <span className={styles.logoSub}>Multi-Agent System</span>
        </div>
    );

    /* ── Default progress bar ─────────────────────────── */
    const defaultProgress = (
        <div className={styles.progressSlot}>
            <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Boot progress: ${progress}%`}
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
            <div className={styles.progressLabel} aria-hidden="true">
                <span>Initializing</span>
                <span>{progress}%</span>
            </div>
        </div>
    );

    return (
        <div
            className={clsx(styles.overlay, className)}
            role="status"
            aria-label="System initializing, please wait"
            aria-live="polite"
            aria-busy={progress < 100}
        >
            {/* ── Ambient scan line ────────────────────── */}
            <div className={styles.scan} aria-hidden="true" />

            {/* ── Corner decorations ───────────────────── */}
            <div className={clsx(styles.corner, styles.cornerTL)} aria-hidden="true" />
            <div className={clsx(styles.corner, styles.cornerTR)} aria-hidden="true" />
            <div className={clsx(styles.corner, styles.cornerBL)} aria-hidden="true" />
            <div className={clsx(styles.corner, styles.cornerBR)} aria-hidden="true" />

            {/* ── Logo slot ────────────────────────────── */}
            {resolveSlot(logoSlot, defaultLogo)}

            {/* ── Loading slot (optional) ──────────────── */}
            {loadingSlot && (
                <div className={styles.loadingSlot}>
                    {resolveSlot(loadingSlot, null)}
                </div>
            )}

            {/* ── Boot log ─────────────────────────────── */}
            <div
                className={styles.logSlot}
                aria-label="Boot sequence log"
                aria-relevant="additions"
            >
                {messages.slice(0, visibleCount).map((line, i) => (
                    <div
                        key={line}
                        className={clsx(
                            styles.logLine,
                            isDone(i) && styles.logLineDone,
                            isLast(i) && styles.logLineLast
                        )}
                    >
                        <span className={styles.logPrefix} aria-hidden="true">
                            {prefix}
                        </span>
                        <span className={styles.logText}>{line}</span>
                        {isDone(i) && (
                            <span className={styles.logOk} aria-hidden="true">OK</span>
                        )}
                        {isLast(i) && progress < 100 && (
                            <span className={styles.logCursor} aria-hidden="true" />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Progress slot ────────────────────────── */}
            {resolveSlot(progressSlot, defaultProgress)}
        </div>
    );
}

export default BootScreen;
