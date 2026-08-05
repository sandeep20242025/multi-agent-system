/**
 * Files — File Manager Page
 *
 * Renders inside WorkspaceLayout as the main content slot.
 * Google Drive-inspired layout: upload zone, toolbar, grid/list toggle.
 * Pure UI — no upload logic, no API, no backend.
 * Styling: CSS Modules (Files.module.css) + CSS tokens only.
 */

import { useState, useRef, useCallback, useId } from "react";

import Button    from "@/components/atoms/Button";
import Badge     from "@/components/atoms/Badge";
import GlassCard from "@/components/atoms/GlassCard";
import Loader    from "@/components/atoms/Loader";
import SearchBar from "@/components/molecules/SearchBar";

import styles from "./Files.module.css";

/* ─────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────── */

const SEED_FILES = [
    { id: "f01", name: "Q3-Financial-Report.pdf",        type: "PDF",   size: "2.4 MB",  date: "Jul 28, 2025", status: "ready",      category: "document" },
    { id: "f02", name: "competitor-matrix.xlsx",         type: "XLSX",  size: "840 KB",  date: "Jul 26, 2025", status: "ready",      category: "spreadsheet" },
    { id: "f03", name: "brand-guidelines.docx",          type: "DOCX",  size: "1.1 MB",  date: "Jul 24, 2025", status: "ready",      category: "document" },
    { id: "f04", name: "customer-survey-2025.csv",       type: "CSV",   size: "312 KB",  date: "Jul 21, 2025", status: "ready",      category: "data" },
    { id: "f05", name: "product-roadmap-v3.pdf",         type: "PDF",   size: "4.7 MB",  date: "Jul 18, 2025", status: "ready",      category: "document" },
    { id: "f06", name: "market-analysis-notes.txt",      type: "TXT",   size: "48 KB",   date: "Jul 15, 2025", status: "ready",      category: "text" },
    { id: "f07", name: "executive-summary.md",           type: "MD",    size: "22 KB",   date: "Jul 12, 2025", status: "ready",      category: "text" },
    { id: "f08", name: "sales-data-export.csv",          type: "CSV",   size: "1.8 MB",  date: "Jul 10, 2025", status: "processing", category: "data" },
    { id: "f09", name: "investor-deck-final.pdf",        type: "PDF",   size: "6.2 MB",  date: "Jul 8, 2025",  status: "ready",      category: "document" },
    { id: "f10", name: "agent-config-planner.json",      type: "JSON",  size: "14 KB",   date: "Jul 5, 2025",  status: "ready",      category: "data" },
    { id: "f11", name: "knowledge-base-export.txt",      type: "TXT",   size: "380 KB",  date: "Jul 3, 2025",  status: "error",      category: "text" },
    { id: "f12", name: "competitive-landscape.xlsx",     type: "XLSX",  size: "920 KB",  date: "Jun 30, 2025", status: "ready",      category: "spreadsheet" },
];

const FILE_TYPE_META = {
    PDF:  { icon: "📄", color: "var(--danger)"          },
    XLSX: { icon: "📊", color: "var(--success)"         },
    DOCX: { icon: "📝", color: "var(--accent-secondary)" },
    CSV:  { icon: "📋", color: "var(--warning)"         },
    TXT:  { icon: "📃", color: "var(--text-secondary)"  },
    MD:   { icon: "📑", color: "var(--accent)"          },
    JSON: { icon: "🔧", color: "var(--accent)"          },
};

const STATUS_META = {
    ready:      { label: "Ready",      variant: "success" },
    processing: { label: "Processing", variant: "warning" },
    error:      { label: "Error",      variant: "danger"  },
};

const FILTER_OPTIONS = ["All", "PDF", "XLSX", "DOCX", "CSV", "TXT", "MD", "JSON"];

const SORT_OPTIONS = [
    { value: "date-desc",  label: "Newest first" },
    { value: "date-asc",   label: "Oldest first" },
    { value: "name-asc",   label: "Name A–Z"     },
    { value: "name-desc",  label: "Name Z–A"     },
    { value: "size-desc",  label: "Largest"      },
];

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

/** Parse a human-readable size string to bytes for sorting */
function parseSizeBytes(sizeStr) {
    const [num, unit] = sizeStr.split(" ");
    const n = parseFloat(num.replace(",", ""));
    if (unit === "KB") return n * 1024;
    if (unit === "MB") return n * 1024 * 1024;
    return n;
}

function sortFiles(files, sortKey) {
    return [...files].sort((a, b) => {
        switch (sortKey) {
            case "name-asc":   return a.name.localeCompare(b.name);
            case "name-desc":  return b.name.localeCompare(a.name);
            case "size-desc":  return parseSizeBytes(b.size) - parseSizeBytes(a.size);
            case "date-asc":   return new Date(a.date) - new Date(b.date);
            case "date-desc":
            default:           return new Date(b.date) - new Date(a.date);
        }
    });
}

/* ─────────────────────────────────────────────────────────
   FILE ROW  (list view)
───────────────────────────────────────────────────────── */
function FileRow({ file, onAction, selected, onSelect }) {
    const meta   = FILE_TYPE_META[file.type] ?? { icon: "📄", color: "var(--text-muted)" };
    const status = STATUS_META[file.status] ?? STATUS_META.ready;

    return (
        <tr
            className={[styles.row, selected ? styles.rowSelected : ""].join(" ")}
            aria-selected={selected}
        >
            <td className={styles.tdCheck}>
                <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selected}
                    onChange={() => onSelect(file.id)}
                    aria-label={`Select ${file.name}`}
                />
            </td>
            <td className={styles.tdName}>
                <div className={styles.fileNameCell}>
                    <span className={styles.fileTypeIcon} style={{ color: meta.color }} aria-hidden="true">
                        {meta.icon}
                    </span>
                    <span className={styles.fileName} title={file.name}>{file.name}</span>
                    {file.status === "processing" && <Loader size="xs" />}
                </div>
            </td>
            <td className={styles.tdType}>
                <span className={styles.typeChip}>{file.type}</span>
            </td>
            <td className={styles.tdSize}>{file.size}</td>
            <td className={styles.tdDate}>{file.date}</td>
            <td className={styles.tdStatus}>
                <Badge variant={status.variant}>{status.label}</Badge>
            </td>
            <td className={styles.tdActions}>
                <div className={styles.rowActions}>
                    <button type="button" className={styles.actionBtn} onClick={() => onAction("preview", file)} aria-label={`Preview ${file.name}`}>Preview</button>
                    <button type="button" className={styles.actionBtn} onClick={() => onAction("rename",  file)} aria-label={`Rename ${file.name}`}>Rename</button>
                    <button type="button" className={styles.actionBtn} onClick={() => onAction("download",file)} aria-label={`Download ${file.name}`}>↓</button>
                    <button type="button" className={[styles.actionBtn, styles.actionBtnDanger].join(" ")} onClick={() => onAction("delete", file)} aria-label={`Delete ${file.name}`}>✕</button>
                </div>
            </td>
        </tr>
    );
}

/* ─────────────────────────────────────────────────────────
   FILE CARD  (grid view)
───────────────────────────────────────────────────────── */
function FileCard({ file, onAction, selected, onSelect }) {
    const meta   = FILE_TYPE_META[file.type] ?? { icon: "📄", color: "var(--text-muted)" };
    const status = STATUS_META[file.status] ?? STATUS_META.ready;

    return (
        <div
            className={[styles.card, selected ? styles.cardSelected : ""].join(" ")}
            role="article"
            aria-label={file.name}
        >
            {/* Checkbox overlay */}
            <input
                type="checkbox"
                className={styles.cardCheckbox}
                checked={selected}
                onChange={() => onSelect(file.id)}
                aria-label={`Select ${file.name}`}
            />

            {/* Type icon area */}
            <div className={styles.cardIcon} style={{ color: meta.color }} aria-hidden="true">
                <span className={styles.cardIconGlyph}>{meta.icon}</span>
                <span className={styles.cardTypePill}>{file.type}</span>
            </div>

            {/* Info */}
            <div className={styles.cardInfo}>
                <p className={styles.cardName} title={file.name}>{file.name}</p>
                <div className={styles.cardMeta}>
                    <span className={styles.cardSize}>{file.size}</span>
                    <Badge variant={status.variant} className={styles.cardBadge}>{status.label}</Badge>
                </div>
                <span className={styles.cardDate}>{file.date}</span>
            </div>

            {/* Hover action bar */}
            <div className={styles.cardActions} role="group" aria-label={`Actions for ${file.name}`}>
                <button type="button" className={styles.cardActionBtn} onClick={() => onAction("preview",  file)} aria-label="Preview">Preview</button>
                <button type="button" className={styles.cardActionBtn} onClick={() => onAction("download", file)} aria-label="Download">↓ Download</button>
                <button type="button" className={styles.cardActionBtn} onClick={() => onAction("rename",   file)} aria-label="Rename">Rename</button>
                <button type="button" className={[styles.cardActionBtn, styles.cardActionBtnDanger].join(" ")} onClick={() => onAction("delete", file)} aria-label="Delete">Delete</button>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   RENAME MODAL  (inline, no library)
───────────────────────────────────────────────────────── */
function RenameModal({ file, onConfirm, onCancel }) {
    const [value, setValue] = useState(file.name);
    const inputId = useId();
    return (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="rename-title">
            <div className={styles.modal}>
                <h2 id="rename-title" className={styles.modalTitle}>Rename File</h2>
                <label htmlFor={inputId} className={styles.modalLabel}>New name</label>
                <input
                    id={inputId}
                    type="text"
                    className={styles.modalInput}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    autoFocus
                    onKeyDown={e => { if (e.key === "Enter") onConfirm(value); if (e.key === "Escape") onCancel(); }}
                    aria-label="New file name"
                />
                <div className={styles.modalActions}>
                    <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={() => onConfirm(value)} disabled={!value.trim()}>Rename</Button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   FILES PAGE
───────────────────────────────────────────────────────── */
export default function Files() {
    const [files,       setFiles]       = useState(SEED_FILES);
    const [search,      setSearch]      = useState("");
    const [filter,      setFilter]      = useState("All");
    const [sort,        setSort]        = useState("date-desc");
    const [view,        setView]        = useState("list");    // "list" | "grid"
    const [selected,    setSelected]    = useState(new Set());
    const [isDragging,  setIsDragging]  = useState(false);
    const [renaming,    setRenaming]    = useState(null);      // file being renamed
    const [notification, setNotify]    = useState(null);      // { msg, type }

    const fileInputRef = useRef(null);

    /* ── Helpers ──────────────────────────────────────────── */
    const notify = useCallback((msg, type = "success") => {
        setNotify({ msg, type });
        setTimeout(() => setNotify(null), 2800);
    }, []);

    /* ── Selection ────────────────────────────────────────── */
    const toggleSelect = useCallback((id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        setSelected(prev => prev.size === files.length ? new Set() : new Set(files.map(f => f.id)));
    }, [files]);

    /* ── Drag & drop ──────────────────────────────────────── */
    const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = ()  => setIsDragging(false);
    const onDrop      = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = Array.from(e.dataTransfer.files);
        addFakeFiles(dropped);
    };

    const onFileInput = (e) => {
        const picked = Array.from(e.target.files ?? []);
        addFakeFiles(picked);
        e.target.value = "";
    };

    const addFakeFiles = (rawFiles) => {
        if (!rawFiles.length) return;
        const newEntries = rawFiles.map((f, i) => {
            const ext  = f.name.split(".").pop()?.toUpperCase() ?? "TXT";
            const type = Object.keys(FILE_TYPE_META).includes(ext) ? ext : "TXT";
            const kb   = Math.round(f.size / 1024);
            const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
            return {
                id:       `new_${Date.now()}_${i}`,
                name:     f.name,
                type,
                size,
                date:     new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
                status:   "processing",
                category: "document",
            };
        });
        setFiles(prev => [...newEntries, ...prev]);
        notify(`${rawFiles.length} file${rawFiles.length > 1 ? "s" : ""} added`);
        /* Simulate processing → ready after 2s */
        setTimeout(() => {
            setFiles(prev => prev.map(f =>
                newEntries.some(n => n.id === f.id) ? { ...f, status: "ready" } : f
            ));
        }, 2000);
    };

    /* ── File actions ─────────────────────────────────────── */
    const handleAction = useCallback((action, file) => {
        switch (action) {
            case "preview":
                notify(`Previewing ${file.name}`, "info");
                break;
            case "download":
                notify(`Downloading ${file.name}…`);
                break;
            case "rename":
                setRenaming(file);
                break;
            case "delete":
                setFiles(prev => prev.filter(f => f.id !== file.id));
                setSelected(prev => { const next = new Set(prev); next.delete(file.id); return next; });
                notify(`${file.name} deleted`, "warning");
                break;
            default:
                break;
        }
    }, [notify]);

    const confirmRename = useCallback((newName) => {
        setFiles(prev => prev.map(f => f.id === renaming.id ? { ...f, name: newName.trim() } : f));
        notify(`Renamed to ${newName.trim()}`);
        setRenaming(null);
    }, [renaming, notify]);

    const deleteSelected = useCallback(() => {
        const count = selected.size;
        setFiles(prev => prev.filter(f => !selected.has(f.id)));
        setSelected(new Set());
        notify(`${count} file${count > 1 ? "s" : ""} deleted`, "warning");
    }, [selected, notify]);

    /* ── Derived list ─────────────────────────────────────── */
    const visible = sortFiles(
        files.filter(f => {
            const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === "All" || f.type === filter;
            return matchSearch && matchFilter;
        }),
        sort
    );

    const allSelected = files.length > 0 && selected.size === files.length;

    /* ─────────────────────────────────────────────────────
       RENDER
    ───────────────────────────────────────────────────── */
    return (
        <div className={styles.page}>

            {/* ── Toast notification ──────────────────── */}
            {notification && (
                <div
                    className={[styles.toast, styles[`toast_${notification.type}`]].join(" ")}
                    role="status"
                    aria-live="polite"
                >
                    {notification.msg}
                </div>
            )}

            {/* ── Rename modal ─────────────────────────── */}
            {renaming && (
                <RenameModal
                    file={renaming}
                    onConfirm={confirmRename}
                    onCancel={() => setRenaming(null)}
                />
            )}

            {/* ══════════════════════════════════════════
                HEADER
            ══════════════════════════════════════════ */}
            <header className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Files</h1>
                    <p className={styles.pageSubtitle}>{files.length} files · {selected.size > 0 ? `${selected.size} selected` : "Knowledge base"}</p>
                </div>
                <div className={styles.headerActions}>
                    {selected.size > 0 && (
                        <Button variant="danger" size="sm" onClick={deleteSelected} aria-label={`Delete ${selected.size} selected files`}>
                            Delete {selected.size}
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon="↑"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Upload files"
                    >
                        Upload
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.json"
                        className={styles.hiddenInput}
                        tabIndex={-1}
                        aria-hidden="true"
                        onChange={onFileInput}
                    />
                </div>
            </header>

            {/* ══════════════════════════════════════════
                UPLOAD ZONE
            ══════════════════════════════════════════ */}
            <div
                className={[styles.dropZone, isDragging ? styles.dropZoneActive : ""].join(" ")}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Drop files here or click to upload"
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
            >
                <span className={styles.dropIcon} aria-hidden="true">{isDragging ? "⬇" : "⊕"}</span>
                <p className={styles.dropText}>
                    {isDragging ? "Drop to upload" : "Drag & drop files here, or click to browse"}
                </p>
                <p className={styles.dropHint}>PDF, DOCX, XLSX, CSV, TXT, MD, JSON</p>
            </div>

            {/* ══════════════════════════════════════════
                TOOLBAR
            ══════════════════════════════════════════ */}
            <div className={styles.toolbar} role="toolbar" aria-label="File controls">

                {/* Search */}
                <SearchBar
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search files…"
                    className={styles.toolbarSearch}
                />

                {/* Filter chips */}
                <div className={styles.filterRow} role="group" aria-label="Filter by type">
                    {FILTER_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            type="button"
                            className={[styles.filterChip, filter === opt ? styles.filterChipActive : ""].join(" ")}
                            onClick={() => setFilter(opt)}
                            aria-pressed={filter === opt}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Right: sort + view toggle */}
                <div className={styles.toolbarRight}>
                    <label htmlFor="sort-select" className={styles.srOnly}>Sort by</label>
                    <select
                        id="sort-select"
                        className={styles.sortSelect}
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                        aria-label="Sort files"
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>

                    {/* View toggle */}
                    <div className={styles.viewToggle} role="group" aria-label="View mode">
                        <button
                            type="button"
                            className={[styles.viewBtn, view === "list" ? styles.viewBtnActive : ""].join(" ")}
                            onClick={() => setView("list")}
                            aria-pressed={view === "list"}
                            aria-label="List view"
                        >
                            ☰
                        </button>
                        <button
                            type="button"
                            className={[styles.viewBtn, view === "grid" ? styles.viewBtnActive : ""].join(" ")}
                            onClick={() => setView("grid")}
                            aria-pressed={view === "grid"}
                            aria-label="Grid view"
                        >
                            ⊞
                        </button>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                FILE LIST / GRID
            ══════════════════════════════════════════ */}
            {visible.length === 0 ? (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon} aria-hidden="true">◈</span>
                    <p className={styles.emptyText}>No files match your search.</p>
                    <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilter("All"); }}>
                        Clear filters
                    </Button>
                </div>
            ) : view === "list" ? (
                /* ── LIST VIEW ───────────────────────────────── */
                <div className={styles.tableWrap}>
                    <table className={styles.table} aria-label="Files">
                        <thead>
                            <tr>
                                <th className={styles.th} style={{ width: 36 }}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        aria-label="Select all files"
                                    />
                                </th>
                                <th className={styles.th}>Name</th>
                                <th className={styles.th}>Type</th>
                                <th className={styles.th}>Size</th>
                                <th className={styles.th}>Uploaded</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th} style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map(file => (
                                <FileRow
                                    key={file.id}
                                    file={file}
                                    onAction={handleAction}
                                    selected={selected.has(file.id)}
                                    onSelect={toggleSelect}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* ── GRID VIEW ───────────────────────────────── */
                <div className={styles.grid} role="list" aria-label="Files grid">
                    {visible.map(file => (
                        <FileCard
                            key={file.id}
                            file={file}
                            onAction={handleAction}
                            selected={selected.has(file.id)}
                            onSelect={toggleSelect}
                        />
                    ))}
                </div>
            )}

            {/* Footer count */}
            {visible.length > 0 && (
                <p className={styles.footerCount} aria-live="polite">
                    Showing {visible.length} of {files.length} files
                    {filter !== "All" && <> · filtered by <strong>{filter}</strong></>}
                </p>
            )}
        </div>
    );
}
