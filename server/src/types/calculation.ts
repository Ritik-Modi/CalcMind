export type CalculationRequest = {
  expression: string;
};

export type CalculationResponse = {
  expression: string;
  result: number;
  steps: string[];
  createdAt: string;
};
