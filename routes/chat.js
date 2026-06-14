import express from 'express';
import multer from 'multer';
import Thread from '../models/Thread.js';
import getAIResponse from '../utils/openai.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/chat', upload.single('file'), async (req, res) => {
    const { threadId, message, model, temporary } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ error: 'message is required' });
    }

    if (temporary === 'true') {
        try {
            const aiResponse = await getAIResponse(
                [{ role: 'user', content: message.trim() }],
                model
            );
            return res.json({ response: aiResponse });
        } catch (error) {
            console.error('Temporary chat error:', error);
            return res.status(500).json({ error: 'Failed to process chat' });
        }
    }

    if (!threadId) {
        return res.status(400).json({ error: 'threadId is required' });
    }

    try {
        let thread = await Thread.findOne({ threadId });
        if (!thread) {
            thread = new Thread({
                threadId,
                title: `Thread ${threadId}`,
                messages: [{ role: 'user', content: message.trim() }],
            });
        } else {
            thread.messages.push({ role: 'user', content: message.trim() });
        }

        const aiResponse = await getAIResponse(thread.messages, model);
        thread.messages.push({ role: 'assistant', content: aiResponse });
        thread.updatedAt = new Date();
        await thread.save();
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat' });
    }
});

router.get('/threads', async (req, res) => {
    try {
        const threads = await Thread.find().sort({ updatedAt: -1 });
        res.json(threads);
    } catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).json({ error: 'Failed to fetch threads' });
    }
});

router.get('/threads/:threadId', async (req, res) => {
    try {
        const thread = await Thread.findOne({ threadId: req.params.threadId });
        if (!thread) return res.status(404).json({ error: 'Thread not found' });
        res.json(thread);
    } catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ error: 'Failed to fetch thread' });
    }
});

router.delete('/threads/:threadId', async (req, res) => {
    try {
        const thread = await Thread.findOneAndDelete({ threadId: req.params.threadId });
        if (!thread) return res.status(404).json({ error: 'Thread not found' });
        res.json({ message: 'Thread deleted successfully' });
    } catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ error: 'Failed to delete thread' });
    }
});

export default router;
