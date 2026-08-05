/**
 * WorkspaceLayout — Layout
 *
 * Shell that composes the full AI Workspace UI:
 *   Fixed Navbar (top)
 *   Left Sidebar (nav links, collapsible)
 *   Main Content Area (children slot)
 *   Right Activity Panel (tasks / agents / notifications)
 *
 * Props
 * ─────
 *   children          ReactNode     main content slot
 *   user              { name, src?, status? }  passed to Navbar + sidebar Avatar
 *   navItems          { id, label, icon, href, badge? }[]  sidebar nav items
 *   recentTasks       { id, label, status, time }[]
 *   runningAgents     { id, name, role, status, progress }[]
 *   notifications     { id, icon, title, time, priority }[]
 *   defaultNavId      string        active nav item id
 *   onNavChange       (id) => void  called when sidebar item changes
 *   onSearchSubmit    (q) => void   forwarded to Navbar
 *   sidebarCollapsed  boolean       controlled collapse (optional)
 *   onSidebarToggle   () => void    controlled collapse toggle (optional)
 *   className         string
 */

import {
    useState,
    useCallback,
    useEffect,
    useId,
    useRef,
} from "react";

import Navbar           from "@/components/organisms/Navbar";
import GlassCard        from "@/components/atoms/GlassCard";
import Badge            from "@/components/atoms/Badge";
import Avatar           from "@/components/atoms/Avatar";
import Loader           from "@/components/atoms/Loader";
import Button           from "@/components/atoms/Button";
import ThemeToggle      from "@/components/molecules/ThemeToggle";
import LanguageSelector from "@/components/molecules/LanguageSelector";

import styles from "./WorkspaceLayout.module.css";

/* ─────────────────────────────────────────────────────────
   DEFAULT DATA — used when no props supplied
───────────────────────────────────────────────────────── */
const DEFAULT_NAV_ITEMS = [
    { id: "dashboard",     label: "Dashboard",      icon: "◈", href: "/workspace"      },
    { id: "chats",         label: "Chats",          icon: "◎", href: "#chats",          badge: "3" },
    { id: "agents",        label: "Agents",         icon: "⬡", href: "/agents"         },
    { id: "files",         label: "Files",          icon: "◇", href: "/files"          },
    { id: "projects",      label: "Projects",       icon: "◉", href: "/projects"       },
    { id: "notifications", label: "Notifications",  icon: "◉", href: "/notifications",  badge: "4" },
    { id: "settings",      label: "Settings",       icon: "⚙", href: "/settings"       },
];

const DEFAULT_USER = { name: "Alex Johnson", status: "online" };

const DEFAULT_TASKS = [
    { id: 1, label: "Market Research Report", status: "completed", time: "2m ago",  statusVariant: "success" },
    { id: 2, label: "Product Brief v2",        status: "running",   time: "8m ago",  statusVariant: "primary" },
    { id: 3, label: "Competitor Analysis",     status: "waiting",   time: "15m ago", statusVariant: "warning" },
    { id: 4, label: "Q3 Forecast Summary",     status: "completed", time: "1h ago",  statusVariant: "success" },
];

const DEFAULT_AGENTS = [
    { id: "planner",  name: "Planner",  role: "Orchestration",     status: "online", progress: 100 },
    { id: "research", name: "Research", role: "Data Retrieval",     status: "busy",   progress: 62  },
    { id: "analyzer", name: "Analyzer", role: "Pattern Analysis",   status: "busy",   progress: 38  },
    { id: "writer",   name: "Writer",   role: "Content Generation", status: "online", progress: 0   },
];

const DEFAULT_NOTIFICATIONS = [
    { id: 1, icon: "◎", title: "Research completed",  time: "2m ago",  priority: "high",   priorityVariant: "danger"  },
    { id: 2, icon: "◇", title: "New workspace ready", time: "14m ago", priority: "medium", priorityVariant: "warning" },
    { id: 3, icon: "⬡", title: "Agent v2.1 available",time: "1h ago",  priority: "low",    priorityVariant: "default" },
];

/* ─────────────────────────────────────────────────────────
   SIDEBAR NAV ITEM
───────────────────────────────────────────────────────── */
function SidebarNavItem({ item, active, collapsed, onClick }) {
    return (
        <li>
            <a
                href={item.href}
                className={[
                    styles.navItem,
                    active    ? styles.navItemActive    : "",
                    collapsed ? styles.navItemCollapsed : "",
                ].filter(Boolean).join(" ")}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                onClick={(e) => { e.preventDefault(); onClick(item.id); }}
            >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                {!collapsed && item.badge && (
                    <Badge variant="primary" className={styles.navBadge}>
                        {item.badge}
                    </Badge>
                )}
                {collapsed && item.badge && (
                    <span className={styles.navBadgeDot} aria-hidden="true" />
                )}
            </a>
        </li>
    );
}

/* ─────────────────────────────────────────────────────────
   ACTIVITY PANEL SECTIONS
───────────────────────────────────────────────────────── */
function RecentTasks({ tasks }) {
    return (
        <section aria-labelledby="tasks-heading" className={styles.panelSection}>
            <h2 id="tasks-heading" className={styles.panelSectionTitle}>
                <span aria-hidden="true">◉</span> Recent Tasks
            </h2>
            <ul className={styles.taskList} role="list">
                {tasks.map((t) => (
                    <li key={t.id} className={styles.taskItem}>
                        <div className={styles.taskInfo}>
                            <span className={styles.taskLabel}>{t.label}</span>
                            <span className={styles.taskTime}>{t.time}</span>
                        </div>
                        <Badge variant={t.statusVariant}>{t.status}</Badge>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function RunningAgents({ agents }) {
    return (
        <section aria-labelledby="agents-heading" className={styles.panelSection}>
            <h2 id="agents-heading" className={styles.panelSectionTitle}>
                <span aria-hidden="true">⬡</span> Running Agents
                <Badge variant="success" dot pulse className={styles.panelLiveBadge}>
                    Live
                </Badge>
            </h2>
            <ul className={styles.agentList} role="list">
                {agents.map((a) => (
                    <li key={a.id} className={styles.agentItem}>
                        <Avatar name={a.name} size="xs" status={a.status} />
                        <div className={styles.agentInfo}>
                            <span className={styles.agentName}>{a.name}</span>
                            <span className={styles.agentRole}>{a.role}</span>
                            {a.progress > 0 && (
                                <div
                                    className={styles.agentProgressTrack}
                                    role="progressbar"
                                    aria-valuenow={a.progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={`${a.name}: ${a.progress}%`}
                                >
                                    <div
                                        className={styles.agentProgressFill}
                                        style={{ width: `${a.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                        {a.status === "busy" && (
                            <Loader size="xs" aria-label={`${a.name} processing`} />
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}

function NotificationsPanel({ notifications }) {
    const [read, setRead] = useState({});
    const dismiss = useCallback((id) => setRead((p) => ({ ...p, [id]: true })), []);

    return (
        <section aria-labelledby="notif-heading" className={styles.panelSection}>
            <h2 id="notif-heading" className={styles.panelSectionTitle}>
                <span aria-hidden="true">◎</span> Notifications
            </h2>
            <ul className={styles.notifList} role="list">
                {notifications.map((n) => (
                    <li
                        key={n.id}
                        className={[
                            styles.notifItem,
                            read[n.id] ? styles.notifItemRead : "",
                        ].filter(Boolean).join(" ")}
                    >
                        <span className={styles.notifIcon} aria-hidden="true">{n.icon}</span>
                        <div className={styles.notifBody}>
                            <span className={styles.notifTitle}>{n.title}</span>
                            <div className={styles.notifMeta}>
                                <span className={styles.notifTime}>{n.time}</span>
                                <Badge variant={n.priorityVariant}>{n.priority}</Badge>
                            </div>
                        </div>
                        {!read[n.id] && (
                            <button
                                type="button"
                                className={styles.notifDismiss}
                                aria-label={`Dismiss: ${n.title}`}
                                onClick={() => dismiss(n.id)}
                            >
                                ×
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────
   WORKSPACE LAYOUT
───────────────────────────────────────────────────────── */
function WorkspaceLayout({
    children,
    user              = DEFAULT_USER,
    navItems          = DEFAULT_NAV_ITEMS,
    recentTasks       = DEFAULT_TASKS,
    runningAgents     = DEFAULT_AGENTS,
    notifications     = DEFAULT_NOTIFICATIONS,
    defaultNavId      = "dashboard",
    onNavChange,
    onSearchSubmit,
    sidebarCollapsed:  controlledCollapsed,
    onSidebarToggle:   controlledToggle,
    className,
}) {
    /* ── Sidebar collapse — uncontrolled unless props provided ── */
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const isControlled  = controlledCollapsed !== undefined;
    const collapsed     = isControlled ? controlledCollapsed : internalCollapsed;
    const toggleSidebar = isControlled
        ? controlledToggle
        : () => setInternalCollapsed((v) => !v);

    /* ── Mobile drawer ─────────────────────────────────── */
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerRef = useRef(null);
    const drawerId  = useId();

    const openDrawer  = useCallback(() => setDrawerOpen(true),  []);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    /* Close drawer on Escape */
    useEffect(() => {
        if (!drawerOpen) return;
        const onKey = (e) => { if (e.key === "Escape") closeDrawer(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [drawerOpen, closeDrawer]);

    /* Body scroll lock when drawer open */
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [drawerOpen]);

    /* ── Active nav ────────────────────────────────────── */
    const [activeId, setActiveId] = useState(defaultNavId);
    const handleNavClick = useCallback((id) => {
        setActiveId(id);
        onNavChange?.(id);
        closeDrawer();
    }, [onNavChange, closeDrawer]);

    /* ── Right panel collapse ───────────────────────────── */
    const [panelOpen, setPanelOpen] = useState(true);

    /* ── Navbar items (top bar links suppressed — sidebar owns nav) ── */
    const navbarItems = [];

    /* ─────────────────────────────────────────────────────
       SIDEBAR CONTENT — shared between desktop + mobile
    ───────────────────────────────────────────────────── */
    function SidebarContent({ inDrawer = false }) {
        return (
            <div
                className={[
                    styles.sidebarInner,
                    inDrawer  ? styles.sidebarInnerDrawer   : "",
                    !inDrawer && collapsed ? styles.sidebarInnerCollapsed : "",
                ].filter(Boolean).join(" ")}
            >
                {/* Logo / brand strip */}
                <div className={styles.sidebarBrand}>
                    <div className={styles.sidebarLogo} aria-hidden="true">
                        <span className={styles.sidebarLogoSymbol}>◈</span>
                    </div>
                    {(!collapsed || inDrawer) && (
                        <div className={styles.sidebarBrandText}>
                            <span className={styles.sidebarBrandName}>AI Workspace</span>
                            <span className={styles.sidebarBrandSub}>Multi-Agent</span>
                        </div>
                    )}
                </div>

                {/* Collapse toggle — desktop only */}
                {!inDrawer && (
                    <button
                        type="button"
                        className={styles.collapseBtn}
                        onClick={toggleSidebar}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-expanded={!collapsed}
                    >
                        <span aria-hidden="true">{collapsed ? "›" : "‹"}</span>
                    </button>
                )}

                {/* Nav links */}
                <nav
                    aria-label="Workspace navigation"
                    className={styles.sidebarNav}
                >
                    <ul className={styles.navList} role="list">
                        {navItems.map((item) => (
                            <SidebarNavItem
                                key={item.id}
                                item={item}
                                active={item.id === activeId}
                                collapsed={collapsed && !inDrawer}
                                onClick={handleNavClick}
                            />
                        ))}
                    </ul>
                </nav>

                {/* User profile strip at bottom */}
                <div className={styles.sidebarUser}>
                    <Avatar
                        name={user.name}
                        size="sm"
                        status={user.status ?? "online"}
                    />
                    {(!collapsed || inDrawer) && (
                        <div className={styles.sidebarUserInfo}>
                            <span className={styles.sidebarUserName}>{user.name}</span>
                            <span className={styles.sidebarUserRole}>AI Engineer</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ─────────────────────────────────────────────────────
       RENDER
    ───────────────────────────────────────────────── */
    return (
        <div
            className={[
                styles.root,
                collapsed  ? styles.rootCollapsed : "",
                !panelOpen ? styles.rootPanelClosed : "",
                className  ?? "",
            ].filter(Boolean).join(" ")}
        >
            {/* ── TOP NAVBAR ──────────────────────────── */}
            <Navbar
                navigationItems={navbarItems}
                title="AI Workspace"
                subtitle="Multi-Agent System"
                user={user}
                sticky
                showSearch
                showTheme={false}
                showLanguage={false}
                showProfile
                onSearchSubmit={onSearchSubmit}
                className={styles.navbar}
            />

            {/* ── MOBILE HAMBURGER (below navbar) ─────── */}
            <button
                type="button"
                className={styles.mobileMenuBtn}
                onClick={openDrawer}
                aria-label="Open navigation menu"
                aria-haspopup="dialog"
                aria-expanded={drawerOpen}
                aria-controls={drawerId}
            >
                <span className={styles.hamburgerBar} aria-hidden="true" />
                <span className={styles.hamburgerBar} aria-hidden="true" />
                <span className={styles.hamburgerBar} aria-hidden="true" />
            </button>

            {/* ── BODY BELOW NAVBAR ───────────────────── */}
            <div className={styles.body}>

                {/* ── DESKTOP SIDEBAR ─────────────────── */}
                <aside
                    className={[
                        styles.sidebar,
                        collapsed ? styles.sidebarCollapsed : "",
                    ].filter(Boolean).join(" ")}
                    aria-label="Workspace sidebar"
                >
                    <GlassCard
                        blur="md"
                        padding="sm"
                        hover={false}
                        bordered={false}
                        className={styles.sidebarCard}
                    >
                        <SidebarContent />
                    </GlassCard>
                </aside>

                {/* ── MAIN CONTENT ────────────────────── */}
                <main
                    className={styles.main}
                    id="workspace-main"
                    aria-label="Main workspace content"
                    tabIndex={-1}
                >
                    {/* Toolbar strip inside main */}
                    <div className={styles.mainToolbar}>
                        <div className={styles.toolbarBreadcrumb}>
                            <span className={styles.breadcrumbItem}>Workspace</span>
                            <span className={styles.breadcrumbSep} aria-hidden="true">›</span>
                            <span className={styles.breadcrumbCurrent}>
                                {navItems.find((n) => n.id === activeId)?.label ?? "Dashboard"}
                            </span>
                        </div>
                        <div className={styles.toolbarControls}>
                            <ThemeToggle />
                            <LanguageSelector />
                            {/* Right panel toggle */}
                            <button
                                type="button"
                                className={styles.panelToggleBtn}
                                onClick={() => setPanelOpen((v) => !v)}
                                aria-label={panelOpen ? "Close activity panel" : "Open activity panel"}
                                aria-expanded={panelOpen}
                            >
                                <span aria-hidden="true">{panelOpen ? "▸" : "◂"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Page content slot */}
                    <div className={styles.mainContent}>
                        {children ?? (
                            <div className={styles.emptySlot}>
                                <Loader size="md" label="Loading workspace…" />
                            </div>
                        )}
                    </div>
                </main>

                {/* ── RIGHT ACTIVITY PANEL ─────────────── */}
                <aside
                    className={[
                        styles.panel,
                        !panelOpen ? styles.panelClosed : "",
                    ].filter(Boolean).join(" ")}
                    aria-label="Activity panel"
                    aria-hidden={!panelOpen}
                >
                    <GlassCard
                        blur="md"
                        padding="sm"
                        hover={false}
                        bordered={false}
                        className={styles.panelCard}
                    >
                        <RecentTasks      tasks={recentTasks}       />
                        <RunningAgents    agents={runningAgents}    />
                        <NotificationsPanel notifications={notifications} />
                    </GlassCard>
                </aside>
            </div>

            {/* ── MOBILE DRAWER ───────────────────────── */}
            {drawerOpen && (
                /* Backdrop */
                <div
                    className={styles.drawerBackdrop}
                    aria-hidden="true"
                    onClick={closeDrawer}
                />
            )}
            <div
                id={drawerId}
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                className={[
                    styles.drawer,
                    drawerOpen ? styles.drawerOpen : "",
                ].filter(Boolean).join(" ")}
            >
                <div className={styles.drawerHeader}>
                    <span className={styles.drawerTitle}>Menu</span>
                    <button
                        type="button"
                        className={styles.drawerClose}
                        onClick={closeDrawer}
                        aria-label="Close navigation menu"
                    >
                        ×
                    </button>
                </div>
                <SidebarContent inDrawer />
            </div>
        </div>
    );
}

export default WorkspaceLayout;
