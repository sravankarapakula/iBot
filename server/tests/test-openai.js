import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
    console.log("Testing OpenAI API...");
    try {
        const prompt = `
    Generate 1 interview question for a Frontend Engineer.
    Return ONLY JSON:
    {
      "questions": ["Question 1"]
    }
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        console.log("Raw Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("❌ OpenAI Error:", error);
    }
}

testOpenAI();
