import { useEffect, useRef } from "react";
import styles from "./CursorGlow.module.css";

/**
 * CursorGlow — System/Cursor
 *
 * A radial glow sphere that follows the pointer via rAF + lerp smoothing.
 * Mount once at app root. Renders a single fixed DOM node.
 *
 * Props:
 *   size    — number   diameter in px                  (default: 400)
 *   color   — string   CSS color / var() token         (default: uses --cursor-color → --accent-glow)
 *   opacity — number   0–1 max opacity when visible    (default: 1)
 *   lerp    — number   0–1 smoothing factor            (default: 0.1 — lower is smoother)
 *   zIndex  — number                                   (default: 9998)
 */
function CursorGlow({
    size    = 400,
    color   = null,
    opacity = 1,
    lerp    = 0.1,
    zIndex  = 9998,
}) {
    const glowRef   = useRef(null);
    const target    = useRef({ x: -size * 2, y: -size * 2 });
    const current   = useRef({ x: -size * 2, y: -size * 2 });
    const rafId     = useRef(null);
    const visible   = useRef(false);

    /* Keep latest prop values accessible inside the rAF closure without re-running effect */
    const lerpRef    = useRef(lerp);
    const sizeRef    = useRef(size);
    const opacityRef = useRef(opacity);
    lerpRef.current    = lerp;
    sizeRef.current    = size;
    opacityRef.current = opacity;

    useEffect(() => {
        const el = glowRef.current;
        if (!el) return;

        /* ── Pointer tracking ───────────────────────────── */
        function onMove(e) {
            target.current.x = e.clientX;
            target.current.y = e.clientY;

            if (!visible.current) {
                /* Snap on first move — avoids the blob flying across from an off-screen position */
                current.current.x = e.clientX;
                current.current.y = e.clientY;
                visible.current   = true;
                el.style.opacity  = String(opacityRef.current);
            }
        }

        function onLeave() {
            visible.current  = false;
            el.style.opacity = "0";
        }

        /* ── rAF loop ───────────────────────────────────── */
        function tick() {
            const k  = lerpRef.current;
            const cx = current.current;
            const tx = target.current;

            cx.x += (tx.x - cx.x) * k;
            cx.y += (tx.y - cx.y) * k;

            /* Centre the element on the cursor via translate */
            const half = sizeRef.current / 2;
            el.style.transform = `translate(${cx.x - half}px,${cx.y - half}px)`;

            rafId.current = requestAnimationFrame(tick);
        }

        window.addEventListener("mousemove",   onMove,   { passive: true });
        document.addEventListener("mouseleave", onLeave);
        rafId.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("mousemove",   onMove);
            document.removeEventListener("mouseleave", onLeave);
            cancelAnimationFrame(rafId.current);
        };
    }, []); // intentionally empty — prop changes handled via refs

    return (
        <div
            ref={glowRef}
            className={styles.glow}
            aria-hidden="true"
            style={{
                width:               size,
                height:              size,
                opacity:             0,         /* hidden until first mousemove */
                zIndex,
                "--cursor-color":    color ?? "var(--accent-glow)",
            }}
        />
    );
}

export default CursorGlow;
