import styles from "./Button.module.css";
import clsx from "clsx";

/**
 * Button — Atom
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes:    sm | md | lg
 */
function Button({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    onClick,
    type = "button",
    className,
    "aria-label": ariaLabel,
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            aria-label={ariaLabel}
            aria-busy={loading}
            className={clsx(
                styles.button,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth,
                loading && styles.loading,
                className
            )}
        >
            {loading && <span className={styles.spinner} aria-hidden="true" />}

            {!loading && leftIcon && (
                <span className={styles.icon} aria-hidden="true">
                    {leftIcon}
                </span>
            )}

            <span className={styles.label}>
                {loading ? "Loading…" : children}
            </span>

            {!loading && rightIcon && (
                <span className={styles.icon} aria-hidden="true">
                    {rightIcon}
                </span>
            )}
        </button>
    );
}

export default Button;
