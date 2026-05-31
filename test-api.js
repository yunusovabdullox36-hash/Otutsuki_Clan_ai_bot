require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    try {
        console.log("Testing Gemini API with Key:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Salom, kimsan?");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

test();
