import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

async function testGroq() {
    console.log("Testing Groq API...");
    try {
        const prompt = `
    Generate 1 interview question for a Frontend Engineer.
    Return ONLY JSON:
    {
      "questions": ["Question 1"]
    }
    `;

        const completion = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        console.log("Raw Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("❌ Groq Error:", error);
    }
}

testGroq();
