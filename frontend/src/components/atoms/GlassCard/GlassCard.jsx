import clsx from "clsx";
import styles from "./GlassCard.module.css";

function GlassCard({
    children,
    className,
    hover = true,
    blur = "md",
    padding = "md",
    bordered = true,
    onClick,
}) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                styles.card,
                styles[blur],
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