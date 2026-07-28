import styles from "./NoiseLayer.module.css";

/**
 * NoiseLayer — System/Noise
 *
 * Fixed full-screen SVG film-grain texture.
 * Pure CSS — zero JS overhead.
 * Mount once at app root, above AnimatedBackground, below CursorGlow.
 *
 * Props:
 *   opacity   — number   0–1                          (default: 0.035)
 *   blendMode — string   CSS mix-blend-mode value     (default: "overlay")
 *   animate   — boolean  flicker animation on/off     (default: true)
 *   zIndex    — number                                (default: 2)
 */
function NoiseLayer({
    opacity   = 0.035,
    blendMode = "overlay",
    animate   = true,
    zIndex    = 2,
}) {
    return (
        <div
            className={styles.noise}
            style={{
                "--noise-opacity":    opacity,
                "--noise-blend":      blendMode,
                "--noise-animate":    animate ? "noise-flicker 8s ease-in-out infinite" : "none",
                zIndex,
            }}
            aria-hidden="true"
        />
    );
}

export default NoiseLayer;
