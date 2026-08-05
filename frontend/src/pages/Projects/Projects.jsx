/**
 * Projects — Page
 *
 * Renders inside WorkspaceLayout. Static placeholder data only.
 * Styling: CSS Modules (Projects.module.css) + CSS tokens.
 * No backend, no API.
 */

import { useState, useMemo, useId, useCallback, useRef } from "react";

import GlassCard  from "@/components/atoms/GlassCard";
import Button     from "@/components/atoms/Button";
import Badge      from "@/components/atoms/Badge";
import Avatar     from "@/components/atoms/Avatar";
import SearchBar  from "@/components/molecules/SearchBar";

import styles from "./Projects.module.css";

/* ═══════════════════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════════════════ */

const MEMBERS_POOL = [
    { id: "alex",    name: "Alex Johnson"  },
    { id: "morgan",  name: "Morgan Lee"    },
    { id: "sam",     name: "Sam Rivera"    },
    { id: "taylor",  name: "Taylor Kim"    },
    { id: "jordan",  name: "Jordan Patel"  },
    { id: "casey",   name: "Casey Wu"      },
];

const SEED_PROJECTS = [
    {
        id: "p1",
        name: "Market Research Report",
        description: "Comprehensive analysis of the competitive landscape for Q3 product positioning.",
        status: "active",
        progress: 72,
        members: ["alex", "morgan", "sam"],
        updated: "Jul 28, 2025",
        created: "Jun 10, 2025",
        archived: false,
    },
    {
        id: "p2",
        name: "Product Launch Strategy",
        description: "Go-to-market plan for the v3 platform release including messaging, channels, and KPIs.",
        status: "completed",
        progress: 100,
        members: ["taylor", "jordan"],
        updated: "Jul 25, 2025",
        created: "May 20, 2025",
        archived: false,
    },
    {
        id: "p3",
        name: "Competitor Analysis",
        description: "Deep-dive into top 10 competitors across pricing, features, and customer sentiment.",
        status: "active",
        progress: 55,
        members: ["alex", "casey", "morgan"],
        updated: "Jul 22, 2025",
        created: "Jun 30, 2025",
        archived: false,
    },
    {
        id: "p4",
        name: "Q3 Forecast Summary",
        description: "Financial forecast and revenue projection model for Q3 2025.",
        status: "pending",
        progress: 20,
        members: ["sam", "taylor"],
        updated: "Jul 18, 2025",
        created: "Jul 01, 2025",
        archived: false,
    },
    {
        id: "p5",
        name: "Customer Insights Hub",
        description: "Centralised repository of customer interviews, NPS data, and behavioural analytics.",
        status: "completed",
        progress: 100,
        members: ["morgan", "jordan", "casey", "alex"],
        updated: "Jul 14, 2025",
        created: "Apr 15, 2025",
        archived: false,
    },
    {
        id: "p6",
        name: "Brand Refresh Initiative",
        description: "Visual identity overhaul — new logo guidelines, colour palette, and typography system.",
        status: "pending",
        progress: 8,
        members: ["casey"],
        updated: "Jul 10, 2025",
        created: "Jul 08, 2025",
        archived: false,
    },
];

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */

const STATUS_META = {
    active:    { label: "Active",    variant: "success" },
    completed: { label: "Completed", variant: "default" },
    pending:   { label: "Pending",   variant: "warning" },
    archived:  { label: "Archived",  variant: "ghost"   },
};

const FILTER_OPTIONS = ["All", "active", "pending", "completed", "archived"];

const SORT_OPTIONS = [
    { value: "updated-desc", label: "Last Updated"     },
    { value: "updated-asc",  label: "Oldest Update"    },
    { value: "name-asc",     label: "Name A → Z"       },
    { value: "name-desc",    label: "Name Z → A"       },
    { value: "progress-desc",label: "Progress High → Low" },
    { value: "progress-asc", label: "Progress Low → High" },
    { value: "members-desc", label: "Most Members"     },
];

const MEMBER_COLORS = [
    "var(--accent)",
    "var(--accent-secondary)",
    "var(--accent-purple)",
    "var(--success)",
    "var(--warning)",
    "var(--danger)",
];

function memberColor(id) {
    const idx = MEMBERS_POOL.findIndex((m) => m.id === id);
    return MEMBER_COLORS[idx % MEMBER_COLORS.length];
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

function sortProjects(list, key) {
    return [...list].sort((a, b) => {
        switch (key) {
            case "name-asc":      return a.name.localeCompare(b.name);
            case "name-desc":     return b.name.localeCompare(a.name);
            case "progress-desc": return b.progress - a.progress;
            case "progress-asc":  return a.progress - b.progress;
            case "members-desc":  return b.members.length - a.members.length;
            case "updated-asc":   return new Date(a.updated) - new Date(b.updated);
            default:              return new Date(b.updated) - new Date(a.updated);
        }
    });
}

function getMemberObj(id) {
    return MEMBERS_POOL.find((m) => m.id === id);
}

/* ═══════════════════════════════════════════════════════════
   PROGRESS BAR (pure presentational)
═══════════════════════════════════════════════════════════ */

function ProgressBar({ value, label }) {
    const color =
        value === 100
            ? "var(--success)"
            : value >= 50
            ? "var(--accent)"
            : value > 0
            ? "var(--warning)"
            : "var(--text-muted)";

    return (
        <div className={styles.progressWrap}>
            <div className={styles.progressMeta}>
                <span className={styles.progressLabel}>{label ?? "Progress"}</span>
                <span className={styles.progressPct} style={{ color }}>
                    {value}%
                </span>
            </div>
            <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label ?? "Progress"}: ${value}%`}
            >
                <div
                    className={styles.progressFill}
                    style={{ width: `${value}%`, "--fill-color": color }}
                />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MEMBER STACK
═══════════════════════════════════════════════════════════ */

function MemberStack({ memberIds, max = 4 }) {
    const visible = memberIds.slice(0, max);
    const overflow = memberIds.length - max;

    return (
        <div className={styles.memberStack} aria-label={`${memberIds.length} members`}>
            {visible.map((id, i) => {
                const m = getMemberObj(id);
                return (
                    <div
                        key={id}
                        className={styles.memberAvatar}
                        style={{
                            zIndex: visible.length - i,
                            "--avatar-color": memberColor(id),
                        }}
                        title={m?.name ?? id}
                    >
                        {m ? (m.name[0] + (m.name.split(" ")[1]?.[0] ?? "")) : "?"}
                    </div>
                );
            })}
            {overflow > 0 && (
                <div className={styles.memberOverflow} title={`${overflow} more members`}>
                    +{overflow}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   PROJECT CARD
═══════════════════════════════════════════════════════════ */

function ProjectCard({ project, onAction }) {
    const meta = STATUS_META[project.archived ? "archived" : project.status];

    return (
        <GlassCard blur="md" padding="md" hover bordered className={styles.card}>
            {/* ── Header ── */}
            <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                    <span className={styles.projectIcon} aria-hidden="true">◇</span>
                    <h3 className={styles.projectName}>{project.name}</h3>
                </div>
                <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>

            {/* ── Description ── */}
            <p className={styles.projectDesc}>{project.description}</p>

            {/* ── Progress ── */}
            <ProgressBar value={project.progress} label="Progress" />

            {/* ── Footer: members + last updated ── */}
            <div className={styles.cardFooter}>
                <MemberStack memberIds={project.members} />
                <div className={styles.updatedMeta}>
                    <span className={styles.updatedIcon} aria-hidden="true">◉</span>
                    <span className={styles.updatedText}>{project.updated}</span>
                </div>
            </div>

            {/* ── Actions row (revealed on hover via CSS) ── */}
            <div className={styles.cardActions} role="group" aria-label={`Actions for ${project.name}`}>
                <button
                    className={styles.actionBtn}
                    onClick={() => onAction("view", project)}
                    aria-label={`Open ${project.name}`}
                >
                    ◎ Open
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => onAction("archive", project)}
                    aria-label={project.archived ? `Unarchive ${project.name}` : `Archive ${project.name}`}
                >
                    {project.archived ? "↑ Unarchive" : "◈ Archive"}
                </button>
                <button
                    className={[styles.actionBtn, styles.actionBtnDanger].join(" ")}
                    onClick={() => onAction("delete", project)}
                    aria-label={`Delete ${project.name}`}
                >
                    ✕ Delete
                </button>
            </div>
        </GlassCard>
    );
}

/* ═══════════════════════════════════════════════════════════
   NEW PROJECT MODAL
═══════════════════════════════════════════════════════════ */

function NewProjectModal({ onConfirm, onCancel }) {
    const [name, setName]       = useState("");
    const [desc, setDesc]       = useState("");
    const [members, setMembers] = useState([]);
    const nameId = useId();
    const descId = useId();

    function toggleMember(id) {
        setMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) return;
        onConfirm({
            name: name.trim(),
            description: desc.trim() || "No description provided.",
            members: members.length ? members : [MEMBERS_POOL[0].id],
        });
    }

    return (
        <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-project-title"
            onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
            <GlassCard blur="lg" padding="lg" hover={false} bordered className={styles.modal}>
                <h2 id="new-project-title" className={styles.modalTitle}>
                    New Project
                </h2>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    {/* Name */}
                    <div className={styles.field}>
                        <label htmlFor={nameId} className={styles.fieldLabel}>
                            Project Name <span aria-hidden="true" className={styles.required}>*</span>
                        </label>
                        <input
                            id={nameId}
                            type="text"
                            className={styles.fieldInput}
                            placeholder="e.g. Q4 Growth Strategy"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            required
                            maxLength={80}
                            aria-required="true"
                        />
                    </div>

                    {/* Description */}
                    <div className={styles.field}>
                        <label htmlFor={descId} className={styles.fieldLabel}>
                            Description
                        </label>
                        <textarea
                            id={descId}
                            className={[styles.fieldInput, styles.fieldTextarea].join(" ")}
                            placeholder="What is this project about?"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            rows={3}
                            maxLength={240}
                        />
                    </div>

                    {/* Members */}
                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>Members</span>
                        <div className={styles.memberPicker}>
                            {MEMBERS_POOL.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    className={[
                                        styles.memberPickerBtn,
                                        members.includes(m.id) ? styles.memberPickerBtnActive : "",
                                    ].join(" ")}
                                    onClick={() => toggleMember(m.id)}
                                    aria-pressed={members.includes(m.id)}
                                    style={{ "--avatar-color": memberColor(m.id) }}
                                >
                                    <span className={styles.memberPickerInitial}>
                                        {m.name[0]}{m.name.split(" ")[1]?.[0] ?? ""}
                                    </span>
                                    <span className={styles.memberPickerName}>{m.name.split(" ")[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            type="submit"
                            disabled={!name.trim()}
                        >
                            Create Project
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CONFIRM MODAL (delete)
═══════════════════════════════════════════════════════════ */

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
            <GlassCard blur="lg" padding="lg" hover={false} bordered className={[styles.modal, styles.modalSm].join(" ")}>
                <h2 id="confirm-title" className={styles.modalTitle}>Confirm</h2>
                <p className={styles.modalMessage}>{message}</p>
                <div className={styles.modalActions}>
                    <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={onConfirm}>Delete</Button>
                </div>
            </GlassCard>
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
            {msg}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   PROJECTS PAGE
═══════════════════════════════════════════════════════════ */

export default function Projects() {
    const [projects,    setProjects]  = useState(SEED_PROJECTS);
    const [search,      setSearch]    = useState("");
    const [filter,      setFilter]    = useState("All");
    const [sort,        setSort]      = useState("updated-desc");
    const [showNew,     setShowNew]   = useState(false);
    const [confirmDel,  setConfirmDel]= useState(null); // project id
    const [toast,       setToast]     = useState(null);

    /* ── Toast helper ── */
    const notify = useCallback((msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2600);
    }, []);

    /* ── Derived counts for filter chips ── */
    const counts = useMemo(() => {
        const c = { All: projects.length, active: 0, pending: 0, completed: 0, archived: 0 };
        projects.forEach((p) => {
            const key = p.archived ? "archived" : p.status;
            if (key in c) c[key]++;
        });
        return c;
    }, [projects]);

    /* ── Derived visible list ── */
    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        const filtered = projects.filter((p) => {
            const matchSearch =
                !q ||
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q);
            const statusKey = p.archived ? "archived" : p.status;
            const matchFilter = filter === "All" || statusKey === filter;
            return matchSearch && matchFilter;
        });
        return sortProjects(filtered, sort);
    }, [projects, search, filter, sort]);

    /* ── Actions ── */
    function handleAction(action, project) {
        switch (action) {
            case "view":
                notify(`Opening "${project.name}"…`, "info");
                break;

            case "archive":
                setProjects((prev) =>
                    prev.map((p) =>
                        p.id === project.id ? { ...p, archived: !p.archived } : p
                    )
                );
                notify(
                    project.archived
                        ? `"${project.name}" restored`
                        : `"${project.name}" archived`,
                    "info"
                );
                break;

            case "delete":
                setConfirmDel(project.id);
                break;

            default:
                break;
        }
    }

    function handleConfirmDelete() {
        const p = projects.find((x) => x.id === confirmDel);
        setProjects((prev) => prev.filter((x) => x.id !== confirmDel));
        setConfirmDel(null);
        notify(`"${p?.name}" deleted`, "warning");
    }

    function handleCreate({ name, description, members }) {
        const now = new Date().toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
        setProjects((prev) => [
            {
                id:          `p_${Date.now()}`,
                name,
                description,
                status:      "pending",
                progress:    0,
                members,
                updated:     now,
                created:     now,
                archived:    false,
            },
            ...prev,
        ]);
        setShowNew(false);
        notify(`"${name}" created`);
    }

    return (
        <>
            <div className={styles.page}>

                {/* ── Page header ── */}
                <header className={styles.pageHeader}>
                    <div className={styles.headerText}>
                        <h1 className={styles.pageTitle}>
                            <span aria-hidden="true">◇</span> Projects
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Manage your multi-agent projects from creation to completion.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowNew(true)}
                        aria-label="Create new project"
                    >
                        + New Project
                    </Button>
                </header>

                {/* ── Toolbar ── */}
                <div className={styles.toolbar}>
                    <SearchBar
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search projects…"
                        className={styles.searchBar}
                    />

                    <div className={styles.toolbarRight}>
                        {/* Filter chips */}
                        <div className={styles.filters} role="group" aria-label="Filter by status">
                            {FILTER_OPTIONS.map((f) => (
                                <button
                                    key={f}
                                    className={[
                                        styles.filterChip,
                                        filter === f ? styles.filterActive : "",
                                    ].join(" ")}
                                    onClick={() => setFilter(f)}
                                    aria-pressed={filter === f}
                                >
                                    {f === "All" ? "All" : STATUS_META[f]?.label ?? f}
                                    <span className={styles.chipCount}>{counts[f]}</span>
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <select
                            className={styles.sortSelect}
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            aria-label="Sort projects"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Stats strip ── */}
                <div className={styles.statsStrip}>
                    <div className={styles.statPill}>
                        <span className={styles.statValue}>{counts.active}</span>
                        <span className={styles.statLabel}>Active</span>
                    </div>
                    <div className={styles.statDivider} aria-hidden="true" />
                    <div className={styles.statPill}>
                        <span className={styles.statValue}>{counts.pending}</span>
                        <span className={styles.statLabel}>Pending</span>
                    </div>
                    <div className={styles.statDivider} aria-hidden="true" />
                    <div className={styles.statPill}>
                        <span className={styles.statValue}>{counts.completed}</span>
                        <span className={styles.statLabel}>Completed</span>
                    </div>
                    <div className={styles.statDivider} aria-hidden="true" />
                    <div className={styles.statPill}>
                        <span className={styles.statValue}>{counts.archived}</span>
                        <span className={styles.statLabel}>Archived</span>
                    </div>
                </div>

                {/* ── Project grid ── */}
                {visible.length > 0 ? (
                    <ul className={styles.grid} role="list" aria-label="Project list">
                        {visible.map((project, i) => (
                            <li
                                key={project.id}
                                className={styles.gridItem}
                                style={{ animationDelay: `${i * 0.055}s` }}
                            >
                                <ProjectCard
                                    project={project}
                                    onAction={handleAction}
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className={styles.empty} role="status">
                        <span aria-hidden="true">◇</span>
                        <p>No projects match your search.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSearch(""); setFilter("All"); }}
                        >
                            Clear filters
                        </Button>
                    </div>
                )}

                {/* ── Footer count ── */}
                {visible.length > 0 && (
                    <p className={styles.footerCount} aria-live="polite">
                        Showing <strong>{visible.length}</strong> of <strong>{projects.length}</strong> project{projects.length !== 1 ? "s" : ""}
                    </p>
                )}
            </div>

            {/* ── Modals ── */}
            {showNew && (
                <NewProjectModal
                    onConfirm={handleCreate}
                    onCancel={() => setShowNew(false)}
                />
            )}

            {confirmDel && (
                <ConfirmModal
                    message={`Delete "${projects.find((p) => p.id === confirmDel)?.name}"? This cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmDel(null)}
                />
            )}

            {/* ── Toast ── */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </>
    );
}
