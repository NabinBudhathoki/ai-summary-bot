"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const config_1 = require("../config");
const fileParser_1 = require("./fileParser");
exports.upload = (0, multer_1.default)({
    dest: config_1.config.upload.uploadDir,
    limits: {
        fileSize: config_1.config.upload.maxFileSize,
    },
    fileFilter: (req, file, cb) => {
        if ((0, fileParser_1.validateFileType)(file)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Only PDF, PNG, JPEG, and text files are allowed."));
        }
    },
});
exports.uploadMiddleware = exports.upload.single("file");
//# sourceMappingURL=upload.js.map