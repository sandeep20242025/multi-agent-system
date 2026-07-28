import clsx from "clsx";
import styles from "./Loader.module.css";

/**
 * Loader — Atom
 * size:    "xs" | "sm" | "md" | "lg" | "xl"
 * overlay: render as full-screen overlay
 * label:   optional text below the ring
 */
function Loader({
    size = "md",
    overlay = false,
    label,
    className,
}) {
    const content = (
        <div
            className={clsx(styles.root, className)}
            role="status"
            aria-label={label ?? "Loading"}
            aria-live="polite"
        >
            <div className={clsx(styles.ring, styles[size])} aria-hidden="true" />
            {label && <span className={styles.label}>{label}</span>}
        </div>
    );

    if (overlay) {
        return <div className={styles.overlay}>{content}</div>;
    }

    return content;
}

export default Loader;
