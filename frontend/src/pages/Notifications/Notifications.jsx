/**
 * Notifications — Page
 *
 * Renders inside WorkspaceLayout. All state is local — no backend, no API.
 * Styling: CSS Modules (Notifications.module.css) + CSS design tokens only.
 */

import { useState, useMemo, useCallback } from "react";

import GlassCard from "@/components/atoms/GlassCard";
import Button    from "@/components/atoms/Button";
import Badge     from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";

import styles from "./Notifications.module.css";

/* ═══════════════════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════════════════ */

const SEED = [
    {
        id: "n1",
        type:    "agent",
        icon:    "⬡",
        title:   "Research Agent completed task",
        body:    "Fetched and summarised IBM Watson API documentation successfully.",
        time:    "2 min ago",
        read:    false,
        priority: "high",
    },
    {
        id: "n2",
        type:    "task",
        icon:    "◉",
        title:   "Market Research Report — 72% progress",
        body:    "Analyst Agent updated the report. Three sections still pending review.",
        time:    "18 min ago",
        read:    false,
        priority: "medium",
    },
    {
        id: "n3",
        type:    "security",
        icon:    "◇",
        title:   "New sign-in from macOS · Chrome",
        body:    "Detected at 09:41 from San Francisco, CA. If this wasn't you, revoke the session.",
        time:    "1 hr ago",
        read:    false,
        priority: "high",
    },
    {
        id: "n4",
        type:    "project",
        icon:    "◇",
        title:   "Product Launch Strategy marked complete",
        body:    "All tasks resolved. Project archived automatically.",
        time:    "3 hr ago",
        read:    false,
        priority: "low",
    },
    {
        id: "n5",
        type:    "system",
        icon:    "◈",
        title:   "Storage usage at 78%",
        body:    "You are approaching your 10 GB workspace storage limit. Consider removing unused files.",
        time:    "5 hr ago",
        read:    true,
        priority: "medium",
    },
    {
        id: "n6",
        type:    "agent",
        icon:    "⬡",
        title:   "Writer Agent is waiting",
        body:    "Writer is blocked — Analyst has not yet finished sentiment analysis.",
        time:    "6 hr ago",
        read:    true,
        priority: "medium",
    },
    {
        id: "n7",
        type:    "task",
        icon:    "◉",
        title:   "Q3 Forecast Summary — task failed",
        body:    "An error occurred while generating the financial model. Check agent logs.",
        time:    "Yesterday",
        read:    true,
        priority: "high",
    },
    {
        id: "n8",
        type:    "project",
        icon:    "◇",
        title:   "Brand Refresh Initiative — member added",
        body:    "Jordan Patel was added as a contributor.",
        time:    "Yesterday",
        read:    true,
        priority: "low",
    },
    {
        id: "n9",
        type:    "system",
        icon:    "◈",
        title:   "Scheduled maintenance window",
        body:    "The workspace API will be unavailable on Aug 2 from 02:00–04:00 UTC.",
        time:    "2 days ago",
        read:    true,
        priority: "medium",
    },
    {
        id: "n10",
        type:    "agent",
        icon:    "⬡",
        title:   "Planner Agent v2.1 deployed",
        body:    "New version with improved task decomposition is now active.",
        time:    "3 days ago",
        read:    true,
        priority: "low",
    },
];

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */

const FILTER_TABS = [
    { id: "all",      label: "All"      },
    { id: "unread",   label: "Unread"   },
    { id: "agent",    label: "Agents"   },
    { id: "task",     label: "Tasks"    },
    { id: "project",  label: "Projects" },
    { id: "security", label: "Security" },
    { id: "system",   label: "System"   },
];

const PRIORITY_META = {
    high:   { variant: "danger",  label: "High"   },
    medium: { variant: "warning", label: "Medium" },
    low:    { variant: "ghost",   label: "Low"    },
};

const TYPE_COLOR = {
    agent:    "var(--accent)",
    task:     "var(--success)",
    project:  "var(--accent-secondary)",
    security: "var(--danger)",
    system:   "var(--warning)",
};

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION ROW
═══════════════════════════════════════════════════════════ */

function NotifRow({ notif, onRead, onDelete }) {
    const priorityMeta = PRIORITY_META[notif.priority];
    const typeColor    = TYPE_COLOR[notif.type] ?? "var(--accent)";

    return (
        <div
            className={[
                styles.row,
                notif.read ? styles.rowRead : styles.rowUnread,
            ].join(" ")}
            role="listitem"
            aria-label={notif.read ? notif.title : `Unread: ${notif.title}`}
        >
            {/* Unread dot */}
            {!notif.read && (
                <span className={styles.unreadDot} aria-label="Unread" />
            )}

            {/* Type icon */}
            <div
                className={styles.typeIcon}
                aria-hidden="true"
                style={{ "--type-color": typeColor }}
            >
                {notif.icon}
            </div>

            {/* Content */}
            <div className={styles.content}>
                <div className={styles.contentTop}>
                    <span className={styles.title}>{notif.title}</span>
                    <div className={styles.meta}>
                        <Badge variant={priorityMeta.variant} className={styles.priorityBadge}>
                            {priorityMeta.label}
                        </Badge>
                        <span className={styles.time}>{notif.time}</span>
                    </div>
                </div>
                <p className={styles.body}>{notif.body}</p>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                {!notif.read && (
                    <button
                        className={styles.actionBtn}
                        onClick={() => onRead(notif.id)}
                        aria-label="Mark as read"
                        title="Mark as read"
                    >
                        ✓
                    </button>
                )}
                <button
                    className={[styles.actionBtn, styles.actionBtnDanger].join(" ")}
                    onClick={() => onDelete(notif.id)}
                    aria-label={`Delete notification: ${notif.title}`}
                    title="Delete"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */

function Toast({ msg, type }) {
    return (
        <div
            className={[styles.toast, styles[`toast_${type}`]].join(" ")}
            role="status"
            aria-live="polite"
        >
            <span className={styles.toastIcon} aria-hidden="true">
                {type === "success" ? "✓" : "◎"}
            </span>
            {msg}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS PAGE
═══════════════════════════════════════════════════════════ */

export default function Notifications() {
    const [notifs,  setNotifs] = useState(SEED);
    const [filter,  setFilter] = useState("all");
    const [search,  setSearch] = useState("");
    const [toast,   setToast]  = useState(null);

    /* ── Toast helper ── */
    const notify = useCallback((msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2400);
    }, []);

    /* ── Derived counts ── */
    const unreadCount = useMemo(
        () => notifs.filter((n) => !n.read).length,
        [notifs]
    );

    const tabCounts = useMemo(() => {
        const c = { all: notifs.length, unread: 0, agent: 0, task: 0, project: 0, security: 0, system: 0 };
        notifs.forEach((n) => {
            if (!n.read) c.unread++;
            if (n.type in c) c[n.type]++;
        });
        return c;
    }, [notifs]);

    /* ── Filtered + searched list ── */
    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return notifs.filter((n) => {
            const matchFilter =
                filter === "all"    ? true :
                filter === "unread" ? !n.read :
                n.type === filter;
            const matchSearch =
                !q ||
                n.title.toLowerCase().includes(q) ||
                n.body.toLowerCase().includes(q);
            return matchFilter && matchSearch;
        });
    }, [notifs, filter, search]);

    /* ── Actions ── */
    const markRead = useCallback((id) => {
        setNotifs((prev) =>
            prev.map((n) => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const deleteOne = useCallback((id) => {
        setNotifs((prev) => prev.filter((n) => n.id !== id));
        notify("Notification deleted", "info");
    }, [notify]);

    const markAllRead = useCallback(() => {
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
        notify("All notifications marked as read");
    }, [notify]);

    const clearAll = useCallback(() => {
        setNotifs([]);
        notify("All notifications cleared", "info");
    }, [notify]);

    /* ── Group by time label ── */
    const grouped = useMemo(() => {
        const groups = {};
        visible.forEach((n) => {
            const key =
                n.time.includes("min") || n.time.includes("hr")
                    ? "Today"
                    : n.time === "Yesterday"
                    ? "Yesterday"
                    : "Earlier";
            (groups[key] ??= []).push(n);
        });
        // return in fixed order
        return ["Today", "Yesterday", "Earlier"]
            .filter((k) => groups[k]?.length)
            .map((k) => ({ label: k, items: groups[k] }));
    }, [visible]);

    return (
        <>
            <div className={styles.page}>

                {/* ── Header ── */}
                <header className={styles.pageHeader}>
                    <div className={styles.headerText}>
                        <h1 className={styles.pageTitle}>
                            <span aria-hidden="true">◉</span> Notifications
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Activity alerts from agents, projects, and the system.
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        {unreadCount > 0 && (
                            <Badge variant="danger" dot pulse>
                                {unreadCount} unread
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllRead}
                            disabled={unreadCount === 0}
                            aria-label="Mark all as read"
                        >
                            ✓ Mark all read
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            disabled={notifs.length === 0}
                            aria-label="Clear all notifications"
                        >
                            ✕ Clear all
                        </Button>
                    </div>
                </header>

                {/* ── Toolbar: search + filter tabs ── */}
                <div className={styles.toolbar}>
                    <SearchBar
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search notifications…"
                        className={styles.searchBar}
                    />

                    <div
                        className={styles.tabs}
                        role="tablist"
                        aria-label="Filter notifications"
                    >
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={filter === tab.id}
                                className={[
                                    styles.tab,
                                    filter === tab.id ? styles.tabActive : "",
                                ].join(" ")}
                                onClick={() => setFilter(tab.id)}
                            >
                                {tab.label}
                                {tabCounts[tab.id] > 0 && (
                                    <span className={styles.tabCount}>
                                        {tabCounts[tab.id]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── List ── */}
                {grouped.length > 0 ? (
                    <GlassCard
                        blur="md"
                        padding="sm"
                        hover={false}
                        bordered
                        className={styles.listCard}
                    >
                        {grouped.map((group, gi) => (
                            <div key={group.label} className={styles.group}>
                                <div className={styles.groupLabel}>
                                    {group.label}
                                    <span className={styles.groupCount}>
                                        {group.items.length}
                                    </span>
                                </div>
                                <div
                                    className={styles.groupItems}
                                    role="list"
                                    aria-label={`${group.label} notifications`}
                                >
                                    {group.items.map((n, i) => (
                                        <div key={n.id}>
                                            {i > 0 && (
                                                <div
                                                    className={styles.divider}
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <NotifRow
                                                notif={n}
                                                onRead={markRead}
                                                onDelete={deleteOne}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {gi < grouped.length - 1 && (
                                    <div
                                        className={styles.groupDivider}
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                        ))}
                    </GlassCard>
                ) : (
                    <div className={styles.empty} role="status">
                        <span className={styles.emptyIcon} aria-hidden="true">◉</span>
                        <p className={styles.emptyTitle}>
                            {search ? "No notifications match your search." : "You're all caught up."}
                        </p>
                        {search && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearch("")}
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                )}

                {/* ── Footer count ── */}
                {visible.length > 0 && (
                    <p className={styles.footerCount} aria-live="polite">
                        Showing{" "}
                        <strong>{visible.length}</strong> of{" "}
                        <strong>{notifs.length}</strong> notification
                        {notifs.length !== 1 ? "s" : ""}
                        {unreadCount > 0 && (
                            <> · <span className={styles.unreadNote}>{unreadCount} unread</span></>
                        )}
                    </p>
                )}
            </div>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </>
    );
}
