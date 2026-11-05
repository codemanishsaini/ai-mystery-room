import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

export const DIFFICULTY_CONFIG = {
  easy: { suspects: 3, clues: 5, hints: 2, points: 100 },
  medium: { suspects: 4, clues: 7, hints: 3, points: 150 },
  hard: { suspects: 5, clues: 9, hints: 3, points: 200 },
};

export const MysterySchema = z.object({
  title: z.string(),
  story: z.string(),
  suspects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
    }),
  ),
  clues: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
  hints: z.array(z.string()),
  culpritId: z.string(),
  solution: z.string(),
});

export async function generateMystery(premise, difficulty) {
  try {
    const config = DIFFICULTY_CONFIG[difficulty];
    if (!config) {
      throw new Error("Invalid difficulty");
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const prompt = `Create a unique detective mystery from this premise: ${premise}

Return STRICT JSON only, with exactly this shape:
{"title":"","story":"","suspects":[{"id":"s1","name":"","description":""}],"clues":[{"id":"c1","text":""}],"hints":[""],"culpritId":"","solution":""}

Requirements:
- Include exactly ${config.suspects} suspects with sequential IDs s1, s2, and so on.
- Include exactly ${config.clues} clues with sequential IDs c1, c2, and so on.
- Include exactly ${config.hints} hints.
- culpritId must match one of the suspect IDs.
- The solution must explain the culprit and reference at least two clues.
- Write the story in a noir tone.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error("Gemini response could not be parsed as JSON:", err);
      throw new Error("Gemini returned an invalid response");
    }

    if (!response.ok) {
      console.error("Gemini API error response:", data);
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof generatedText !== "string" || !generatedText.trim()) {
      console.error("Gemini response did not contain generated text:", data);
      throw new Error("Gemini returned an empty response");
    }

    let parsed;
    try {
      parsed = JSON.parse(generatedText);
    } catch {
      throw new Error("Gemini returned invalid JSON");
    }

    const result = MysterySchema.safeParse(parsed);
    if (!result.success) {
      throw new Error("Gemini response does not match the expected schema");
    }

    const mystery = result.data;
    if (
      mystery.suspects.length !== config.suspects ||
      mystery.clues.length !== config.clues ||
      mystery.hints.length !== config.hints
    ) {
      throw new Error("Gemini response does not match difficulty requirements");
    }

    if (!mystery.suspects.some((suspect) => suspect.id === mystery.culpritId)) {
      throw new Error("Gemini response has an invalid culpritId");
    }

    return mystery;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
