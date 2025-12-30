import { Router } from "express";
import {
  generateTextSummary,
  generateUrlSummary,
} from "../controllers/summary.langchain.controller";
import { RateLimiter } from "../utils/rateLimiter";

const router = Router();

// POST /api/v1/summary/text - Generate summary from text using LangChain
router.post("/text", generateTextSummary);

// POST /api/v1/summary/url - Generate summary from URL using LangChain (with rate limiting)
router.post("/url", RateLimiter.middleware(), generateUrlSummary);

export default router;
