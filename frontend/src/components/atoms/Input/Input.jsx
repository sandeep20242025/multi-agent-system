import { forwardRef } from "react";
import clsx from "clsx";
import styles from "./Input.module.css";

/**
 * Input — Atom
 * Fully accessible, forwarded ref, label + error + hint support.
 */
const Input = forwardRef(function Input(
    {
        label,
        error,
        hint,
        leftIcon,
        rightIcon,
        required,
        id,
        className,
        ...props
    },
    ref
) {
    // auto-generate id from label if not provided
    const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    return (
        <div className={styles.wrapper}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required} aria-hidden="true">*</span>}
                </label>
            )}

            <div
                className={clsx(
                    styles.container,
                    error && styles.errorContainer
                )}
            >
                {leftIcon && (
                    <span className={styles.icon} aria-hidden="true">
                        {leftIcon}
                    </span>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={
                        error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
                    }
                    className={clsx(styles.input, className)}
                    {...props}
                />

                {rightIcon && (
                    <span className={styles.icon} aria-hidden="true">
                        {rightIcon}
                    </span>
                )}
            </div>

            {error && (
                <p id={`${inputId}-error`} className={styles.error} role="alert">
                    {error}
                </p>
            )}

            {!error && hint && (
                <p id={`${inputId}-hint`} className={styles.hint}>
                    {hint}
                </p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
