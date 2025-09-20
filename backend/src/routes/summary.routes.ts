import { Router } from "express";
import {
  generateTextSummary,
  generateUrlSummary,
} from "../controllers/summary.controller";
import { RateLimiter } from "../utils/rateLimiter";

const router = Router();

// POST /api/v1/summary/text - Generate summary from text
router.post("/text", generateTextSummary);

// POST /api/v1/summary/url - Generate summary from URL (with rate limiting)
router.post("/url", RateLimiter.middleware(), generateUrlSummary);

export default router;
