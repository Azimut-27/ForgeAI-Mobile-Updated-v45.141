const GEMINI_API_KEY = "AIzaSyD8aB2F_MhY_oLfdUrvdyGqYA7Gk9Iob8Q";
export function buildForgeCoachContext(context) {
  return context;
}
export async function generateGeminiResponse(context) {
  const prompt =
  typeof context === "string"
    ? context
    : JSON.stringify(context, null, 2);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No response generated."
  );
}
