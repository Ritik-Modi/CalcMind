import { Router } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { calculate, explain, getHistory } from "../controllers/calculator.controller.js";

const router = Router();

import { Request, Response, NextFunction } from "express";

// Validate JWTs using Auth0, initialized only when actually called 
// (which guarantees `dotenv` has finished running).
const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const jwtValidator = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  });
  return jwtValidator(req, res, next);
};

router.post("/calculate", checkJwt, calculate);
router.post("/ai/explain", checkJwt, explain);
router.get("/history", checkJwt, getHistory);

export default router;
