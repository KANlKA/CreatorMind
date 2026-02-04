import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateContent(prompt: string): Promise<string> {
  try {
    // Changed from "gemini-2.0-flash-exp" to a valid model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export async function generateJSON(prompt: string): Promise<any> {
  try {
    const fullPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON. No markdown, no backticks, no preamble.`;

    const text = await generateContent(fullPrompt);

    // Clean up response (remove markdown code blocks if present)
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/g, "");
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error generating JSON:", error);
    throw error;
  }
}