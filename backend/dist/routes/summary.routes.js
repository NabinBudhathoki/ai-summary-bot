"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const summary_controller_1 = require("../controllers/summary.controller");
const rateLimiter_1 = require("../utils/rateLimiter");
const router = (0, express_1.Router)();
router.post("/text", summary_controller_1.generateTextSummary);
router.post("/url", rateLimiter_1.RateLimiter.middleware(), summary_controller_1.generateUrlSummary);
exports.default = router;
//# sourceMappingURL=summary.routes.js.map