import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatWindow.css';

const SUGGESTIONS = [
    { icon: '✦', label: 'Explain a concept', prompt: 'Explain a concept to me in simple terms.' },
    { icon: '⌨', label: 'Write code',         prompt: 'Help me write code for a problem.' },
    { icon: '✎', label: 'Summarize text',     prompt: 'Summarize this text for me.' },
    { icon: '⊞', label: 'Make a plan',        prompt: 'Help me make a plan for a project.' },
];

function SigmaAvatar() {
    return (
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="#10a37f"/>
            <path d="M10 10H30L18 20L30 30H10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

/* Parse stored message content back into display parts */
function parseUserContent(raw) {
    // Pattern: "[Attached PDF: filename]\n...text...\n\nUser message: user text"
    const pdfMatch = raw.match(/^\[Attached PDF: (.+?)\]\n[\s\S]*?(?:\n\nUser message: ([\s\S]*))?$/);
    if (pdfMatch) {
        return { filename: pdfMatch[1], type: 'pdf', text: (pdfMatch[2] || '').trim() };
    }
    return { filename: null, type: null, text: raw };
}

function UserMessage({ content }) {
    const { filename, type, text } = parseUserContent(content);
    return (
        <div className="user-bubble">
            {filename && type === 'pdf' && (
                <div className="user-file-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>{filename}</span>
                </div>
            )}
            {text && <p className="msg-text">{text}</p>}
        </div>
    );
}

function MarkdownContent({ content }) {
    return (
        <div className="md-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Open links in new tab safely
                    a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                    // Prevent nesting <p> inside <p> for inline elements
                    p: ({ node, ...props }) => <p className="md-p" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="md-h1" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="md-h2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="md-h3" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="md-h4" {...props} />,
                    ul: ({ node, ...props }) => <ul className="md-ul" {...props} />,
                    ol: ({ node, ...props }) => <ol className="md-ol" {...props} />,
                    li: ({ node, ...props }) => <li className="md-li" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="md-blockquote" {...props} />,
                    hr:   ({ node, ...props }) => <hr className="md-hr" {...props} />,
                    table: ({ node, ...props }) => (
                        <div className="md-table-wrap">
                            <table className="md-table" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => <th className="md-th" {...props} />,
                    td: ({ node, ...props }) => <td className="md-td" {...props} />,
                    // pre wraps block code — remove the outer pre, code handles its own pre
                    pre: ({ children }) => <>{children}</>,
                    code: ({ className, children }) => {
                        // Block: has language class OR multi-line content
                        const isBlock = Boolean(className) || String(children).includes('\n');
                        if (isBlock) {
                            const lang = (className || '').replace('language-', '');
                            return (
                                <div className="md-code-block">
                                    {lang && <div className="md-code-lang">{lang}</div>}
                                    <pre className="md-pre"><code>{children}</code></pre>
                                </div>
                            );
                        }
                        return <code className="md-inline-code">{children}</code>;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

function ChatWindow({ messages, isLoading, isTemporary, onSuggestion }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const isEmpty = messages.length === 0 && !isLoading;

    return (
        <div className={`chat-window${isEmpty ? ' empty' : ''}`}>

            {isTemporary && (
                <div className="temp-banner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Temporary chat — messages are not saved
                </div>
            )}

            {isEmpty ? (
                <div className="welcome">
                    <h1 className="welcome-title">Where should we begin?</h1>
                    <div className="suggestions">
                        {SUGGESTIONS.map(s => (
                            <button
                                key={s.label}
                                className="suggestion-btn"
                                onClick={() => onSuggestion?.(s.prompt)}
                            >
                                <span className="suggestion-icon">{s.icon}</span>
                                <span className="suggestion-label">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`msg-row msg-${msg.role}`}>
                            {msg.role === 'assistant' ? (
                                <div className="ai-row">
                                    <div className="ai-avatar"><SigmaAvatar /></div>
                                    <div className="ai-body">
                                        <MarkdownContent content={msg.content} />
                                    </div>
                                </div>
                            ) : (
                                <UserMessage content={msg.content} />
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="msg-row msg-assistant">
                            <div className="ai-row">
                                <div className="ai-avatar"><SigmaAvatar /></div>
                                <div className="ai-body typing-wrap">
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} className="scroll-anchor" />
                </div>
            )}
        </div>
    );
}

export default ChatWindow;
