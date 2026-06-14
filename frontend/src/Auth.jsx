import { useState } from 'react';
import './Auth.css';

/* Sigma logo SVG */
function SigmaLogo({ size = 40 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="#10a37f"/>
            <path d="M10 10H30L18 20L30 30H10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function Auth({ onAuth }) {
    const [mode, setMode]       = useState('signup');
    const [name, setName]       = useState('');
    const [email, setEmail]     = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
            const body = mode === 'signup'
                ? { name, email, password }
                : { email, password };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong');
            } else {
                onAuth(data.user);
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    const isSignup   = mode === 'signup';
    const canSubmit  = !loading && email && password && (isSignup ? name : true);

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-logo-wrap">
                    <SigmaLogo size={44} />
                    <span className="auth-brand">SigmaGPT</span>
                </div>

                <h1 className="auth-title">
                    {isSignup ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="auth-subtitle">
                    {isSignup ? 'Join SigmaGPT and start chatting' : 'Sign in to continue to SigmaGPT'}
                </p>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {error && (
                        <div className="auth-error">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    {isSignup && (
                        <div className="auth-field">
                            <label htmlFor="name">Full name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your name"
                                required
                                disabled={loading}
                                autoComplete="name"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                            autoComplete="email"
                            autoFocus={!isSignup}
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={isSignup ? 'At least 6 characters' : 'Enter your password'}
                            required
                            disabled={loading}
                            autoComplete={isSignup ? 'new-password' : 'current-password'}
                        />
                    </div>

                    <button type="submit" className="auth-submit" disabled={!canSubmit}>
                        {loading ? (
                            <span className="auth-spinner" />
                        ) : (
                            isSignup ? 'Create account' : 'Continue'
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span />
                    <p>{isSignup ? 'Already have an account?' : "Don't have an account?"}</p>
                    <span />
                </div>

                <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => switchMode(isSignup ? 'login' : 'signup')}
                >
                    {isSignup ? 'Log in' : 'Sign up'}
                </button>

            </div>
        </div>
    );
}

export default Auth;
export { SigmaLogo };
