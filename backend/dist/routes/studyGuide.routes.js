"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studyGuide_controller_1 = require("../controllers/studyGuide.controller");
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
router.post("/generate", upload_1.uploadMiddleware, studyGuide_controller_1.generateStudyGuide);
exports.default = router;
//# sourceMappingURL=studyGuide.routes.js.map