import clsx from "clsx";
import styles from "./GlassCard.module.css";

/**
 * GlassCard — Atom
 * blur:    "sm" | "md" | "lg"
 * padding: "sm" | "md" | "lg"
 */
function GlassCard({
    children,
    className,
    hover = true,
    blur = "md",
    padding = "md",
    bordered = true,
    onClick,
}) {
    const blurClass = {
        sm: styles.blurSm,
        md: styles.blurMd,
        lg: styles.blurLg,
    }[blur] ?? styles.blurMd;

    return (
        <div
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            className={clsx(
                styles.card,
                blurClass,
                styles[padding],
                hover && styles.hover,
                bordered && styles.bordered,
                className
            )}
        >
            {children}
        </div>
    );
}

export default GlassCard;
