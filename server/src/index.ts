import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import calculatorRoutes from "./routes/calculator.routes.js";
import { connectDb, isDbEnabled } from "./config/db.js";

const app = express();
const port = Number(process.env.PORT || 4001);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, dbEnabled: isDbEnabled(), aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.use("/api/v1", calculatorRoutes);

connectDb().finally(() => {
  app.listen(port, () => {
    console.log(`CalcMind API running at http://localhost:${port}`);
  });
});
