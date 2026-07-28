import clsx from "clsx";
import styles from "./Badge.module.css";

/**
 * Badge — Atom
 * variant: "default" | "primary" | "success" | "warning" | "danger" | "ghost"
 * dot:     show colored dot indicator
 * pulse:   animate the dot
 */
function Badge({
    children,
    variant = "default",
    dot = false,
    pulse = false,
    className,
}) {
    return (
        <span
            className={clsx(styles.badge, styles[variant], className)}
            role="status"
        >
            {dot && (
                <span
                    className={clsx(styles.dot, pulse && styles.pulse)}
                    aria-hidden="true"
                />
            )}
            {children}
        </span>
    );
}

export default Badge;
