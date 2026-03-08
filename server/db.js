const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'store.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ chats: [], users: {}, logs: [], plans: [] }));
}

const readDb = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { chats: [], users: {}, logs: [], plans: [] };
    }
};

const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Users / Progress
const getUser = (name) => {
    const db = readDb();
    if (!db.users) db.users = {};
    if (!db.users[name]) {
        db.users[name] = {
            name,
            completedLessons: [],
            lastStage: 'alphabet',
            dailyGoal: 'Welcome to NEMO! Let\'s start with ABCs.',
            streak: 0,
            lastActivity: new Date().toISOString()
        };
        writeDb(db);
    }
    return db.users[name];
};

const updateProgress = (name, data) => {
    const db = readDb();
    if (!db.users) db.users = {};
    db.users[name] = { ...getUser(name), ...data, lastActivity: new Date().toISOString() };
    writeDb(db);
    return db.users[name];
};

// Logs & Plans
const addLog = (user, lesson, status = 'completed') => {
    const db = readDb();
    if (!db.logs) db.logs = [];
    const logEntry = {
        id: Date.now(),
        user,
        lesson,
        status,
        date: new Date().toLocaleDateString('en-GB'), // Standard Earth Date
        timestamp: new Date().toISOString()
    };
    db.logs.push(logEntry);
    writeDb(db);
    return logEntry;
};

const savePlan = (user, date, goal) => {
    const db = readDb();
    if (!db.plans) db.plans = [];
    // Remove old plans for same date/user
    db.plans = db.plans.filter(p => !(p.user === user && p.date === date));
    const planEntry = {
        user,
        date,
        goal,
        timestamp: new Date().toISOString()
    };
    db.plans.push(planEntry);
    writeDb(db);
    return planEntry;
};

const getPlans = (user) => {
    const db = readDb();
    if (!db.plans) return [];
    return db.plans.filter(p => p.user === user).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const getLogs = (user) => {
    const db = readDb();
    if (!db.logs) return [];
    return db.logs.filter(l => l.user === user);
};

const addChat = (user, message, response) => {
    const db = readDb();
    if (!db.chats) db.chats = [];

    const chatEntry = {
        id: Date.now(),
        user,
        message,
        response,
        timestamp: new Date().toISOString()
    };

    db.chats.push(chatEntry);
    writeDb(db);
    return chatEntry;
};

const getHistory = (user) => {
    const db = readDb();
    if (!db.chats) return [];
    return db.chats.filter(c => c.user === user); // Full history as requested
};

module.exports = {
    addChat,
    getHistory,
    getUser,
    updateProgress,
    addLog,
    savePlan,
    getPlans,
    getLogs
};
