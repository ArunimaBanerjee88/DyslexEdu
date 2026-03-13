const fetch = require('node-fetch');

/**
 * Communicates with the local TinyLLM Python API.
 * @param {string} text - User's question.
 * @returns {Promise<{answer: string, emotion: string}>}
 */
async function getTinyLLMResponse(text) {
    try {
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: text }),
            timeout: 10000 // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`TinyLLM API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            answer: data.answer || "I'm having a bit of trouble thinking right now. Could you ask me again?",
            emotion: data.emotion || "neutral"
        };
    } catch (error) {
        console.error("TinyLLM Service Error:", error.message);
        return {
            answer: "I'm sorry, my magic brain is sleeping. Please check if TinyLLM is running! 🙏",
            emotion: "sad"
        };
    }
}

module.exports = {
    getTinyLLMResponse
};
