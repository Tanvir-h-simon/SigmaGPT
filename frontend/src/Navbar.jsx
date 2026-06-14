import { useState, useRef, useEffect } from 'react';
import './Navbar.css';

const MODELS = [
    { id: 'gpt-4o',       label: 'GPT-4o',       sub: 'Most capable' },
    { id: 'gpt-4o-mini',  label: 'GPT-4o mini',  sub: 'Faster & lighter' },
    { id: 'gpt-3.5-turbo',label: 'GPT-3.5 Turbo',sub: 'Legacy' },
];

function Navbar({ selectedModel, onModelChange, isTemporary, onToggleTemporary, sidebarOpen, onToggleSidebar }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const current = MODELS.find(m => m.id === selectedModel) || MODELS[1];

    return (
        <header className="navbar">
            <div className="navbar-left">
                {!sidebarOpen && (
                    <>
                        <button className="nb-icon-btn" onClick={onToggleSidebar} title="Open sidebar">
                            {/* sidebar open icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <line x1="9" y1="3" x2="9" y2="21"/>
                            </svg>
                        </button>
                        <button className="nb-icon-btn" onClick={() => {}} title="New chat">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
                            </svg>
                        </button>
                    </>
                )}

                {/* Model selector */}
                <div className="model-selector" ref={dropdownRef}>
                    <button
                        className="model-trigger"
                        onClick={() => setDropdownOpen(o => !o)}
                        aria-haspopup="listbox"
                        aria-expanded={dropdownOpen}
                    >
                        <span className="model-trigger-label">SigmaGPT</span>
                        <svg
                            className={`chevron${dropdownOpen ? ' open' : ''}`}
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="model-dropdown" role="listbox">
                            <p className="model-dropdown-heading">Model</p>
                            {MODELS.map(m => (
                                <button
                                    key={m.id}
                                    role="option"
                                    aria-selected={selectedModel === m.id}
                                    className={`model-option${selectedModel === m.id ? ' selected' : ''}`}
                                    onClick={() => { onModelChange(m.id); setDropdownOpen(false); }}
                                >
                                    <span className="model-option-info">
                                        <span className="model-option-label">{m.label}</span>
                                        <span className="model-option-sub">{m.sub}</span>
                                    </span>
                                    {selectedModel === m.id && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="navbar-right">
                {/* Temporary / incognito chat */}
                <button
                    className={`nb-icon-btn temp-toggle${isTemporary ? ' active' : ''}`}
                    onClick={onToggleTemporary}
                    title={isTemporary ? 'Turn off temporary chat' : 'Turn on temporary chat'}
                >
                    {/* Hat + glasses incognito SVG */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                    </svg>
                    <span className="temp-toggle-label">
                        {isTemporary ? 'Temporary chat' : 'Temporary'}
                    </span>
                </button>
            </div>
        </header>
    );
}

export default Navbar;
