/**
 * Settings — Page
 *
 * Sections: Profile · Appearance · Notifications · Security · API Keys · Danger Zone
 * Renders inside WorkspaceLayout. No backend, no API — all state is local.
 * Styling: CSS Modules (Settings.module.css) + CSS design tokens only.
 */

import { useState, useId, useRef, useCallback } from "react";

import GlassCard        from "@/components/atoms/GlassCard";
import Button           from "@/components/atoms/Button";
import Badge            from "@/components/atoms/Badge";
import Avatar           from "@/components/atoms/Avatar";
import Input            from "@/components/atoms/Input";
import ThemeToggle      from "@/components/molecules/ThemeToggle";
import LanguageSelector from "@/components/molecules/LanguageSelector";

import styles from "./Settings.module.css";

/* ═══════════════════════════════════════════════════════════
   SIDEBAR NAV
═══════════════════════════════════════════════════════════ */

const SECTIONS = [
    { id: "profile",       icon: "◎", label: "Profile"       },
    { id: "appearance",    icon: "◈", label: "Appearance"    },
    { id: "notifications", icon: "◉", label: "Notifications" },
    { id: "security",      icon: "◇", label: "Security"      },
    { id: "api-keys",      icon: "⬡", label: "API Keys"      },
    { id: "danger",        icon: "✦", label: "Danger Zone"   },
];

/* ═══════════════════════════════════════════════════════════
   SEED STATE
═══════════════════════════════════════════════════════════ */

const INITIAL_PROFILE = {
    displayName: "Alex Johnson",
    email:       "alex@example.com",
    role:        "AI Engineer",
    bio:         "Building intelligent multi-agent systems.",
    status:      "online",
};

const INITIAL_NOTIFICATIONS = {
    agentComplete:  true,
    taskFailed:     true,
    projectUpdates: false,
    weeklyDigest:   true,
    chatMentions:   true,
    systemAlerts:   true,
};

const INITIAL_SECURITY = {
    twoFactor:      false,
    sessionTimeout: "30",
    loginAlerts:    true,
};

const SEED_API_KEYS = [
    { id: "k1", name: "Production Key",   prefix: "sk-prod-",   created: "Jun 10, 2025", lastUsed: "Today"        },
    { id: "k2", name: "Development Key",  prefix: "sk-dev-",    created: "Jul 01, 2025", lastUsed: "3 days ago"   },
    { id: "k3", name: "CI / CD Pipeline", prefix: "sk-ci-",     created: "Jul 15, 2025", lastUsed: "Never"        },
];

/* ═══════════════════════════════════════════════════════════
   SMALL SHARED PRIMITIVES
═══════════════════════════════════════════════════════════ */

/** Labelled row: left label+hint, right control */
function Row({ label, hint, children, htmlFor }) {
    return (
        <div className={styles.row}>
            <div className={styles.rowLabel}>
                <label className={styles.rowTitle} htmlFor={htmlFor}>{label}</label>
                {hint && <span className={styles.rowHint}>{hint}</span>}
            </div>
            <div className={styles.rowControl}>{children}</div>
        </div>
    );
}

/** Toggle switch */
function Toggle({ checked, onChange, id, label }) {
    return (
        <label className={styles.toggle} htmlFor={id} aria-label={label}>
            <input
                id={id}
                type="checkbox"
                className={styles.toggleInput}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className={styles.toggleTrack} aria-hidden="true">
                <span className={styles.toggleThumb} />
            </span>
            {label && <span className={styles.toggleLabel}>{label}</span>}
        </label>
    );
}

/** Section wrapper */
function Section({ id, icon, title, subtitle, children }) {
    return (
        <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
            <header className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">{icon}</span>
                <div>
                    <h2 id={`${id}-title`} className={styles.sectionTitle}>{title}</h2>
                    {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
                </div>
            </header>
            <GlassCard blur="md" padding="md" hover={false} bordered className={styles.sectionCard}>
                {children}
            </GlassCard>
        </section>
    );
}

/** Divider between rows */
function Divider() {
    return <div className={styles.divider} aria-hidden="true" />;
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
                {type === "success" ? "✓" : type === "warning" ? "⚠" : "◎"}
            </span>
            {msg}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CONFIRM MODAL
═══════════════════════════════════════════════════════════ */

function ConfirmModal({ title, message, confirmLabel = "Confirm", variant = "danger", onConfirm, onCancel }) {
    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
            <GlassCard blur="lg" padding="lg" hover={false} bordered className={styles.modal}>
                <h3 id="confirm-modal-title" className={styles.modalTitle}>{title}</h3>
                <p className={styles.modalMessage}>{message}</p>
                <div className={styles.modalActions}>
                    <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
                    <Button variant={variant} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </GlassCard>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   PROFILE SECTION
═══════════════════════════════════════════════════════════ */

function ProfileSection({ notify }) {
    const [profile, setProfile] = useState(INITIAL_PROFILE);
    const [editing, setEditing] = useState(false);
    const [draft,   setDraft]   = useState(profile);

    const nameId   = useId();
    const emailId  = useId();
    const roleId   = useId();
    const bioId    = useId();
    const statusId = useId();

    function startEdit() { setDraft(profile); setEditing(true); }
    function cancel()    { setEditing(false); }

    function save() {
        if (!draft.displayName.trim() || !draft.email.trim()) return;
        setProfile(draft);
        setEditing(false);
        notify("Profile saved", "success");
    }

    return (
        <Section
            id="profile"
            icon="◎"
            title="Profile"
            subtitle="Your personal information visible across the workspace."
        >
            {/* Avatar row */}
            <div className={styles.avatarRow}>
                <Avatar name={profile.displayName} size="lg" status={profile.status} />
                <div className={styles.avatarMeta}>
                    <span className={styles.avatarName}>{profile.displayName}</span>
                    <span className={styles.avatarRole}>{profile.role}</span>
                    <Badge variant="success" dot pulse>
                        {profile.status}
                    </Badge>
                </div>
                {!editing && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={startEdit}
                        aria-label="Edit profile"
                        className={styles.editBtn}
                    >
                        Edit Profile
                    </Button>
                )}
            </div>

            <Divider />

            {editing ? (
                <div className={styles.form}>
                    <div className={styles.formGrid}>
                        <Input
                            id={nameId}
                            label="Display Name"
                            value={draft.displayName}
                            onChange={(e) => setDraft((p) => ({ ...p, displayName: e.target.value }))}
                            required
                        />
                        <Input
                            id={emailId}
                            label="Email"
                            type="email"
                            value={draft.email}
                            onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                            required
                        />
                        <Input
                            id={roleId}
                            label="Role / Title"
                            value={draft.role}
                            onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
                        />
                        <div className={styles.field}>
                            <label htmlFor={statusId} className={styles.fieldLabel}>Status</label>
                            <select
                                id={statusId}
                                className={styles.select}
                                value={draft.status}
                                onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
                            >
                                <option value="online">Online</option>
                                <option value="busy">Busy</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor={bioId} className={styles.fieldLabel}>Bio</label>
                        <textarea
                            id={bioId}
                            className={[styles.fieldInput, styles.textarea].join(" ")}
                            value={draft.bio}
                            onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                            rows={2}
                            maxLength={160}
                            placeholder="Short description about yourself"
                        />
                        <span className={styles.charCount}>{draft.bio.length}/160</span>
                    </div>
                    <div className={styles.formActions}>
                        <Button variant="ghost" size="sm" onClick={cancel}>Cancel</Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={save}
                            disabled={!draft.displayName.trim() || !draft.email.trim()}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            ) : (
                <dl className={styles.dl}>
                    <Row label="Display Name" htmlFor={nameId}>
                        <span className={styles.infoValue}>{profile.displayName}</span>
                    </Row>
                    <Divider />
                    <Row label="Email" htmlFor={emailId}>
                        <span className={styles.infoValue}>{profile.email}</span>
                    </Row>
                    <Divider />
                    <Row label="Role" htmlFor={roleId}>
                        <span className={styles.infoValue}>{profile.role}</span>
                    </Row>
                    <Divider />
                    <Row label="Bio">
                        <span className={styles.infoValue}>{profile.bio}</span>
                    </Row>
                </dl>
            )}
        </Section>
    );
}

/* ═══════════════════════════════════════════════════════════
   APPEARANCE SECTION  (Theme + Language)
═══════════════════════════════════════════════════════════ */

function AppearanceSection() {
    return (
        <Section
            id="appearance"
            icon="◈"
            title="Appearance"
            subtitle="Customise how the workspace looks and communicates."
        >
            <Row
                label="Theme"
                hint="Controls the overall colour palette of the workspace."
            >
                <ThemeToggle />
            </Row>
            <Divider />
            <Row
                label="Language"
                hint="Interface language for labels and messages."
            >
                <LanguageSelector />
            </Row>
        </Section>
    );
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS SECTION
═══════════════════════════════════════════════════════════ */

function NotificationsSection({ notify }) {
    const [prefs, setPrefs] = useState(INITIAL_NOTIFICATIONS);

    function toggle(key, val) {
        setPrefs((p) => ({ ...p, [key]: val }));
        notify(`Notification preference updated`, "success");
    }

    const rows = [
        { key: "agentComplete",  label: "Agent task completed",   hint: "When any agent finishes a task"          },
        { key: "taskFailed",     label: "Task failed",            hint: "Immediate alert on agent errors"         },
        { key: "projectUpdates", label: "Project status changes", hint: "Progress and milestone updates"          },
        { key: "chatMentions",   label: "Chat mentions",          hint: "When someone mentions you in a chat"     },
        { key: "weeklyDigest",   label: "Weekly digest",          hint: "Summary email every Monday morning"      },
        { key: "systemAlerts",   label: "System alerts",          hint: "Downtime, maintenance, and API warnings" },
    ];

    return (
        <Section
            id="notifications"
            icon="◉"
            title="Notifications"
            subtitle="Choose which events trigger in-app and email alerts."
        >
            {rows.map((r, i) => {
                const id = `notif-${r.key}`;
                return (
                    <div key={r.key}>
                        {i > 0 && <Divider />}
                        <Row label={r.label} hint={r.hint} htmlFor={id}>
                            <Toggle
                                id={id}
                                checked={prefs[r.key]}
                                onChange={(v) => toggle(r.key, v)}
                            />
                        </Row>
                    </div>
                );
            })}
        </Section>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECURITY SECTION
═══════════════════════════════════════════════════════════ */

function SecuritySection({ notify }) {
    const [sec, setSec]         = useState(INITIAL_SECURITY);
    const [changePw, setChangePw] = useState(false);
    const [pw, setPw]           = useState({ current: "", next: "", confirm: "" });

    const tfaId     = useId();
    const alertId   = useId();
    const timeoutId = useId();

    function toggleField(key, val) {
        setSec((p) => ({ ...p, [key]: val }));
        notify("Security setting updated", "success");
    }

    function savePw() {
        if (!pw.current || !pw.next || pw.next !== pw.confirm) return;
        setPw({ current: "", next: "", confirm: "" });
        setChangePw(false);
        notify("Password changed", "success");
    }

    const pwError = pw.next && pw.confirm && pw.next !== pw.confirm
        ? "Passwords do not match"
        : undefined;

    return (
        <Section
            id="security"
            icon="◇"
            title="Security"
            subtitle="Manage authentication and session settings."
        >
            <Row
                label="Two-Factor Authentication"
                hint="Adds a second verification step on login."
                htmlFor={tfaId}
            >
                <Toggle
                    id={tfaId}
                    checked={sec.twoFactor}
                    onChange={(v) => toggleField("twoFactor", v)}
                />
            </Row>
            <Divider />
            <Row
                label="Login Alerts"
                hint="Email you when a new sign-in is detected."
                htmlFor={alertId}
            >
                <Toggle
                    id={alertId}
                    checked={sec.loginAlerts}
                    onChange={(v) => toggleField("loginAlerts", v)}
                />
            </Row>
            <Divider />
            <Row
                label="Session Timeout"
                hint="Automatically sign out after inactivity."
                htmlFor={timeoutId}
            >
                <select
                    id={timeoutId}
                    className={styles.select}
                    value={sec.sessionTimeout}
                    onChange={(e) => {
                        setSec((p) => ({ ...p, sessionTimeout: e.target.value }));
                        notify("Session timeout updated", "success");
                    }}
                >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="240">4 hours</option>
                    <option value="0">Never</option>
                </select>
            </Row>
            <Divider />

            {/* Change password */}
            {changePw ? (
                <div className={styles.form}>
                    <p className={styles.formSubhead}>Change Password</p>
                    <div className={styles.formGrid}>
                        <Input
                            label="Current Password"
                            type="password"
                            value={pw.current}
                            onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                            placeholder="••••••••"
                        />
                        <Input
                            label="New Password"
                            type="password"
                            value={pw.next}
                            onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                            placeholder="Min. 8 characters"
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={pw.confirm}
                            onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                            error={pwError}
                            placeholder="Repeat new password"
                        />
                    </div>
                    <div className={styles.formActions}>
                        <Button variant="ghost" size="sm" onClick={() => setChangePw(false)}>Cancel</Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={savePw}
                            disabled={!pw.current || !pw.next || !!pwError}
                        >
                            Update Password
                        </Button>
                    </div>
                </div>
            ) : (
                <Row label="Password" hint="Last changed 45 days ago.">
                    <Button variant="outline" size="sm" onClick={() => setChangePw(true)}>
                        Change Password
                    </Button>
                </Row>
            )}
        </Section>
    );
}

/* ═══════════════════════════════════════════════════════════
   API KEYS SECTION
═══════════════════════════════════════════════════════════ */

function ApiKeysSection({ notify }) {
    const [keys,    setKeys]    = useState(SEED_API_KEYS);
    const [creating, setCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [reveal,  setReveal]  = useState({}); // { [id]: bool }
    const [confirm, setConfirm] = useState(null); // key id to delete
    const nameId = useId();

    function createKey() {
        if (!newName.trim()) return;
        const id = `k_${Date.now()}`;
        setKeys((prev) => [
            {
                id,
                name:     newName.trim(),
                prefix:   "sk-new-",
                created:  new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
                lastUsed: "Never",
            },
            ...prev,
        ]);
        setNewName("");
        setCreate(false);
        notify(`API key "${newName.trim()}" created`, "success");
    }

    function deleteKey(id) {
        const k = keys.find((x) => x.id === id);
        setKeys((prev) => prev.filter((x) => x.id !== id));
        setConfirm(null);
        notify(`"${k?.name}" revoked`, "warning");
    }

    function copyKey(key) {
        const fake = `${key.prefix}${"x".repeat(32)}`;
        navigator.clipboard?.writeText(fake).catch(() => {});
        notify("Key copied to clipboard", "success");
    }

    function toggleReveal(id) {
        setReveal((p) => ({ ...p, [id]: !p[id] }));
    }

    const masked = (prefix) => `${prefix}${"•".repeat(24)}`;
    const revealed = (prefix) => `${prefix}${"x".repeat(32)}`;

    return (
        <>
            <Section
                id="api-keys"
                icon="⬡"
                title="API Keys"
                subtitle="Manage secret keys for programmatic access to the workspace API."
            >
                {/* Header row inside card */}
                <div className={styles.apiHeader}>
                    <span className={styles.apiCount}>
                        {keys.length} key{keys.length !== 1 ? "s" : ""}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreate(true)}
                        aria-label="Create new API key"
                    >
                        + New Key
                    </Button>
                </div>

                {/* Create form */}
                {creating && (
                    <>
                        <Divider />
                        <div className={styles.form}>
                            <Input
                                id={nameId}
                                label="Key Name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Mobile App Key"
                                hint="A descriptive label to identify this key."
                            />
                            <div className={styles.formActions}>
                                <Button variant="ghost" size="sm" onClick={() => { setCreate(false); setNewName(""); }}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={createKey}
                                    disabled={!newName.trim()}
                                >
                                    Generate Key
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {keys.length === 0 ? (
                    <div className={styles.apiEmpty}>
                        <span aria-hidden="true">⬡</span>
                        <p>No API keys yet. Create one to get started.</p>
                    </div>
                ) : (
                    <ul className={styles.keyList} role="list">
                        {keys.map((k, i) => (
                            <li key={k.id}>
                                {i > 0 && <Divider />}
                                <div className={styles.keyRow}>
                                    <div className={styles.keyInfo}>
                                        <span className={styles.keyName}>{k.name}</span>
                                        <code className={styles.keyValue}>
                                            {reveal[k.id] ? revealed(k.prefix) : masked(k.prefix)}
                                        </code>
                                        <div className={styles.keyMeta}>
                                            <span>Created {k.created}</span>
                                            <span className={styles.metaDot} aria-hidden="true">·</span>
                                            <span>Last used: {k.lastUsed}</span>
                                        </div>
                                    </div>
                                    <div className={styles.keyActions}>
                                        <button
                                            className={styles.iconBtn}
                                            onClick={() => toggleReveal(k.id)}
                                            aria-label={reveal[k.id] ? "Hide key" : "Reveal key"}
                                            title={reveal[k.id] ? "Hide" : "Reveal"}
                                        >
                                            {reveal[k.id] ? "◐" : "○"}
                                        </button>
                                        <button
                                            className={styles.iconBtn}
                                            onClick={() => copyKey(k)}
                                            aria-label="Copy key"
                                            title="Copy"
                                        >
                                            ◈
                                        </button>
                                        <button
                                            className={[styles.iconBtn, styles.iconBtnDanger].join(" ")}
                                            onClick={() => setConfirm(k.id)}
                                            aria-label={`Revoke ${k.name}`}
                                            title="Revoke"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>

            {confirm && (
                <ConfirmModal
                    title="Revoke API Key"
                    message={`Revoking "${keys.find((k) => k.id === confirm)?.name}" will immediately invalidate it. Any integrations using this key will stop working.`}
                    confirmLabel="Revoke Key"
                    onConfirm={() => deleteKey(confirm)}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════
   DANGER ZONE SECTION
═══════════════════════════════════════════════════════════ */

function DangerZoneSection({ notify }) {
    const [modal, setModal] = useState(null); // "clear-data" | "reset" | "delete"

    const ACTIONS = [
        {
            id:      "clear-data",
            label:   "Clear All Data",
            hint:    "Permanently remove all projects, files, and chat history. Your account remains active.",
            btnLabel: "Clear Data",
            confirm: "This will permanently delete all your projects, files, and conversations. This cannot be undone.",
            confirmLabel: "Yes, Clear Everything",
            toastMsg: "All data cleared",
            toastType: "warning",
        },
        {
            id:      "reset",
            label:   "Reset Workspace",
            hint:    "Restore workspace to default settings. Your data is preserved.",
            btnLabel: "Reset",
            confirm: "Workspace settings will be reset to defaults. Your projects and files will not be deleted.",
            confirmLabel: "Yes, Reset",
            toastMsg: "Workspace reset to defaults",
            toastType: "warning",
        },
        {
            id:      "delete",
            label:   "Delete Account",
            hint:    "Permanently delete your account and all associated data. This action is irreversible.",
            btnLabel: "Delete Account",
            confirm: "Your account and all data will be permanently deleted. This cannot be undone.",
            confirmLabel: "Yes, Delete My Account",
            toastMsg: "Account deleted",
            toastType: "warning",
        },
    ];

    const active = ACTIONS.find((a) => a.id === modal);

    return (
        <>
            <section
                id="danger"
                className={[styles.section, styles.sectionDanger].join(" ")}
                aria-labelledby="danger-title"
            >
                <header className={styles.sectionHeader}>
                    <span className={styles.sectionIconDanger} aria-hidden="true">✦</span>
                    <div>
                        <h2 id="danger-title" className={styles.sectionTitle}>Danger Zone</h2>
                        <p className={styles.sectionSubtitle}>
                            Irreversible actions. Read each description carefully before proceeding.
                        </p>
                    </div>
                </header>
                <GlassCard blur="md" padding="md" hover={false} bordered className={styles.dangerCard}>
                    {ACTIONS.map((a, i) => (
                        <div key={a.id}>
                            {i > 0 && <Divider />}
                            <div className={styles.dangerRow}>
                                <div className={styles.dangerText}>
                                    <span className={styles.dangerLabel}>{a.label}</span>
                                    <span className={styles.dangerHint}>{a.hint}</span>
                                </div>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setModal(a.id)}
                                    aria-label={a.btnLabel}
                                >
                                    {a.btnLabel}
                                </Button>
                            </div>
                        </div>
                    ))}
                </GlassCard>
            </section>

            {active && (
                <ConfirmModal
                    title={active.label}
                    message={active.confirm}
                    confirmLabel={active.confirmLabel}
                    variant="danger"
                    onConfirm={() => {
                        setModal(null);
                        notify(active.toastMsg, active.toastType);
                    }}
                    onCancel={() => setModal(null)}
                />
            )}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS PAGE ROOT
═══════════════════════════════════════════════════════════ */

export default function Settings() {
    const [active, setActive] = useState("profile");
    const [toast,  setToast]  = useState(null);

    const notify = useCallback((msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2600);
    }, []);

    function scrollTo(id) {
        setActive(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return (
        <>
            <div className={styles.page}>

                {/* ── Page header ── */}
                <header className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            <span aria-hidden="true">⚙</span> Settings
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Manage your profile, workspace preferences, and account security.
                        </p>
                    </div>
                </header>

                {/* ── Layout: sidebar nav + content ── */}
                <div className={styles.layout}>

                    {/* Sticky sidebar */}
                    <nav className={styles.nav} aria-label="Settings sections">
                        <ul className={styles.navList} role="list">
                            {SECTIONS.map((s) => (
                                <li key={s.id}>
                                    <button
                                        className={[
                                            styles.navItem,
                                            active === s.id ? styles.navItemActive : "",
                                        ].join(" ")}
                                        onClick={() => scrollTo(s.id)}
                                        aria-current={active === s.id ? "location" : undefined}
                                    >
                                        <span className={styles.navIcon} aria-hidden="true">{s.icon}</span>
                                        <span className={styles.navLabel}>{s.label}</span>
                                        {s.id === "danger" && (
                                            <span className={styles.navDot} aria-hidden="true" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Content column */}
                    <div className={styles.content}>
                        <ProfileSection       notify={notify} />
                        <AppearanceSection    />
                        <NotificationsSection notify={notify} />
                        <SecuritySection      notify={notify} />
                        <ApiKeysSection       notify={notify} />
                        <DangerZoneSection    notify={notify} />
                    </div>
                </div>
            </div>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </>
    );
}
