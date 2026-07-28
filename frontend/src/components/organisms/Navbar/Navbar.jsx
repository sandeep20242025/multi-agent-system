import { useState, useEffect, useId, useCallback } from "react";
import clsx from "clsx";

import SearchBar      from "@/components/molecules/SearchBar";
import ThemeToggle    from "@/components/molecules/ThemeToggle";
import LanguageSelector from "@/components/molecules/LanguageSelector";
import Avatar         from "@/components/atoms/Avatar";

import styles from "./Navbar.module.css";

/* ── Default navigation items ─────────────────────────── */
const DEFAULT_NAV_ITEMS = [
    { label: "Home",      href: "/" },
    { label: "Workspace", href: "/workspace" },
    { label: "Agents",    href: "/agents" },
    { label: "About",     href: "/about" },
];

/* ── Default logo mark ────────────────────────────────── */
const DEFAULT_LOGO = (
    <div className={styles.logoMark} aria-hidden="true">
        <span className={styles.logoSymbol}>◈</span>
    </div>
);

/**
 * Navbar — Organism
 *
 * Fully production-ready navigation bar. Composes existing
 * Atoms (Avatar) and Molecules (SearchBar, ThemeToggle, LanguageSelector).
 *
 * ── Props ──────────────────────────────────────────────────────────────────
 *
 *   navigationItems  — { label, href, active? }[]
 *                      Navigation links rendered in the centre column.
 *                      Default: Home / Workspace / Agents / About.
 *
 *   logo             — ReactNode    Custom logo element.
 *                      Default: ◈ mark in a glass box.
 *
 *   title            — string       Brand name text.
 *                      Default: "AI Workspace".
 *
 *   subtitle         — string       Small sub-label below brand name.
 *                      Default: "Multi-Agent System".
 *
 *   onLinkClick      — (href) => void
 *                      When provided, e.preventDefault() is called and this
 *                      handler is invoked instead — use for client-side routing.
 *
 *   user             — { name, src?, status? } | null
 *                      Passed to Avatar. null hides the avatar.
 *
 *   sticky           — boolean   position: fixed when true (default: true)
 *
 *   showSearch       — boolean   show SearchBar in right controls (default: true)
 *   showTheme        — boolean   show ThemeToggle (default: true)
 *   showLanguage     — boolean   show LanguageSelector (default: true)
 *   showProfile      — boolean   show Avatar / profile area (default: true)
 *
 *   onSearchSubmit   — (query: string) => void  forwarded to SearchBar
 *   searchPlaceholder — string  forwarded to SearchBar
 *
 *   className        — string   merged on the <header> root
 */
function Navbar({
    navigationItems  = DEFAULT_NAV_ITEMS,
    logo             = DEFAULT_LOGO,
    title            = "AI Workspace",
    subtitle         = "Multi-Agent System",
    onLinkClick,
    user             = null,
    sticky           = true,
    showSearch       = true,
    showTheme        = true,
    showLanguage     = true,
    showProfile      = true,
    onSearchSubmit,
    searchPlaceholder = "Search…",
    className,
}) {
    const drawerId = useId();

    const [scrolled,    setScrolled]    = useState(false);
    const [shrunk,      setShrunk]      = useState(false);
    const [mobileOpen,  setMobileOpen]  = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    /* ── Scroll detection ───────────────────────────────── */
    useEffect(() => {
        if (!sticky) return;

        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 10);
            setShrunk(y > 60);     // shrink threshold
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [sticky]);

    /* ── ESC closes mobile drawer ───────────────────────── */
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [mobileOpen]);

    /* ── Lock body scroll while drawer is open ──────────── */
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    /* ── Link click handler ─────────────────────────────── */
    const handleLinkClick = useCallback((e, href) => {
        if (onLinkClick) {
            e.preventDefault();
            onLinkClick(href);
        }
        setMobileOpen(false);
    }, [onLinkClick]);

    /* ── Nav link renderer (shared desktop + mobile) ────── */
    function NavLinks({ mobile = false }) {
        return navigationItems.map(({ label, href = "#", active }) => (
            <a
                key={`${href}-${label}`}
                href={href}
                onClick={(e) => handleLinkClick(e, href)}
                className={clsx(
                    styles.navLink,
                    active && styles.navLinkActive,
                    mobile && styles.mobileNavLink
                )}
                aria-current={active ? "page" : undefined}
            >
                {label}
                {active && (
                    <span className={styles.activeBar} aria-hidden="true" />
                )}
            </a>
        ));
    }

    /* ── Controls rendered in both desktop bar and drawer ── */
    function Controls({ inDrawer = false }) {
        return (
            <>
                {showSearch && !inDrawer && (
                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onSubmit={(q) => { setSearchQuery(""); onSearchSubmit?.(q); }}
                        placeholder={searchPlaceholder}
                        className={styles.searchBar}
                    />
                )}

                {showSearch && inDrawer && (
                    <div className={styles.drawerSearch}>
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onSubmit={(q) => { setSearchQuery(""); onSearchSubmit?.(q); setMobileOpen(false); }}
                            placeholder={searchPlaceholder}
                        />
                    </div>
                )}

                {showLanguage && <LanguageSelector />}
                {showTheme    && <ThemeToggle />}

                {showProfile && (
                    <Avatar
                        src={user?.src}
                        name={user?.name ?? ""}
                        size="sm"
                        status={user?.status}
                        className={styles.avatar}
                    />
                )}
            </>
        );
    }

    return (
        <>
            {/* ════════════════════════════════════════════
                HEADER BAR
            ════════════════════════════════════════════ */}
            <header
                className={clsx(
                    styles.navbar,
                    sticky    && styles.sticky,
                    scrolled  && styles.scrolled,
                    shrunk    && styles.shrunk,
                    className
                )}
                role="banner"
            >
                {/* ── Left: Brand ───────────────────────── */}
                <a
                    href="/"
                    className={styles.brand}
                    aria-label={`${title} — go to home`}
                    onClick={(e) => handleLinkClick(e, "/")}
                >
                    {logo}
                    <div className={styles.brandText}>
                        <span className={styles.brandName}>{title}</span>
                        {subtitle && !shrunk && (
                            <span className={styles.brandSub}>{subtitle}</span>
                        )}
                    </div>
                </a>

                {/* ── Centre: Desktop navigation ────────── */}
                {navigationItems.length > 0 && (
                    <nav
                        className={styles.desktopNav}
                        aria-label="Main navigation"
                    >
                        <NavLinks />
                    </nav>
                )}

                {/* ── Right: Controls ───────────────────── */}
                <div className={styles.controls} aria-label="Toolbar">
                    <Controls />

                    {/* Hamburger — mobile only */}
                    <button
                        type="button"
                        className={clsx(
                            styles.hamburger,
                            mobileOpen && styles.hamburgerOpen
                        )}
                        onClick={() => setMobileOpen((o) => !o)}
                        aria-label={
                            mobileOpen
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        aria-expanded={mobileOpen}
                        aria-controls={drawerId}
                    >
                        <span className={styles.bar} />
                        <span className={styles.bar} />
                        <span className={styles.bar} />
                    </button>
                </div>
            </header>

            {/* ════════════════════════════════════════════
                MOBILE DRAWER
            ════════════════════════════════════════════ */}
            <nav
                id={drawerId}
                className={clsx(styles.drawer, mobileOpen && styles.drawerOpen)}
                aria-label="Mobile navigation"
                aria-hidden={!mobileOpen}
            >
                {/* Nav links */}
                <div className={styles.drawerLinks}>
                    <NavLinks mobile />
                </div>

                {/* Controls (search + molecules + avatar) */}
                <div className={styles.drawerControls}>
                    <Controls inDrawer />
                </div>
            </nav>

            {/* ════════════════════════════════════════════
                BACKDROP
            ════════════════════════════════════════════ */}
            {mobileOpen && (
                <div
                    className={styles.backdrop}
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    );
}

export default Navbar;
