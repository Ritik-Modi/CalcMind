import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function explainCalculation(payload: {
  expression: string;
  result: number;
  steps: string[];
}): Promise<{ explanation: string; source: string }> {
  const fallback = buildFallbackExplanation(payload);
  if (!process.env.OPENAI_API_KEY) {
    return { explanation: fallback, source: "fallback" };
  }

  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = [
      "You are a concise math tutor.",
      "Explain the calculation in clear beginner-friendly language.",
      "Use short bullet points and keep under 120 words.",
      `Expression: ${payload.expression}`,
      `Result: ${payload.result}`,
      `Steps: ${payload.steps.join(" | ") || "N/A"}`,
    ].join("\n");

    const response = await generateText({
      model: openai(model),
      prompt,
      temperature: 0.2,
    });

    return {
      explanation: response.text?.trim() || fallback,
      source: "ai-sdk",
    };
  } catch {
    return { explanation: fallback, source: "fallback-on-error" };
  }
}

function buildFallbackExplanation(payload: {
  expression: string;
  result: number;
  steps: string[];
}): string {
  const stepText = payload.steps.length
    ? payload.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")
    : "No intermediate steps available.";

  return [
    `Expression: ${payload.expression}`,
    `Result: ${payload.result}`,
    "Computation steps:",
    stepText,
    "Tip: Add parentheses when mixing +, -, *, / to make intent explicit.",
  ].join("\n\n");
}
