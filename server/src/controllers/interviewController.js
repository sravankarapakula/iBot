import { generateAIQuestions, evaluateAIAnswer } from "../services/openaiService.js";

// Generate Interview
export const generateInterview = async (req, res) => {
  try {
    const { role, round } = req.body;

    if (!role || !round) {
      return res.status(400).json({ error: "Role and round required" });
    }

    const questions = await generateAIQuestions(role, round);

    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate interview" });
  }
};

// Evaluate Answer
export const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const feedback = await evaluateAIAnswer(question, answer);

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({ error: "Evaluation failed" });
  }
};
