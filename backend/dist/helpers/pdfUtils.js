"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPdfBufferFromUrl = exports.validateAndFixPdfBuffer = exports.decodeBase64IfPdf = void 0;
const axios_1 = __importDefault(require("axios"));
const looksLikePdfBuffer = (buffer) => {
    if (!buffer || buffer.length < 4)
        return false;
    return buffer.slice(0, 4).toString("utf-8") === "%PDF";
};
const decodeBase64IfPdf = (buffer) => {
    if (!buffer || buffer.length === 0)
        return buffer;
    if (looksLikePdfBuffer(buffer)) {
        return buffer;
    }
    const asString = buffer.toString("utf-8").trim();
    if (!asString)
        return buffer;
    const base64Candidate = asString.replace(/\s+/g, "");
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(base64Candidate)) {
        return buffer;
    }
    try {
        const decoded = Buffer.from(base64Candidate, "base64");
        if (looksLikePdfBuffer(decoded)) {
            return decoded;
        }
    }
    catch (err) {
        console.error("[pdfUtils] Falha ao decodificar base64 para PDF:", err);
    }
    return buffer;
};
exports.decodeBase64IfPdf = decodeBase64IfPdf;
const validateAndFixPdfBuffer = (buffer) => {
    if (!buffer || buffer.length === 0) {
        throw new Error("Buffer do PDF está vazio");
    }
    // Verificar se é um PDF válido
    if (!looksLikePdfBuffer(buffer)) {
        console.error("[pdfUtils] Buffer não parece ser um PDF válido");
        throw new Error("Arquivo não é um PDF válido");
    }
    // Verificar tamanho mínimo (PDFs muito pequenos podem estar corrompidos)
    if (buffer.length < 100) {
        console.error("[pdfUtils] PDF muito pequeno, possivelmente corrompido");
        throw new Error("PDF muito pequeno ou corrompido");
    }
    console.log(`[pdfUtils] PDF validado com sucesso: ${buffer.length} bytes`);
    return buffer;
};
exports.validateAndFixPdfBuffer = validateAndFixPdfBuffer;
const fetchPdfBufferFromUrl = async (url) => {
    try {
        console.log(`[pdfUtils] Baixando PDF de: ${url}`);
        const response = await axios_1.default.get(url, {
            responseType: "arraybuffer",
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/pdf,*/*'
            }
        });
        const rawBuffer = Buffer.from(response.data);
        console.log(`[pdfUtils] Buffer baixado: ${rawBuffer.length} bytes`);
        const normalizedBuffer = (0, exports.decodeBase64IfPdf)(rawBuffer);
        const validatedBuffer = (0, exports.validateAndFixPdfBuffer)(normalizedBuffer);
        const contentType = response.headers?.["content-type"];
        const finalContentType = typeof contentType === "string" && contentType.includes("pdf")
            ? contentType
            : "application/pdf";
        console.log(`[pdfUtils] ContentType final: ${finalContentType}`);
        return {
            buffer: validatedBuffer,
            contentType: finalContentType
        };
    }
    catch (error) {
        console.error(`[pdfUtils] Erro ao baixar PDF:`, error.message);
        throw new Error(`Falha ao baixar PDF: ${error.message}`);
    }
};
exports.fetchPdfBufferFromUrl = fetchPdfBufferFromUrl;
