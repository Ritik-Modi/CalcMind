import { Request, Response } from "express";
import { calculateExpression } from "../services/calculator.service.js";
import { explainCalculation } from "../services/ai.service.js";
import { CalculationModel } from "../models/calculation.model.js";
import { isDbEnabled } from "../config/db.js";

const inMemoryHistory: Array<{
  userId: string;
  expression: string;
  result: number;
  steps: string[];
  createdAt: string;
}> = [];

export async function calculate(req: Request, res: Response): Promise<void> {
  const userId = (req as any).auth?.payload?.sub as string;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized: missing user ID" });
    return;
  }

  const expression = String(req.body?.expression || "").trim();
  if (!expression) {
    res.status(400).json({ error: "expression is required" });
    return;
  }

  try {
    const { result, steps } = calculateExpression(expression);
    const rounded = Number.isInteger(result) ? result : Number(result.toFixed(8));
    const payload = {
      userId,
      expression,
      result: rounded,
      steps,
      createdAt: new Date().toISOString(),
    };

    if (isDbEnabled()) {
      await CalculationModel.create({ userId, expression, result: rounded, steps });
    } else {
      inMemoryHistory.unshift(payload);
      if (inMemoryHistory.length > 50) inMemoryHistory.pop();
    }

    res.json(payload);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "calculation failed" });
  }
}

export async function explain(req: Request, res: Response): Promise<void> {
  const expression = String(req.body?.expression || "").trim();
  const result = req.body?.result;
  const steps = Array.isArray(req.body?.steps) ? req.body.steps : [];

  if (!expression || result === undefined) {
    res.status(400).json({ error: "expression and result are required" });
    return;
  }

  const explanation = await explainCalculation({ expression, result: Number(result), steps });
  res.json(explanation);
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  const userId = (req as any).auth?.payload?.sub as string;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized: missing user ID" });
    return;
  }

  if (isDbEnabled()) {
    const rows = await CalculationModel.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();
    res.json(rows);
    return;
  }

  res.json(inMemoryHistory.filter(h => h.userId === userId).slice(0, 20));
}
