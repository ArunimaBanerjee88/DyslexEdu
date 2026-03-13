require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { getTinyLLMResponse } = require('./llm_service');
const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('NEMO Agentic AI API is running');
});

// User Status Endpoint
app.get('/api/user-status', (req, res) => {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: 'User is required' });
    const profile = db.getUser(user);
    const plans = db.getPlans(user);
    res.json({ ...profile, plans });
});

// Generate Daily Plan Endpoint
app.post('/api/generate-plan', async (req, res) => {
    const { user, age } = req.body;
    const profile = db.getUser(user);
    const logs = db.getLogs(user);

    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toLocaleDateString('en-GB');

        const prompt = `Give one simple lesson for tomorrow (${dateStr}) for student ${user} (Age: ${age}). Under 10 words.`;

        let planText = "Keep learning and practicing! ✨";

        // Use TinyLLM for plan generation if possible
        const response = await getTinyLLMResponse(prompt);
        if (response && response.answer) {
            planText = response.answer;
        }

        db.savePlan(user, dateStr, planText);
        db.updateProgress(user, { dailyGoal: planText });

        res.json({ goal: planText, date: dateStr });
    } catch (e) {
        console.error("Plan Generation Error:", e);
        res.json({ goal: "Keep learning!", date: 'Tomorrow' });
    }
});

// Log Lesson Completion
app.post('/api/log-lesson', (req, res) => {
    const { user, lesson } = req.body;
    const log = db.addLog(user, lesson);
    res.json(log);
});

// Get History
app.get('/api/history', (req, res) => {
    const { user } = req.query;
    const history = db.getHistory(user || 'student');
    res.json(history);
});

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { text, age, user } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    console.log(`Processing chat for ${user} (Age: ${age})...`);

    // Route to TinyLLM for all age groups (Age 8+ required, but TinyLLM is now the primary)
    try {
        const result = await getTinyLLMResponse(text);
        
        db.addChat(user || 'student', text, result.answer);
        return res.json({ message: result.answer, emotion: result.emotion });
    } catch (error) {
        console.error("Chat Error:", error.message);
        res.json({ message: "Hello beta! I am having trouble connecting to my magic brain. Please check if TinyLLM is running! 🙏" });
    }
});

app.listen(port, () => {
    console.log(`NEMO API running at http://localhost:${port}`);
});
