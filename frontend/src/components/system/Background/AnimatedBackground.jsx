import { useMemo } from "react";
import clsx from "clsx";
import styles from "./AnimatedBackground.module.css";

/**
 * AnimatedBackground — System/Background
 *
 * Low-level composable background engine. Renders a fixed canvas layer.
 * Use this directly when you need fine-grained control over individual layers.
 * For page-level wrapping use @/components/organisms/AnimatedBackground.
 *
 * ── Variants ──────────────────────────────────────────────────────────────
 *
 *   "gradient"            – Radial CSS gradient, no animation
 *   "aurora"              – Floating blurred blob lights (default)
 *   "mesh-gradient"       – Multi-point mesh of gradient orbs
 *   "particles-placeholder" – Deterministic floating dot particles (CSS only)
 *   "video-placeholder"   – Dark base + diagonal stripe placeholder
 *
 * ── Props ─────────────────────────────────────────────────────────────────
 *
 *   variant     — one of the 5 above               (default: "aurora")
 *   intensity   — "low" | "medium" | "high"        (default: "medium")
 *                 scales opacity/blur of effects
 *   showGrid    — boolean                           (default: true)
 *   showScan    — boolean                           (default: true)
 *   overlay     — boolean  dark vignette on edges  (default: false)
 *   className   — string   merged onto the canvas div
 */
function AnimatedBackground({
    variant   = "aurora",
    intensity = "medium",
    showGrid  = true,
    showScan  = true,
    overlay   = false,
    className,
}) {
    const isAurora       = variant === "aurora";
    const isMesh         = variant === "mesh-gradient";
    const isGradient     = variant === "gradient";
    const isParticles    = variant === "particles-placeholder";
    const isVideo        = variant === "video-placeholder";

    /*
     * Particles are deterministic — positions seeded from index.
     * Memoised so they don't re-create on every render.
     */
    const particles = useMemo(() => {
        if (!isParticles) return [];
        return Array.from({ length: 30 }, (_, i) => ({
            id:       i,
            left:     `${(i * 37 + 11) % 100}%`,
            top:      `${(i * 53 + 7)  % 100}%`,
            delay:    `${(i * 0.37)    % 9}s`,
            duration: `${7 + (i % 6)}s`,
            size:     i % 3 === 0 ? 3 : 2,
        }));
    }, [isParticles]);

    return (
        <div
            className={clsx(
                styles.canvas,
                styles[variant.replace(/-/g, "_")],  // "mesh-gradient" → styles.mesh_gradient
                styles[`intensity_${intensity}`],
                className
            )}
            aria-hidden="true"
        >
            {/* ── Aurora variant ──────────────────────── */}
            {isAurora && (
                <>
                    <div className={clsx(styles.blob, styles.blob1)} />
                    <div className={clsx(styles.blob, styles.blob2)} />
                    <div className={clsx(styles.blob, styles.blob3)} />
                </>
            )}

            {/* ── Mesh-gradient variant ───────────────── */}
            {isMesh && (
                <>
                    <div className={clsx(styles.meshOrb, styles.meshOrb1)} />
                    <div className={clsx(styles.meshOrb, styles.meshOrb2)} />
                    <div className={clsx(styles.meshOrb, styles.meshOrb3)} />
                    <div className={clsx(styles.meshOrb, styles.meshOrb4)} />
                    <div className={clsx(styles.meshOrb, styles.meshOrb5)} />
                </>
            )}

            {/* ── Particles-placeholder variant ───────── */}
            {isParticles && (
                <div className={styles.particleField}>
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

            {/* ── Video-placeholder variant ────────────── */}
            {isVideo && (
                <div className={styles.videoPlaceholder}>
                    <span className={styles.videoLabel}>VIDEO</span>
                </div>
            )}

            {/* ── Shared: grid ─────────────────────────── */}
            {showGrid && !isGradient && (
                <div className={styles.grid} />
            )}

            {/* ── Shared: scan line ────────────────────── */}
            {showScan && !isGradient && !isVideo && (
                <div className={styles.scanLine} />
            )}

            {/* ── Shared: vignette overlay ─────────────── */}
            {overlay && <div className={styles.vignette} />}
        </div>
    );
}

export default AnimatedBackground;
