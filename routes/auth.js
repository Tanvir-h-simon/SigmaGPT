import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const COOKIE_OPTS = { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 };

function userPayload(user) {
    return { id: user._id, name: user.name, email: user.email };
}

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email, and password are required' });
    }
    try {
        const user = await User.create({ name, email, password });
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, COOKIE_OPTS).status(201).json({ user: userPayload(user) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Email already in use' });
        }
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, COOKIE_OPTS).json({ user: userPayload(user) });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/logout', (_req, res) => {
    res.clearCookie('token').json({ message: 'Logged out successfully' });
});

router.get('/me', async (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.json({ user: null });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');
        res.json({ user: user ? userPayload(user) : null });
    } catch {
        res.json({ user: null });
    }
});

export default router;
