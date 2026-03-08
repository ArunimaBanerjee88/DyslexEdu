const fetch = require('node-fetch'); // We might need to install this or use global fetch if node 18+
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const testApi = async () => {
    console.log("Testing Gemini API directly via fetch...");
    console.log("URL:", url.replace(apiKey, "REDACTED"));

    const body = {
        contents: [{
            parts: [{ text: "Hello, are you there?" }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (response.ok) {
            console.log("Success!");
            console.log("Response:", data.candidates[0].content.parts[0].text);
        } else {
            console.log("Error:", response.status, response.statusText);
            console.log("Details:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
};

testApi();
