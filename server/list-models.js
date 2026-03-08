const fetch = require('node-fetch');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

const listModels = async () => {
    console.log("Listing available models...");
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            console.log("Found models:");
            data.models.forEach(m => console.log(` - ${m.name}`));
        } else {
            console.log("Error listing models:", response.status, response.statusText);
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
};

listModels();
