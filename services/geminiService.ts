import { GoogleGenAI } from "@google/genai";
import { UserStats, Habit } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiMotivation = async (stats: UserStats, habits: Habit[]): Promise<string> => {
  try {
    const completedCount = habits.filter(h => h.completed).length;
    const totalCount = habits.length;
    
    const prompt = `
      The user is using a gamified habit tracker.
      Current Stats:
      - Streak: ${stats.totalStreak} days
      - Level: ${stats.level}
      - Today's Progress: ${completedCount}/${totalCount} habits done.
      
      Provide a short, punchy, and witty one-sentence motivation or congratulation.
      If the streak is high (>3), be super excited.
      If they just started, be encouraging.
      Keep it under 20 words.
      Do not use quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Keep going, you're doing great!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Consistently is the key to victory!";
  }
};

export const suggestHabit = async (currentHabits: Habit[]): Promise<{ title: string; color: string; icon: string }> => {
  try {
    const habitTitles = currentHabits.map(h => h.title).join(", ");
    const prompt = `
      Suggest ONE fun, healthy, small habit for a user.
      Current habits: ${habitTitles}.
      Return JSON with fields: "title" (short name), "color" (hex code, vibrant), "icon" (a classic emoji).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Suggest Error:", error);
    return { title: "Drink Water", color: "#3B82F6", icon: "💧" };
  }
}
