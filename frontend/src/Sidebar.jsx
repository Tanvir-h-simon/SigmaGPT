import { useState, useMemo } from 'react';
import './Sidebar.css';

/* Custom Sigma logo */
function SigmaIcon({ size = 24 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="#10a37f"/>
            <path d="M10 10H30L18 20L30 30H10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function groupByDate(threads) {
    const now = new Date();
    const startOf = (offset = 0) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        d.setDate(d.getDate() - offset);
        return d;
    };
    const today     = startOf(0);
    const yesterday = startOf(1);
    const week      = startOf(7);
    const month     = startOf(30);

    const groups = {
        'Today':           [],
        'Yesterday':       [],
        'Previous 7 days': [],
        'Previous 30 days':[],
        'Older':           [],
    };
    threads.forEach(t => {
        const d = new Date(t.updatedAt);
        if      (d >= today)     groups['Today'].push(t);
        else if (d >= yesterday) groups['Yesterday'].push(t);
        else if (d >= week)      groups['Previous 7 days'].push(t);
        else if (d >= month)     groups['Previous 30 days'].push(t);
        else                     groups['Older'].push(t);
    });
    return groups;
}

function Sidebar({
    threads, activeThreadId, user,
    onToggleSidebar, onNewChat, onSelectThread, onDeleteThread, onLogout,
}) {
    const [search, setSearch]     = useState('');
    const [hovered, setHovered]   = useState(null);
    const [pending, setPending]   = useState(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return threads;
        const q = search.toLowerCase();
        return threads.filter(t => t.title.toLowerCase().includes(q));
    }, [threads, search]);

    const grouped = useMemo(() => groupByDate(filtered), [filtered]);

    const confirmDelete = (e, id) => { e.stopPropagation(); setPending(id); };
    const doDelete      = (e, id) => { e.stopPropagation(); onDeleteThread(id); setPending(null); };
    const cancelDelete  = (e)     => { e.stopPropagation(); setPending(null); };

    /* Avatar: first letter of name, fall back to email */
    const userInitial = (user?.name?.[0] || user?.email?.[0] || '?').toUpperCase();
    const displayName = user?.name || user?.email?.split('@')[0] || 'User';

    return (
        <aside className="sidebar">

            {/* ── Header: logo + collapse only ── */}
            <div className="sb-header">
                <div className="sb-logo">
                    <SigmaIcon size={28} />
                    <span className="sb-logo-text">SigmaGPT</span>
                </div>
                <button className="sb-icon-btn" onClick={onToggleSidebar} title="Close sidebar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                </button>
            </div>

            {/* ── New chat button ── */}
            <div className="sb-new-chat-row">
                <button className="sb-new-chat-btn" onClick={onNewChat}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    New chat
                </button>
            </div>

            {/* ── Search ── */}
            <div className="sb-search-row">
                <div className="sb-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search chats"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="sb-search-clear" onClick={() => setSearch('')}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Thread list ── */}
            <nav className="sb-threads">
                {threads.length === 0 && (
                    <p className="sb-empty">No conversations yet.<br/>Start a new chat!</p>
                )}
                {threads.length > 0 && filtered.length === 0 && (
                    <p className="sb-empty">No results for &ldquo;{search}&rdquo;</p>
                )}

                {Object.entries(grouped).map(([label, items]) =>
                    items.length === 0 ? null : (
                        <div key={label} className="sb-group">
                            <p className="sb-group-label">{label}</p>
                            {items.map(thread => (
                                <div key={thread.threadId} className="sb-item-wrap">
                                    {pending === thread.threadId ? (
                                        <div className="sb-item sb-confirm">
                                            <span className="sb-confirm-text">Delete this chat?</span>
                                            <div className="sb-confirm-btns">
                                                <button className="sb-confirm-yes" onClick={e => doDelete(e, thread.threadId)}>Delete</button>
                                                <button className="sb-confirm-no"  onClick={cancelDelete}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`sb-item${activeThreadId === thread.threadId ? ' active' : ''}`}
                                            onClick={() => onSelectThread(thread.threadId)}
                                            onMouseEnter={() => setHovered(thread.threadId)}
                                            onMouseLeave={() => setHovered(null)}
                                        >
                                            <span className="sb-item-title">{thread.title}</span>
                                            {(hovered === thread.threadId || activeThreadId === thread.threadId) && (
                                                <button
                                                    className="sb-item-del"
                                                    onClick={e => confirmDelete(e, thread.threadId)}
                                                    title="Delete chat"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6l-1 14H6L5 6"/>
                                                        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </nav>

            {/* ── Profile ── */}
            <div className="sb-profile">
                <div className="sb-profile-left">
                    <div className="sb-avatar">{userInitial}</div>
                    <div className="sb-profile-info">
                        <span className="sb-profile-name">{displayName}</span>
                        <span className="sb-profile-email">{user?.email}</span>
                    </div>
                </div>
                <button className="sb-icon-btn sb-logout" onClick={onLogout} title="Log out">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;
