export function buildForgeCoachContext(context) {
  return context;
}

export async function generateGeminiResponse(context) {
  try {
    const response = await fetch("/api/ai-coach", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(context),
    });

    // Better error handling
    if (!response.ok) {
      throw new Error("AI request failed");
    }

    const data = await response.json();

    return (
      data?.answer ||
      "ForgeAI Coach could not generate a response."
    );
  } catch (error) {
    console.error("ForgeAI AI Error:", error);

    return "ForgeAI Coach is temporarily unavailable.";
  }
}
