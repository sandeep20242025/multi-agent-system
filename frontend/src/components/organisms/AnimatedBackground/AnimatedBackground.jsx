import { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import styles from "./AnimatedBackground.module.css";

/* ─────────────────────────────────────────────────────────
   AnimatedBackground — Organism (CANONICAL)
   Full-featured layered animated background.
   Used across Landing, Login, Register, Workspace, Hero.

   Stub re-exports exist at:
     @/components/common/AnimatedBackground       → re-exports this
     @/components/system/Background/AnimatedBackground → re-exports this

   Always import from @/components/organisms/AnimatedBackground.

   Layers (bottom → top)
   ──────────────────────
   1. Animated gradient       always on
   2. Moving glow blobs       always on
   3. Floating particles      showParticles (default: true)
   4. Grid                    showGrid      (default: true)
   5. Noise overlay           showNoise     (default: true)
   6. Cursor spotlight        interactive   (default: false)
   7. Content slot            children

   Props
   ─────
   children       ReactNode    page content rendered above background
   className      string       extra class on the root wrapper
   showParticles  boolean      toggle particle layer          (default: true)
   showGrid       boolean      toggle grid layer              (default: true)
   showNoise      boolean      toggle film-grain noise layer  (default: true)
   interactive    boolean      cursor radial spotlight        (default: false)
   blur           "none"|"sm"|"md"|"lg"  backdrop blur on content (default: "none")
   opacity        number 0–1   global opacity of bg layers    (default: 1)
───────────────────────────────────────────────────────── */

/* Seeded particle positions — deterministic, never re-randomised */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    id:       i,
    left:     `${(i * 37 + 11) % 100}%`,
    top:      `${(i * 53 + 7)  % 100}%`,
    delay:    `${((i * 0.43)   % 9).toFixed(2)}s`,
    duration: `${8 + (i % 7)}s`,
    size:     i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
}));

/* ── Cursor spotlight hook ────────────────────────────── */
function useSpotlight(enabled) {
    const spotRef = useRef(null);

    useEffect(() => {
        if (!enabled) return;

        const el = spotRef.current;
        if (!el) return;

        let rafId   = null;
        let targetX = window.innerWidth  / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;
        const LERP = 0.08;

        function onMove(e) {
            targetX = e.clientX;
            targetY = e.clientY;
        }

        function frame() {
            currentX += (targetX - currentX) * LERP;
            currentY += (targetY - currentY) * LERP;
            el.style.transform = `translate(${currentX}px, ${currentY}px)`;
            rafId = requestAnimationFrame(frame);
        }

        window.addEventListener("mousemove", onMove, { passive: true });
        rafId = requestAnimationFrame(frame);

        return () => {
            window.removeEventListener("mousemove", onMove);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [enabled]);

    return spotRef;
}

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
function AnimatedBackground({
    children,
    className,
    showParticles = true,
    showGrid      = true,
    showNoise     = true,
    interactive   = false,
    blur          = "none",
    opacity       = 1,
}) {
    const spotRef = useSpotlight(interactive);

    /* Memoised so the particle array is never re-created on re-render */
    const particles = useMemo(() => PARTICLES, []);

    const blurClass = blur !== "none" ? styles[`blur_${blur}`] : null;

    return (
        <div
            className={clsx(styles.root, className)}
            style={opacity !== 1 ? { "--bg-opacity": opacity } : undefined}
        >
            {/* ══════════════════════════════════════════
                LAYER 1 — Animated gradient base
            ══════════════════════════════════════════ */}
            <div className={styles.gradientLayer} aria-hidden="true" />

            {/* ══════════════════════════════════════════
                LAYER 2 — Floating glow blobs
            ══════════════════════════════════════════ */}
            <div className={styles.blobLayer} aria-hidden="true">
                <div className={clsx(styles.blob, styles.blob1)} />
                <div className={clsx(styles.blob, styles.blob2)} />
                <div className={clsx(styles.blob, styles.blob3)} />
                <div className={clsx(styles.blob, styles.blob4)} />
            </div>

            {/* ══════════════════════════════════════════
                LAYER 3 — Floating particles
            ══════════════════════════════════════════ */}
            {showParticles && (
                <div className={styles.particleLayer} aria-hidden="true">
                    {particles.map(({ id, left, top, delay, duration, size }) => (
                        <span
                            key={id}
                            className={styles.particle}
                            style={{
                                left,
                                top,
                                width:             size,
                                height:            size,
                                animationDelay:    delay,
                                animationDuration: duration,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ══════════════════════════════════════════
                LAYER 4 — Grid
            ══════════════════════════════════════════ */}
            {showGrid && (
                <div className={styles.gridLayer} aria-hidden="true">
                    <div className={styles.grid} />
                    {/* Grid pulse scan line */}
                    <div className={styles.scanLine} />
                </div>
            )}

            {/* ══════════════════════════════════════════
                LAYER 5 — Noise overlay
            ══════════════════════════════════════════ */}
            {showNoise && (
                <div className={styles.noiseLayer} aria-hidden="true" />
            )}

            {/* ══════════════════════════════════════════
                LAYER 6 — Cursor spotlight (interactive)
            ══════════════════════════════════════════ */}
            {interactive && (
                <div
                    ref={spotRef}
                    className={styles.spotlight}
                    aria-hidden="true"
                    style={{
                        /* start off-screen so it doesn't flash at (0,0) */
                        transform: `translate(-9999px, -9999px)`,
                    }}
                />
            )}

            {/* ══════════════════════════════════════════
                LAYER 7 — Content
            ══════════════════════════════════════════ */}
            <div className={clsx(styles.content, blurClass)}>
                {children}
            </div>
        </div>
    );
}

export default AnimatedBackground;
