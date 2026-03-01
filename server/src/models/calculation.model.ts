import mongoose from "mongoose";

const CalculationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    expression: { type: String, required: true },
    result: { type: Number, required: true },
    steps: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const CalculationModel = mongoose.model("Calculation", CalculationSchema);
