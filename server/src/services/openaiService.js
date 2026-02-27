import groq from "./groqService.js";

export const generateAIQuestions = async (role, round) => {
    const prompt = `Generate 5 ${round} interview questions for ${role}`;

    const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
    });

    const text = completion.choices[0].message.content;

    return text.split("\n").filter(q => q.trim());
};

export const evaluateAIAnswer = async (question, answer) => {
    const prompt = `
Question: ${question}
Answer: ${answer}

Give short constructive feedback and improvement tips.
`;

    const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content;
};

export const extractResumeInsights = async (resumeText, role) => {
    const prompt = `
    You are an expert technical recruiter and hiring manager. 
    Analyze the following resume for the role of "${role}".
    
    Resume Content:
    ${resumeText}
    
    Provide the output in the following JSON format ONLY (no markdown, no extra text):
    {
        "matchScore": <number between 0-100>,
        "missingKeywords": [<array of strings>],
        "opinion": "<short professional opinion on the candidate's suitability>",
        "suggestions": [<array of strings for improvement>]
    }
    `;

    const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            { role: "system", content: "You are an expert resume evaluator. Always respond with valid JSON." },
            { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
    });

    try {
        return JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        console.error("Raw AI Response:", completion.choices[0].message.content);
        throw new Error("AI returned invalid JSON format");
    }
};
