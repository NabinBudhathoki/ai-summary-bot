"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFileContent = parseFileContent;
exports.validateFileType = validateFileType;
exports.truncateContent = truncateContent;
const fs_1 = __importDefault(require("fs"));
const tesseract_js_1 = require("tesseract.js");
async function parseFileContent(file) {
    const filePath = file.path;
    const fileExtension = file.originalname
        .toLowerCase()
        .substring(file.originalname.lastIndexOf("."));
    try {
        switch (fileExtension) {
            case ".pdf":
                return await parsePDF(filePath, file.originalname);
            case ".png":
            case ".jpg":
            case ".jpeg":
                return await parseImage(filePath);
            case ".md":
            case ".txt":
                return fs_1.default.readFileSync(filePath, "utf-8");
            default:
                throw new Error("Unsupported file type");
        }
    }
    finally {
        try {
            fs_1.default.unlinkSync(filePath);
        }
        catch (error) {
            console.error("Error deleting file:", error);
        }
    }
}
async function parsePDF(filePath, originalname) {
    try {
        const PDFParser = (await Promise.resolve().then(() => __importStar(require("pdf2json")))).default;
        return new Promise((resolve, reject) => {
            const pdfParser = new PDFParser();
            pdfParser.on("pdfParser_dataError", (errData) => {
                console.error("PDF parsing error:", errData);
                resolve(`PDF file: ${originalname} - Text extraction failed. Please ensure the PDF contains readable text or try converting to text format first.`);
            });
            pdfParser.on("pdfParser_dataReady", (pdfData) => {
                try {
                    let text = "";
                    if (pdfData.Pages) {
                        for (const page of pdfData.Pages) {
                            if (page.Texts) {
                                for (const textElement of page.Texts) {
                                    if (textElement.R) {
                                        for (const textRun of textElement.R) {
                                            if (textRun.T) {
                                                const decodedText = decodeURIComponent(textRun.T);
                                                text += decodedText + " ";
                                            }
                                        }
                                    }
                                }
                            }
                            text += "\n";
                        }
                    }
                    if (text.trim().length === 0) {
                        resolve(`PDF file: ${originalname} - No readable text content found. The PDF might be image-based or protected.`);
                    }
                    else {
                        resolve(text.trim());
                    }
                }
                catch (error) {
                    console.error("Error processing PDF data:", error);
                    resolve(`PDF file: ${originalname} - Error processing content.`);
                }
            });
            pdfParser.loadPDF(filePath);
        });
    }
    catch (error) {
        console.error("PDF parsing error:", error);
        return `PDF file: ${originalname} - Failed to parse PDF content.`;
    }
}
async function parseImage(filePath) {
    try {
        const worker = await (0, tesseract_js_1.createWorker)();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        const { data: { text }, } = await worker.recognize(filePath);
        await worker.terminate();
        return text;
    }
    catch (error) {
        console.error("Image parsing error:", error);
        throw new Error("Failed to extract text from image");
    }
}
function validateFileType(file) {
    const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "text/markdown",
        "text/plain",
    ];
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".md", ".txt"];
    const fileExtension = file.originalname
        .toLowerCase()
        .substring(file.originalname.lastIndexOf("."));
    return (allowedTypes.includes(file.mimetype) ||
        allowedExtensions.includes(fileExtension));
}
function truncateContent(content, maxLength = 12000) {
    if (content.length > maxLength) {
        return (content.substring(0, maxLength) +
            "\n\n[Content truncated due to length...]");
    }
    return content;
}
//# sourceMappingURL=fileParser.js.map