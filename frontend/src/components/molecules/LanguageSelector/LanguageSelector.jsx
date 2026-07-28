import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import useLanguage from "@/hooks/useLanguage";
import LANGUAGES from "@/constants/languages";
import styles from "./LanguageSelector.module.css";

/* ── Language metadata ─────────────────────────────────── */
const LANG_META = {
    [LANGUAGES.ENGLISH]:  { label: "English",  native: "EN", flag: "🇺🇸" },
    [LANGUAGES.HINDI]:    { label: "Hindi",    native: "हि",  flag: "🇮🇳" },
    [LANGUAGES.HINGLISH]: { label: "Hinglish", native: "Hi", flag: "🌐" },
};

/**
 * LanguageSelector — Molecule
 * Dropdown that switches the app language via LanguageContext.
 */
function LanguageSelector({ className }) {
    const { language, setLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function onPointerDown(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, []);

    const current = LANG_META[language] ?? LANG_META[LANGUAGES.ENGLISH];
    const all = Object.values(LANGUAGES);

    function select(lang) {
        setLanguage(lang);
        setOpen(false);
    }

    return (
        <div ref={ref} className={clsx(styles.root, className)}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Current language: ${current.label}. Change language.`}
            >
                <span className={styles.flag} aria-hidden="true">{current.flag}</span>
                <span className={styles.code}>{current.native}</span>
                <span className={clsx(styles.chevron, open && styles.chevronOpen)} aria-hidden="true">▾</span>
            </button>

            {open && (
                <ul
                    className={styles.dropdown}
                    role="listbox"
                    aria-label="Language options"
                >
                    {all.map((lang) => {
                        const meta = LANG_META[lang];
                        const isActive = lang === language;
                        return (
                            <li
                                key={lang}
                                role="option"
                                aria-selected={isActive}
                                className={clsx(styles.option, isActive && styles.optionActive)}
                                onClick={() => select(lang)}
                                onKeyDown={(e) => e.key === "Enter" && select(lang)}
                                tabIndex={0}
                            >
                                <span className={styles.flag} aria-hidden="true">{meta?.flag}</span>
                                <span>{meta?.label ?? lang}</span>
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

export default LanguageSelector;
