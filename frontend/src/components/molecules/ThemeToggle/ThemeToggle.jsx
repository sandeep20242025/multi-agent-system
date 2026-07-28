import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import useTheme from "@/hooks/useTheme";
import THEMES from "@/constants/themes";
import styles from "./ThemeToggle.module.css";

/* ── Icon map ──────────────────────────────────────────── */
const THEME_META = {
    [THEMES.JARVIS]: { label: "Jarvis", icon: "◈" },
    [THEMES.DARK]:   { label: "Dark",   icon: "◐" },
    [THEMES.LIGHT]:  { label: "Light",  icon: "○" },
    [THEMES.CYBER]:  { label: "Cyber",  icon: "◆" },
    [THEMES.MATRIX]: { label: "Matrix", icon: "▣" },
};

/**
 * ThemeToggle — Molecule
 * Dropdown that cycles through all available themes.
 * Reads / writes via ThemeContext.
 */
function ThemeToggle({ className }) {
    const { theme, setTheme, themes } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // close on outside click
    useEffect(() => {
        function onPointerDown(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, []);

    const current = THEME_META[theme] ?? THEME_META[THEMES.JARVIS];
    const themeList = themes ?? Object.values(THEMES);

    function selectTheme(t) {
        setTheme(t);
        setOpen(false);
    }

    return (
        <div
            ref={ref}
            className={clsx(styles.root, className)}
        >
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Current theme: ${current.label}. Change theme.`}
            >
                <span className={styles.icon} aria-hidden="true">
                    {current.icon}
                </span>
                <span className={styles.label}>{current.label}</span>
                <span className={clsx(styles.chevron, open && styles.chevronOpen)} aria-hidden="true">
                    ▾
                </span>
            </button>

            {open && (
                <ul
                    className={styles.dropdown}
                    role="listbox"
                    aria-label="Theme options"
                >
                    {themeList.map((t) => {
                        const meta = THEME_META[t];
                        const isActive = t === theme;
                        return (
                            <li
                                key={t}
                                role="option"
                                aria-selected={isActive}
                                className={clsx(styles.option, isActive && styles.optionActive)}
                                onClick={() => selectTheme(t)}
                                onKeyDown={(e) => e.key === "Enter" && selectTheme(t)}
                                tabIndex={0}
                            >
                                <span className={styles.icon} aria-hidden="true">
                                    {meta?.icon ?? "○"}
                                </span>
                                <span>{meta?.label ?? t}</span>
                                {isActive && (
                                    <span className={styles.check} aria-hidden="true">✓</span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default ThemeToggle;
