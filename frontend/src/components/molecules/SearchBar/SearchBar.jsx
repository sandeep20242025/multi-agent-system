import { useRef } from "react";
import clsx from "clsx";
import styles from "./SearchBar.module.css";

/**
 * SearchBar — Molecule
 * Controlled or uncontrolled.
 * Props: value, onChange, onSubmit, placeholder, isLoading, className
 */
function SearchBar({
    value,
    onChange,
    onSubmit,
    placeholder = "Search…",
    isLoading = false,
    className,
}) {
    const inputRef = useRef(null);

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit?.(value ?? inputRef.current?.value ?? "");
    }

    function handleKeyDown(e) {
        if (e.key === "Escape") {
            inputRef.current?.blur();
        }
    }

    return (
        <form
            role="search"
            onSubmit={handleSubmit}
            className={clsx(styles.root, className)}
        >
            {/* Search icon */}
            <span className={styles.searchIcon} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </span>

            <input
                ref={inputRef}
                type="search"
                className={styles.input}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                aria-label={placeholder}
                autoComplete="off"
                spellCheck="false"
            />

            {/* Clear / Loading indicator */}
            {isLoading && (
                <span className={styles.spinner} aria-label="Searching…" aria-hidden="true" />
            )}

            <button
                type="submit"
                className={styles.submitBtn}
                aria-label="Submit search"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </form>
    );
}

export default SearchBar;
