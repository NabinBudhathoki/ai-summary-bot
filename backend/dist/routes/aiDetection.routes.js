"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiDetection_controller_1 = require("../controllers/aiDetection.controller");
const router = (0, express_1.Router)();
router.post("/detect", aiDetection_controller_1.detectAIText);
router.post("/search-similar", aiDetection_controller_1.searchSimilar);
exports.default = router;
//# sourceMappingURL=aiDetection.routes.js.map