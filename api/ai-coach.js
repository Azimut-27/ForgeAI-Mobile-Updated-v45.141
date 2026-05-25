import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // Read environment variables from Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName =
      process.env.GEMINI_MODEL || "gemini-2.0-flash";

    // Safety check
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY",
      });
    }

    // Request body from frontend
    const {
      prompt,
      settings,
      generatedWorkout,
      workoutLogs,
      userProgress,
    } = req.body;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: modelName,
    });

    // Build ForgeAI system prompt
    const systemPrompt = `
You are ForgeAI Coach, an elite evidence-informed strength, hypertrophy, conditioning, recovery, and performance coach.

You help users:
- improve workouts
- structure progression
- manage fatigue
- optimize recovery
- improve performance

Your responses should:
- be concise
- practical
- premium feeling
- performance-oriented
- easy to understand
- avoid medical advice

User Context:
Goal: ${settings?.goal || "Unknown"}
Level: ${settings?.experience || "Unknown"}
Focus: ${settings?.focus || "Unknown"}

Workout Summary:
${generatedWorkout || "No workout generated"}

Recent Logs:
${JSON.stringify(workoutLogs || []).slice(0, 1000)}

User XP:
${userProgress?.xp || 0}

User Prompt:
${prompt}
`;

    // Generate response
    const result = await model.generateContent(systemPrompt);

    const response = await result.response;

    const text = response.text();

    return res.status(200).json({
      answer: text,
      mode: "live",
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      answer:
        "ForgeAI Coach is temporarily unavailable. Please try again shortly.",
      mode: "fallback",
    });
  }
}
