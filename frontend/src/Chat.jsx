import { useState, useRef } from 'react';
import './Chat.css';

function Chat({ onSend, isLoading }) {
    const [input, setInput]         = useState('');
    const [file, setFile]           = useState(null);    // { raw: File, preview: string|null }
    const textareaRef               = useRef(null);
    const fileInputRef              = useRef(null);

    const canSend = (input.trim().length > 0 || file !== null) && !isLoading;

    const submit = () => {
        if (!canSend) return;
        onSend(input.trim(), file?.raw ?? null);
        setInput('');
        setFile(null);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    };

    const handleChange = (e) => {
        setInput(e.target.value);
        const ta = textareaRef.current;
        if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'; }
    };

    const handleFileChange = (e) => {
        const picked = e.target.files?.[0];
        if (!picked) return;
        const isImage = picked.type.startsWith('image/');
        const preview = isImage ? URL.createObjectURL(picked) : null;
        setFile({ raw: picked, preview });
        e.target.value = '';   // allow re-picking same file
    };

    const removeFile = () => {
        if (file?.preview) URL.revokeObjectURL(file.preview);
        setFile(null);
    };

    return (
        <div className="chat-input-area">
            <div className="chat-box">

                {/* Attached file preview */}
                {file && (
                    <div className="chat-file-preview">
                        {file.preview ? (
                            <img src={file.preview} alt={file.raw.name} className="file-thumb" />
                        ) : (
                            <div className="file-icon-wrap">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                            </div>
                        )}
                        <span className="file-name">{file.raw.name}</span>
                        <button className="file-remove" onClick={removeFile} title="Remove file">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                )}

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    className="chat-textarea"
                    placeholder="Ask anything"
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isLoading}
                />

                {/* Toolbar */}
                <div className="chat-toolbar">
                    <div className="chat-tools-left">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        {/* Attach button */}
                        <button
                            className="tool-btn"
                            title="Attach image or PDF"
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                            </svg>
                        </button>
                    </div>

                    <div className="chat-tools-right">
                        {isLoading ? (
                            <button className="send-btn" disabled>
                                <span className="send-loading" />
                            </button>
                        ) : (
                            <button
                                className={`send-btn${canSend ? ' ready' : ''}`}
                                onClick={submit}
                                disabled={!canSend}
                                title="Send (Enter)"
                                type="button"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5"/>
                                    <polyline points="5 12 12 5 19 12"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="chat-disclaimer">
                SigmaGPT can make mistakes. Consider checking important information.
            </p>
        </div>
    );
}

export default Chat;
