import { useState, useEffect } from 'react';
import './App.css';
import Auth from './Auth';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ChatWindow from './ChatWindow';
import Chat from './Chat';

function generateThreadId() {
    return 'thread_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function apiFetch(url, options = {}) {
    return fetch(url, { credentials: 'include', ...options });
}

function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Chat state
    const [threads, setThreads] = useState([]);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [tempMessages, setTempMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isTemporary, setIsTemporary] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
    const [threadRefresh, setThreadRefresh] = useState(0);

    // Auth check on mount
    useEffect(() => {
        apiFetch('/api/auth/me')
            .then(res => (res.ok ? res.json() : null))
            .then(data => { if (data?.user) setUser(data.user); })
            .catch(() => {})
            .finally(() => setAuthLoading(false));
    }, []);

    // Load thread list when user logs in or after send/delete 
    useEffect(() => {
        if (!user) return;
        apiFetch('/api/threads')
            .then(res => res.json())
            .then(data => setThreads(Array.isArray(data) ? data : []))
            .catch(err => console.error('threads fetch:', err));
    }, [user, threadRefresh]);

    //  Load messages when active thread changes 
    useEffect(() => {
        if (!activeThreadId || isTemporary) return;
        apiFetch(`/api/threads/${activeThreadId}`)
            .then(res => (res.ok ? res.json() : null))
            .then(data => { if (data) setMessages(data.messages || []); })
            .catch(err => console.error('thread fetch:', err));
    }, [activeThreadId, isTemporary]);

    //  Handlers 
    const handleNewChat = () => {
        setActiveThreadId(null);
        setMessages([]);
        setTempMessages([]);
        setIsTemporary(false);
    };

    const handleSelectThread = (threadId) => {
        setActiveThreadId(threadId);
        setMessages([]);
        setIsTemporary(false);
        setTempMessages([]);
    };

    const handleDeleteThread = (threadId) => {
        apiFetch(`/api/threads/${threadId}`, { method: 'DELETE' })
            .then(() => {
                setThreads(prev => prev.filter(t => t.threadId !== threadId));
                if (activeThreadId === threadId) {
                    setActiveThreadId(null);
                    setMessages([]);
                }
            })
            .catch(err => console.error('delete thread:', err));
    };

    const handleToggleTemporary = () => {
        setIsTemporary(prev => !prev);
        setActiveThreadId(null);
        setMessages([]);
        setTempMessages([]);
    };

    const handleLogout = () => {
        apiFetch('/api/auth/logout', { method: 'POST' })
            .then(() => {
                setUser(null);
                setThreads([]);
                setMessages([]);
                setActiveThreadId(null);
                setTempMessages([]);
                setIsTemporary(false);
            })
            .catch(err => console.error('logout:', err));
    };

    const handleSend = async (message, file = null) => {
        if (!message.trim() && !file) return;
        if (isLoading) return;
        setIsLoading(true);

        // Display label: show filename when message is empty
        const displayContent = message.trim() || (file ? `📎 ${file.name}` : '');
        const userMsg = { role: 'user', content: displayContent, timestamp: new Date() };

        const buildForm = (extra) => {
            const form = new FormData();
            if (message.trim()) form.append('message', message.trim());
            if (file) form.append('file', file);
            Object.entries(extra).forEach(([k, v]) => form.append(k, v));
            return form;
        };

        if (isTemporary) {
            setTempMessages(prev => [...prev, userMsg]);
            try {
                const res = await apiFetch('/api/chat', {
                    method: 'POST',
                    body: buildForm({ model: selectedModel, temporary: true }),
                });
                const data = await res.json();
                setTempMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: data.response, timestamp: new Date() },
                ]);
            } catch (err) {
                console.error('temp chat error:', err);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        const threadId = activeThreadId || generateThreadId();
        if (!activeThreadId) setActiveThreadId(threadId);
        setMessages(prev => [...prev, userMsg]);

        try {
            const res = await apiFetch('/api/chat', {
                method: 'POST',
                body: buildForm({ threadId, model: selectedModel }),
            });
            const data = await res.json();
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: data.response, timestamp: new Date() },
            ]);
            setThreadRefresh(c => c + 1);
        } catch (err) {
            console.error('chat error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Loading / Auth gate 
    if (authLoading) {
        return (
            <div className="app-loading">
                <div className="app-spinner" />
            </div>
        );
    }

    if (!user) {
        return <Auth onAuth={setUser} />;
    }

    const displayMessages = isTemporary ? tempMessages : messages;

    return (
        <div className={`app${sidebarOpen ? '' : ' sidebar-hidden'}`}>
            {sidebarOpen && (
                <Sidebar
                    threads={threads}
                    activeThreadId={activeThreadId}
                    user={user}
                    onToggleSidebar={() => setSidebarOpen(false)}
                    onNewChat={handleNewChat}
                    onSelectThread={handleSelectThread}
                    onDeleteThread={handleDeleteThread}
                    onLogout={handleLogout}
                />
            )}
            <div className="main-content">
                <Navbar
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    isTemporary={isTemporary}
                    onToggleTemporary={handleToggleTemporary}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen(true)}
                />
                <ChatWindow
                    messages={displayMessages}
                    isLoading={isLoading}
                    isTemporary={isTemporary}
                    onSuggestion={handleSend}
                />
                <Chat onSend={handleSend} isLoading={isLoading} />
            </div>
        </div>
    );
}

export default App;
