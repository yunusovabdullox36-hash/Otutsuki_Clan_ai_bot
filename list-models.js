require('dotenv').config();
const axios = require('axios');

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const response = await axios.get(url);
        console.log("Available Models:", response.data.models.map(m => m.name));
    } catch (e) {
        console.error("List Models Failed:", e.response ? e.response.data : e.message);
    }
}

listModels();
