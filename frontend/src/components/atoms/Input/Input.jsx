import { forwardRef } from "react";
import clsx from "clsx";
import styles from "./Input.module.css";

const Input = forwardRef(
    (
        {
            label,
            error,
            leftIcon,
            rightIcon,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <div className={styles.wrapper}>
                {label && (
                    <label className={styles.label}>
                        {label}
                    </label>
                )}

                <div
                    className={clsx(
                        styles.container,
                        error && styles.errorBorder
                    )}
                >
                    {leftIcon && (
                        <span className={styles.icon}>
                            {leftIcon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        className={clsx(styles.input, className)}
                        {...props}
                    />

                    {rightIcon && (
                        <span className={styles.icon}>
                            {rightIcon}
                        </span>
                    )}
                </div>

                {error && (
                    <p className={styles.error}>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;