import clsx from "clsx";
import Badge from "@/components/atoms/Badge";
import styles from "./Footer.module.css";

/* ─────────────────────────────────────────────────────────
   Footer — Organism
   OS-style status panel footer for the AI Workspace.
   Transparent + glassmorphism — sits over the page bg.

   Props
   ─────
   showLinks    — boolean  show centre Quick Links column  (default: true)
   showStatus   — boolean  show right System Status column (default: true)
   version      — string   version string                  (default: "2.0.0")
   projectName  — string   project name                    (default: "AI Workspace")
   logo         — ReactNode  custom logo mark              (default: built-in ◈)
   className    — string   extra class on <footer>
───────────────────────────────────────────────────────── */

const QUICK_LINKS = [
    { label: "Home", href: "/" },
    { label: "Workspace", href: "/workspace" },
    { label: "Agents", href: "/agents" },
    { label: "About", href: "/about" },
];

const YEAR = new Date().getFullYear();

function Footer({
    showLinks = true,
    showStatus = true,
    version = "2.0.0",
    projectName = "AI Workspace",
    logo,
    className,
}) {
    const logoNode = logo ?? (
        <div className={styles.logoMark} aria-hidden="true">
            <span className={styles.logoSymbol}>◈</span>
        </div>
    );

    return (
        <footer
            className={clsx(styles.footer, className)}
            role="contentinfo"
            aria-label="Site footer"
        >
            {/* ── Top glow rule ──────────────────────── */}
            <div className={styles.topRule} aria-hidden="true" />

            {/* ── Three-column panel ─────────────────── */}
            <div className={styles.panel}>

                {/* ════════════════════════
                    LEFT — Logo + Description
                ════════════════════════ */}
                <div className={styles.brand}>
                    <div className={styles.logoRow}>
                        {logoNode}
                        <span className={styles.brandName}>
                            {projectName}
                            <span className={styles.dot}>.</span>
                        </span>
                    </div>

                    <p className={styles.description}>
                        Multi-Agent AI runtime. Intelligent agents that plan,
                        research, analyze, and deliver — autonomously.
                    </p>

                    <Badge variant="primary" dot pulse className={styles.runtimeBadge}>
                        System Active
                    </Badge>
                </div>

                {/* ════════════════════════
                    CENTER — Quick Links
                ════════════════════════ */}
                {showLinks && (
                    <nav
                        className={styles.linksCol}
                        aria-label="Quick links"
                    >
                        <h2 className={styles.colHeading}>Quick Links</h2>
                        <ul className={styles.linkList} role="list">
                            {QUICK_LINKS.map(({ label, href }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        className={styles.link}
                                    >
                                        <span
                                            className={styles.linkArrow}
                                            aria-hidden="true"
                                        >
                                            ›
                                        </span>
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {/* ════════════════════════
                    RIGHT — System Status
                ════════════════════════ */}
                {showStatus && (
                    <div className={styles.statusCol} aria-label="System status">
                        <h2 className={styles.colHeading}>System Status</h2>

                        <dl className={styles.statusList}>
                            {/* Runtime row */}
                            <div className={styles.statusRow}>
                                <dt className={styles.statusKey}>Runtime</dt>
                                <dd className={styles.statusVal}>
                                    <Badge variant="success" dot pulse>
                                        Online
                                    </Badge>
                                </dd>
                            </div>

                            {/* Version row */}
                            <div className={styles.statusRow}>
                                <dt className={styles.statusKey}>Version</dt>
                                <dd className={styles.statusVal}>
                                    <span className={styles.versionTag}>
                                        v{version}
                                    </span>
                                </dd>
                            </div>

                            {/* Build row */}
                            <div className={styles.statusRow}>
                                <dt className={styles.statusKey}>Build</dt>
                                <dd className={styles.statusVal}>
                                    <span className={styles.buildTag}>
                                        Stable
                                    </span>
                                </dd>
                            </div>

                            {/* Year row */}
                            <div className={styles.statusRow}>
                                <dt className={styles.statusKey}>Year</dt>
                                <dd
                                    className={styles.statusVal}
                                    aria-label={`Copyright ${YEAR}`}
                                >
                                    <span className={styles.yearTag}>
                                        © {YEAR}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                )}
            </div>

            {/* ── Bottom strip ───────────────────────── */}
            <div className={styles.bottomStrip} role="complementary">
                <div className={styles.stripDivider} aria-hidden="true" />
                <div className={styles.stripInner}>
                    <span className={styles.stripText}>
                        Made for{" "}
                        <span className={styles.stripAccent}>
                            IBM SkillsBuild AI Hackathon
                        </span>
                    </span>
                    <span className={styles.stripDots} aria-hidden="true">
                        <span className={styles.stripDot} />
                        <span className={styles.stripDot} />
                        <span className={styles.stripDot} />
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
