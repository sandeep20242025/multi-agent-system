/**
 * Workspace — AI Chat Interface
 *
 * Clean three-column layout: sidebar / chat / context panel.
 * No statistics, no decorative widgets, no fake system metrics.
 * Pure UI — no API, no WebSocket, no backend.
 */

import { useState, useRef, useCallback, useEffect, useId } from "react";

import Button    from "@/components/atoms/Button";
import Badge     from "@/components/atoms/Badge";
import Avatar    from "@/components/atoms/Avatar";
import Loader    from "@/components/atoms/Loader";
import SearchBar from "@/components/molecules/SearchBar";

import styles from "./Workspace.module.css";

/* ─────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────── */

const HISTORY = [
    { id: "h1", title: "Market Research Report",  time: "2m ago",    unread: 2 },
    { id: "h2", title: "Product Launch Strategy", time: "1h ago",    unread: 0 },
    { id: "h3", title: "Q3 Forecast Analysis",    time: "3h ago",    unread: 0 },
    { id: "h4", title: "Customer Insights",       time: "Yesterday", unread: 0 },
    { id: "h5", title: "Competitive Analysis v2", time: "2d ago",    unread: 0 },
    { id: "h6", title: "Executive Summary Draft", time: "3d ago",    unread: 0 },
];

const PROJECTS = ["Market Research", "Product Launch", "Forecasting"];

const SEED_MESSAGES = [
    {
        id: "m1",
        role: "user",
        content: "Analyze the top 5 competitors in the enterprise AI market and provide a competitive matrix.",
        time: "09:14 AM",
    },
    {
        id: "m2",
        role: "ai",
        agent: "Planner",
        content: "Understood. I'm coordinating the Research and Analyzer agents to build a comprehensive competitive matrix. I'll report back once all data is collected and structured.\n\n**Step 1** — Research Agent is gathering company profiles.\n**Step 2** — Analyzer Agent will score each dimension.\n**Step 3** — I will compile the final matrix.",
        time: "09:14 AM",
    },
    {
        id: "m3",
        role: "ai",
        agent: "Research",
        content: "Research complete. Here are the five competitors identified:\n\n1. **OpenAI** — GPT-4o, broad API, strong brand\n2. **Anthropic** — Claude 3.5, safety-focused\n3. **Google DeepMind** — Gemini Ultra, Workspace integration\n4. **Mistral AI** — Open-weight models, EU-based\n5. **Cohere** — Enterprise RAG, Command R+\n\nPassing to Analyzer Agent.",
        time: "09:15 AM",
    },
    {
        id: "m4",
        role: "ai",
        agent: "Analyzer",
        content: "Analysis complete:\n\n```\nDimension          OpenAI  Anthropic  Google  Mistral  Cohere\n────────────────────────────────────────────────────────────\nModel Quality        9.2      9.0       8.8     8.2      8.0\nEnterprise Ready     8.5      8.8       9.0     7.0      9.2\nPricing              7.0      7.5       7.8     9.5      8.0\nSafety               8.0      9.5       8.2     8.5      8.0\nAPI Maturity         9.5      8.5       9.0     7.5      8.8\n────────────────────────────────────────────────────────────\nOverall              8.4      8.7       8.6     8.1      8.4\n```",
        time: "09:16 AM",
    },
    {
        id: "m5",
        role: "user",
        content: "Great. What is our primary differentiation opportunity based on this?",
        time: "09:17 AM",
    },
    {
        id: "m6",
        role: "ai",
        agent: "Planner",
        content: "Based on the matrix, your clearest differentiation opportunity is **multi-agent orchestration**.\n\nNo competitor currently offers native, transparent coordination between specialised agents at the enterprise tier. This positions you in a gap that none of the five can address without significant architectural changes.\n\nRecommended focus areas:\n- Auditable agent pipelines for regulated industries\n- Seamless handoff between Research → Analyzer → Writer agents\n- Native integrations with enterprise tools (Salesforce, SAP, Notion)",
        time: "09:18 AM",
    },
];

const ACTIVE_AGENTS = [
    { id: "planner",  name: "Planner",  status: "online"  },
    { id: "research", name: "Research", status: "online"  },
    { id: "analyzer", name: "Analyzer", status: "online"  },
    { id: "writer",   name: "Writer",   status: "offline" },
];

const CONTEXT_FILES = [
    { id: "f1", name: "Q3-Financial-Report.pdf",  size: "2.4 MB" },
    { id: "f2", name: "competitor-matrix.xlsx",   size: "840 KB" },
    { id: "f3", name: "brand-guidelines.docx",    size: "1.1 MB" },
];

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

/** Render **bold** and code fences — minimal, no library */
function MessageContent({ text }) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith("```")) {
                    const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
                    return (
                        <div key={i} className={styles.codeBlock}>
                            <div className={styles.codeBar}>
                                <span className={styles.codeLabel}>Code</span>
                                <button
                                    type="button"
                                    className={styles.codeCopy}
                                    aria-label="Copy code to clipboard"
                                    onClick={() => navigator.clipboard?.writeText(code)}
                                >
                                    Copy
                                </button>
                            </div>
                            <pre className={styles.codePre}><code>{code}</code></pre>
                        </div>
                    );
                }
                return (
                    <span key={i}>
                        {part.split("\n").map((line, j) => {
                            if (!line.trim()) return <br key={j} />;
                            const html = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                            return (
                                <p
                                    key={j}
                                    className={styles.msgPara}
                                    // eslint-disable-next-line react/no-danger
                                    dangerouslySetInnerHTML={{ __html: html }}
                                />
                            );
                        })}
                    </span>
                );
            })}
        </>
    );
}

/* ─────────────────────────────────────────────────────────
   WORKSPACE
───────────────────────────────────────────────────────── */
function Workspace() {
    const [activeConv,   setActiveConv]   = useState("h1");
    const [messages,     setMessages]     = useState(SEED_MESSAGES);
    const [prompt,       setPrompt]       = useState("");
    const [isTyping,     setIsTyping]     = useState(false);
    const [search,       setSearch]       = useState("");
    const [attachments,  setAttachments]  = useState([]);
    const [showScrollBtn,setShowScrollBtn]= useState(false);
    const [sidebarOpen,  setSidebarOpen]  = useState(true);
    const [panelOpen,    setPanelOpen]    = useState(true);

    const endRef      = useRef(null);
    const bodyRef     = useRef(null);
    const textareaRef = useRef(null);
    const fileRef     = useRef(null);
    const newId       = useId();

    /* Auto-scroll to bottom on new messages */
    useEffect(() => {
        if (!isTyping) endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    /* Show scroll-to-bottom button */
    useEffect(() => {
        const el = bodyRef.current;
        if (!el) return;
        const fn = () => setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
        el.addEventListener("scroll", fn, { passive: true });
        return () => el.removeEventListener("scroll", fn);
    }, []);

    /* Textarea auto-resize */
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${Math.min(ta.scrollHeight, 144)}px`;
    }, [prompt]);

    /* Send message */
    const send = useCallback(() => {
        const text = prompt.trim();
        if (!text) return;
        setMessages(prev => [...prev, {
            id: `u_${Date.now()}`,
            role: "user",
            content: text,
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        }]);
        setPrompt("");
        setAttachments([]);
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: `a_${Date.now()}`,
                role: "ai",
                agent: "Planner",
                content: `I've received your message. Let me coordinate the relevant agents to address this request.\n\n**Your query:** "${text.slice(0, 80)}${text.length > 80 ? "…" : ""}"`,
                time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            }]);
        }, 1600);
    }, [prompt]);

    const onKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); send(); }
        if (e.key === "Escape") setPrompt("");
    }, [send]);

    const onDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).slice(0, 3);
        setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size }))].slice(0, 3));
    };

    const filteredHistory = HISTORY.filter(h =>
        !search || h.title.toLowerCase().includes(search.toLowerCase())
    );

    const activeTitle = HISTORY.find(h => h.id === activeConv)?.title ?? "New Chat";

    /* ── RENDER ─────────────────────────────────────────── */
    return (
        <div
            className={styles.root}
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
        >
            {/* ════════════════════════
                LEFT SIDEBAR
            ════════════════════════ */}
            <aside
                className={[styles.sidebar, !sidebarOpen ? styles.sidebarClosed : ""].join(" ")}
                aria-label="Chat sidebar"
            >
                {sidebarOpen ? (
                    <div className={styles.sidebarInner}>

                        {/* Top row */}
                        <div className={styles.sidebarTop}>
                            <button
                                type="button"
                                className={styles.newChatBtn}
                                onClick={() => { setMessages([]); setActiveConv(newId); textareaRef.current?.focus(); }}
                                aria-label="Start a new chat"
                            >
                                <span aria-hidden="true">+</span> New Chat
                            </button>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => setSidebarOpen(false)}
                                aria-label="Collapse sidebar"
                            >
                                ←
                            </button>
                        </div>

                        {/* Search */}
                        <SearchBar
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search chats…"
                            className={styles.search}
                        />

                        {/* History */}
                        <nav aria-label="Chat history">
                            <p className={styles.navLabel}>Recent</p>
                            <ul className={styles.historyList} role="list">
                                {filteredHistory.map(h => (
                                    <li key={h.id}>
                                        <button
                                            type="button"
                                            className={[styles.historyItem, h.id === activeConv ? styles.historyActive : ""].join(" ")}
                                            onClick={() => setActiveConv(h.id)}
                                            aria-current={h.id === activeConv ? "true" : undefined}
                                        >
                                            <span className={styles.historyTitle}>{h.title}</span>
                                            <span className={styles.historyMeta}>
                                                {h.unread > 0 && (
                                                    <Badge variant="primary" className={styles.unreadDot}>{h.unread}</Badge>
                                                )}
                                                <span className={styles.historyTime}>{h.time}</span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Projects */}
                        <nav aria-label="Projects">
                            <p className={styles.navLabel}>Projects</p>
                            <ul className={styles.navList} role="list">
                                {PROJECTS.map(p => (
                                    <li key={p}>
                                        <button type="button" className={styles.navItem}>
                                            <span className={styles.navDot} aria-hidden="true" />
                                            {p}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Bottom links */}
                        <div className={styles.sidebarFooter}>
                            {[["◈", "Files"], ["⚙", "Settings"]].map(([icon, label]) => (
                                <button key={label} type="button" className={styles.footerLink}>
                                    <span aria-hidden="true">{icon}</span>
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Collapsed rail */
                    <div className={styles.sidebarRail}>
                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Expand sidebar"
                        >
                            →
                        </button>
                        <button
                            type="button"
                            className={styles.railNewChat}
                            onClick={() => { setSidebarOpen(true); setMessages([]); setActiveConv(newId); }}
                            aria-label="New chat"
                        >
                            +
                        </button>
                    </div>
                )}
            </aside>

            {/* ════════════════════════
                CENTER — CHAT
            ════════════════════════ */}
            <main className={styles.center} aria-label="Chat area">

                {/* Header */}
                <header className={styles.chatHeader}>
                    <div className={styles.chatHeaderLeft}>
                        {!sidebarOpen && (
                            <button type="button" className={styles.iconBtn} onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                                ☰
                            </button>
                        )}
                        <span className={styles.chatTitle}>{activeTitle}</span>
                    </div>
                    <div className={styles.chatHeaderRight}>
                        <Badge variant="success" dot pulse>Live</Badge>
                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => setPanelOpen(v => !v)}
                            aria-label={panelOpen ? "Close context panel" : "Open context panel"}
                            aria-expanded={panelOpen}
                        >
                            {panelOpen ? "⊟" : "⊞"}
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div
                    ref={bodyRef}
                    className={styles.chatBody}
                    role="log"
                    aria-live="polite"
                    aria-label="Conversation messages"
                >
                    {messages.length === 0 ? (
                        /* Empty state */
                        <div className={styles.empty}>
                            <p className={styles.emptyTitle}>What can I help you with?</p>
                            <p className={styles.emptySubtitle}>
                                Your agent pipeline is ready. Describe a task and the agents will collaborate to complete it.
                            </p>
                            <div className={styles.emptyChips}>
                                {["Analyze my competitors", "Summarize this document", "Write an executive brief", "Research market trends"].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        className={styles.chip}
                                        onClick={() => { setPrompt(s); textareaRef.current?.focus(); }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.msgList}>
                            {messages.map(msg => (
                                <article
                                    key={msg.id}
                                    className={[styles.msg, msg.role === "user" ? styles.msgUser : styles.msgAi].join(" ")}
                                    aria-label={msg.role === "user" ? "Your message" : `${msg.agent} agent message`}
                                >
                                    {msg.role === "ai" && (
                                        <div className={styles.aiMeta}>
                                            <Avatar name={msg.agent} size="xs" status="online" />
                                            <span className={styles.agentName}>{msg.agent} Agent</span>
                                            <span className={styles.msgTime}>{msg.time}</span>
                                        </div>
                                    )}
                                    <div className={[styles.bubble, msg.role === "user" ? styles.bubbleUser : styles.bubbleAi].join(" ")}>
                                        <MessageContent text={msg.content} />
                                    </div>
                                    {msg.role === "user" && (
                                        <span className={styles.msgTime}>{msg.time}</span>
                                    )}
                                    {msg.role === "ai" && (
                                        <div className={styles.msgActions}>
                                            <button type="button" className={styles.msgAction} aria-label="Regenerate response">Regenerate</button>
                                            <button type="button" className={styles.msgAction} aria-label="Copy response" onClick={() => navigator.clipboard?.writeText(msg.content)}>Copy</button>
                                        </div>
                                    )}
                                </article>
                            ))}

                            {isTyping && (
                                <div className={styles.typing} aria-live="polite" aria-label="Agents are responding">
                                    <Avatar name="Planner" size="xs" status="busy" />
                                    <span className={styles.typingText}>Planner Agent is thinking</span>
                                    <span className={styles.typingDots} aria-hidden="true">
                                        <span /><span /><span />
                                    </span>
                                </div>
                            )}

                            <div ref={endRef} aria-hidden="true" />
                        </div>
                    )}

                    {showScrollBtn && (
                        <button
                            type="button"
                            className={styles.scrollBtn}
                            onClick={() => endRef.current?.scrollIntoView({ behavior: "smooth" })}
                            aria-label="Scroll to latest message"
                        >
                            ↓
                        </button>
                    )}
                </div>

                {/* Input */}
                <footer className={styles.inputArea} aria-label="Message input">
                    {attachments.length > 0 && (
                        <div className={styles.attachments} role="list" aria-label="Attachments">
                            {attachments.map((a, i) => (
                                <div key={i} className={styles.attachChip} role="listitem">
                                    <span className={styles.attachName}>{a.name}</span>
                                    <button
                                        type="button"
                                        className={styles.attachRemove}
                                        aria-label={`Remove ${a.name}`}
                                        onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.inputRow}>
                        {/* Upload */}
                        <button
                            type="button"
                            className={styles.inputIconBtn}
                            aria-label="Attach a file"
                            onClick={() => fileRef.current?.click()}
                        >
                            ⊕
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            multiple
                            accept=".pdf,.docx,.xlsx,.csv,.txt,.md"
                            className={styles.hiddenFile}
                            tabIndex={-1}
                            aria-hidden="true"
                            onChange={e => {
                                const files = Array.from(e.target.files ?? []).slice(0, 3);
                                setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size }))].slice(0, 3));
                                e.target.value = "";
                            }}
                        />

                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            className={styles.textarea}
                            value={prompt}
                            rows={1}
                            maxLength={4000}
                            placeholder="Message the agent pipeline… (Ctrl+Enter to send)"
                            aria-label="Message"
                            aria-multiline="true"
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={onKeyDown}
                            spellCheck
                        />

                        {/* Send / Stop */}
                        {isTyping ? (
                            <button
                                type="button"
                                className={styles.stopBtn}
                                aria-label="Stop generation"
                                onClick={() => setIsTyping(false)}
                            >
                                ◼
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={[styles.sendBtn, !prompt.trim() ? styles.sendBtnOff : ""].join(" ")}
                                aria-label="Send message"
                                disabled={!prompt.trim()}
                                onClick={send}
                            >
                                ↑
                            </button>
                        )}
                    </div>

                    <p className={styles.inputHint}>
                        <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to send · <kbd>Esc</kbd> to clear
                    </p>
                </footer>
            </main>

            {/* ════════════════════════
                RIGHT PANEL — Context
            ════════════════════════ */}
            <aside
                className={[styles.panel, !panelOpen ? styles.panelClosed : ""].join(" ")}
                aria-label="Session context"
                aria-hidden={!panelOpen}
            >
                {panelOpen && (
                    <div className={styles.panelInner}>

                        {/* Active Agents */}
                        <section aria-labelledby="agents-label">
                            <h2 id="agents-label" className={styles.panelHeading}>Active Agents</h2>
                            <ul className={styles.agentList} role="list">
                                {ACTIVE_AGENTS.map(a => (
                                    <li key={a.id} className={styles.agentRow}>
                                        <Avatar name={a.name} size="xs" status={a.status} />
                                        <span className={styles.agentLabel}>{a.name}</span>
                                        <Badge
                                            variant={a.status === "online" ? "success" : "ghost"}
                                            dot
                                        >
                                            {a.status}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <hr className={styles.divider} />

                        {/* Session info */}
                        <section aria-labelledby="session-label">
                            <h2 id="session-label" className={styles.panelHeading}>Current Session</h2>
                            <dl className={styles.infoList}>
                                <div className={styles.infoRow}>
                                    <dt>Task</dt>
                                    <dd>Competitive Analysis</dd>
                                </div>
                                <div className={styles.infoRow}>
                                    <dt>Model</dt>
                                    <dd>IBM Granite 3.3</dd>
                                </div>
                                <div className={styles.infoRow}>
                                    <dt>Context</dt>
                                    <dd>72% used</dd>
                                </div>
                            </dl>
                        </section>

                        <hr className={styles.divider} />

                        {/* Files */}
                        <section aria-labelledby="files-label">
                            <h2 id="files-label" className={styles.panelHeading}>Attached Files</h2>
                            <ul className={styles.fileList} role="list">
                                {CONTEXT_FILES.map(f => (
                                    <li key={f.id} className={styles.fileRow}>
                                        <span className={styles.fileIcon} aria-hidden="true">◈</span>
                                        <span className={styles.fileName} title={f.name}>{f.name}</span>
                                        <span className={styles.fileSize}>{f.size}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                    </div>
                )}
            </aside>
        </div>
    );
}

export default Workspace;
