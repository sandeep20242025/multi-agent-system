import styles from "./Button.module.css";
import clsx from "clsx";

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
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={clsx(
                styles.button,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth
            )}
        >
            {leftIcon && <span className={styles.icon}>{leftIcon}</span>}

            {loading ? "Loading..." : children}

            {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </button>
    );
}

export default Button;