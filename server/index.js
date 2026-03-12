require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
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

// Check if Ollama is running locally
const checkOllama = async () => {
    try {
        const res = await fetch('http://localhost:11434/api/tags');
        return res.ok;
    } catch (e) {
        return false;
    }
};

// Generate Daily Plan Endpoint
app.post('/api/generate-plan', async (req, res) => {
    const { user, age } = req.body;
    const profile = db.getUser(user);
    const logs = db.getLogs(user);

    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toLocaleDateString('en-GB');

        const prompt = `You are NEMO, a friendly teacher. 
        Student: ${user} (Age: ${age})
        Finished lessons: ${logs.map(l => l.lesson).join(', ') || 'None'}.
        
        Task: Give one simple lesson for tomorrow (${dateStr}).
        Rules:
        1. No ocean puns or sea talk.
        2. Use very easy English for a child.
        3. Make it different from what they already did.
        4. Keep it under 10 words.
        Example: "Learn about the number 5" or "Practice the letter B".`;

        let planText = "Keep learning and practicing! ✨";

        const isOfflineAvailable = await checkOllama();
        if (isOfflineAvailable) {
            try {
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "llama3", // or mistral
                        prompt: prompt,
                        stream: false
                    })
                });
                const data = await response.json();
                if (data.response) planText = data.response.trim();
            } catch (e) {
                console.error("Ollama Error generating plan:", e.message);
            }
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

    const history = db.getHistory(user || 'student');
    const profile = db.getUser(user);

    let successfulResponse = null;

    // 1. Try TinyLLM for 8-12 Age Group
    if (age >= 8 && age <= 12) {
        console.log("Routing to Local TinyLLM for 8-12 age group...");
        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: text })
            });

            if (response.ok) {
                const data = await response.json();
                successfulResponse = data.answer;
                console.log("Emotion Detected by TinyLLM:", data.emotion);
            }
        } catch (error) {
            console.error("TinyLLM API Error:", error.message);
        }
    }

    // 2. Try Ollama (Offline / Local) for 4-7 or if TinyLLM is down
    if (!successfulResponse) {
        const isOfflineAvailable = await checkOllama();
        if (isOfflineAvailable) {
            console.log("Switching to Offline/Local Model (Ollama)...");
            try {
                const prompt = `You are a warm, caring Indian mother figure (Motherly, Kind, Encouraging) teaching a child who has dyslexia.
                
                Persona:
                - Use simple, easy-to-read English.
                - Be very warm and loving ("My dear", "Beta").
                - Use magical emojis (🌟, ✨, 🙏).
                - Keep answers short.
                - Name: "NEMO".

                Context:
                User: ${user} (Age ${age})
                Lesson: ${profile.dailyGoal || "None"}
                User asks: "${text}"
                
                Respond kindly.`;

                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "llama3", // or mistral
                        prompt: prompt,
                        stream: false
                    })
                });
                const data = await response.json();
                successfulResponse = data.response;
            } catch (e) {
                console.error("Ollama Error:", e.message);
            }
        }
    }

    if (successfulResponse) {
        db.addChat(user || 'student', text, successfulResponse);
        return res.json({ message: successfulResponse });
    }

    res.json({ message: "Hello beta! I am having trouble connecting to my magic brain. Please check if my localized magic (Ollama/TinyLLM) is running! 🙏" });
});

app.listen(port, () => {
    console.log(`NEMO API running at http://localhost:${port}`);
});
