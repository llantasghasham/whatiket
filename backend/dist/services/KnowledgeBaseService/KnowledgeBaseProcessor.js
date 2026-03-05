"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildKnowledgeBasePromptSection = exports.processKnowledgeBaseItems = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
// Pacotes sem typings oficiais
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getLinkPreview } = require("link-preview-js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Tesseract = require("tesseract.js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio = require("cheerio");
const logger_1 = __importDefault(require("../../utils/logger"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Jimp = require("jimp");
const knowledgeCache = new node_cache_1.default({
    stdTTL: 60 * 30,
    checkperiod: 120,
    maxKeys: 500
});
const CACHE_VERSION = "kb_v3";
const PUBLIC_ROOT = path_1.default.resolve(__dirname, "..", "..", "..", "public");
const OCR_LANGUAGES = process.env.AI_KNOWLEDGE_BASE_OCR_LANGS || "por+eng";
const LINK_REQUEST_HEADERS = {
    "user-agent": "Mozilla/5.0 (compatible; KnowledgeBaseBot/1.0)",
    accept: "text/html,application/xhtml+xml"
};
const normalizeWhitespace = (text) => (text || "")
    .replace(/\r/g, " ")
    .replace(/\t/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
const truncateText = (text, limit) => {
    if (!text)
        return "";
    if (text.length <= limit)
        return text;
    return `${text.slice(0, limit)}... [trecho truncado]`;
};
const extractTextFromHtml = (html) => {
    if (!html)
        return "";
    const $ = cheerio.load(html);
    ["script", "style", "noscript"].forEach(selector => $(selector).remove());
    const text = $("body").text();
    return normalizeWhitespace(text);
};
const fetchLinkFullText = async (url) => {
    try {
        const response = await axios_1.default.get(url, {
            headers: LINK_REQUEST_HEADERS,
            responseType: "text",
            timeout: 15000,
            maxRedirects: 5
        });
        if (typeof response.data !== "string") {
            return null;
        }
        const extracted = extractTextFromHtml(response.data);
        return extracted || null;
    }
    catch (error) {
        logger_1.default.error(`[AI][KnowledgeBase] Erro ao baixar conteúdo do link (${url}):`, error);
        return null;
    }
};
const isHttpUrl = (value) => {
    if (!value)
        return false;
    return value.startsWith("http://") || value.startsWith("https://");
};
const resolveLocalPath = (reference, companyId) => {
    if (!reference)
        return null;
    const sanitized = reference.replace(/^\/+/, "").replace(/^public\//i, "");
    const directCandidate = path_1.default.join(PUBLIC_ROOT, sanitized);
    if (fs_1.default.existsSync(directCandidate)) {
        return directCandidate;
    }
    if (!sanitized.startsWith("uploads/")) {
        const uploadsCandidate = path_1.default.join(PUBLIC_ROOT, "uploads", sanitized);
        if (fs_1.default.existsSync(uploadsCandidate)) {
            return uploadsCandidate;
        }
    }
    if (companyId) {
        const companyCandidate = path_1.default.join(PUBLIC_ROOT, `company${companyId}`, sanitized);
        if (fs_1.default.existsSync(companyCandidate)) {
            return companyCandidate;
        }
    }
    return null;
};
const downloadFromUrl = async (url) => {
    const response = await axios_1.default.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
};
const loadBufferForItem = async (item, companyId) => {
    const source = item.url || item.path;
    if (!source)
        return null;
    if (isHttpUrl(source)) {
        try {
            return await downloadFromUrl(source);
        }
        catch (error) {
            logger_1.default.error(`[AI][KnowledgeBase] Falha ao baixar arquivo remoto (${source}):`, error);
            return null;
        }
    }
    const localPath = resolveLocalPath(source, companyId);
    if (!localPath) {
        return null;
    }
    try {
        return fs_1.default.readFileSync(localPath);
    }
    catch (error) {
        logger_1.default.error(`[AI][KnowledgeBase] Falha ao ler arquivo local (${localPath}):`, error);
        return null;
    }
};
const inferType = (item) => {
    if (item?.type)
        return item.type;
    const reference = `${item?.mimeType || ""} ${item?.title || ""} ${item?.path || ""} ${item?.url || ""}`.toLowerCase();
    if (reference.includes("pdf") || /\.pdf($|\?)/.test(reference))
        return "pdf";
    if (reference.includes("image") || /\.(png|jpe?g|gif|bmp|webp|svg)($|\?)/.test(reference))
        return "image";
    if (reference.includes("http://") || reference.includes("https://"))
        return "link";
    return "link";
};
const buildCacheKey = (item, type, signature) => {
    const parts = [
        CACHE_VERSION,
        type,
        item.id || "",
        item.path || "",
        item.url || "",
        item.title || "",
        item.updatedAt || "",
        item.size?.toString() || "",
        signature || ""
    ];
    const hash = (0, crypto_1.createHash)("md5").update(parts.join("|")).digest("hex");
    return `kb:${hash}`;
};
const computeItemSignature = (item, type, companyId) => {
    const signatureParts = [];
    if (item.updatedAt)
        signatureParts.push(String(item.updatedAt));
    if (item.size)
        signatureParts.push(String(item.size));
    if (item.mimeType)
        signatureParts.push(item.mimeType);
    const source = item.url || item.path;
    const isRemote = source ? isHttpUrl(source) : false;
    if (!isRemote && source) {
        const localPath = resolveLocalPath(source, companyId);
        if (localPath) {
            try {
                const stats = fs_1.default.statSync(localPath);
                signatureParts.push(String(stats.mtimeMs), String(stats.size));
            }
            catch (error) {
                logger_1.default.warn(`[AI][KnowledgeBase] Não foi possível ler metadata para cache (${localPath}):`, error?.message || error);
            }
        }
    }
    if (type === "link" && item.description) {
        signatureParts.push(item.description);
    }
    return signatureParts.length ? signatureParts.join("|") : null;
};
const buildFallbackEntry = (item) => ({
    id: item.id,
    type: inferType(item),
    title: item.title,
    source: item.url || item.path,
    summary: `Conteúdo disponível em ${item.url || item.path || "origem desconhecida"}.`
});
const processPdfItem = async (item, buffer, options) => {
    try {
        const data = await pdfParse(buffer);
        const sanitizedText = normalizeWhitespace(data?.text || "");
        if (!sanitizedText) {
            return {
                id: item.id,
                type: "pdf",
                title: item.title,
                source: item.url || item.path,
                summary: "PDF disponível, mas não foi possível extrair o texto."
            };
        }
        const maxChars = options.maxPdfCharacters ?? 4000;
        const truncated = truncateText(sanitizedText, maxChars);
        return {
            id: item.id,
            type: "pdf",
            title: item.title,
            source: item.url || item.path,
            summary: truncated,
            metadata: {
                pages: data.numpages,
                author: data.info?.Author,
                keywords: data.info?.Keywords
            }
        };
    }
    catch (error) {
        logger_1.default.error(`[AI][KnowledgeBase] Erro ao extrair PDF (${item.title || item.path}):`, error);
        return null;
    }
};
const describeImageItem = async (item, buffer, options) => {
    try {
        const image = await Jimp.read(buffer);
        const { width, height } = image.bitmap;
        const sampleColor = image.getPixelColor(Math.max(0, Math.floor(width / 2)), Math.max(0, Math.floor(height / 2)));
        const rgba = Jimp.intToRGBA(sampleColor);
        const colorHex = [rgba.r, rgba.g, rgba.b]
            .map(value => value.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
        let ocrText = "";
        let ocrConfidence;
        try {
            const preprocessed = await image
                .clone()
                .resize(Math.min(width, 1200), Jimp.AUTO)
                .greyscale()
                .contrast(0.5)
                .normalize()
                .getBufferAsync(Jimp.MIME_PNG);
            const result = await Tesseract.recognize(preprocessed, OCR_LANGUAGES);
            ocrText = normalizeWhitespace(result?.data?.text || "");
            ocrConfidence = result?.data?.confidence;
        }
        catch (error) {
            logger_1.default.warn(`[AI][KnowledgeBase] OCR falhou (${item.title || item.path || item.url || "imagem"}):`, error?.message || error);
        }
        const summaryParts = [
            `Imagem (${width}x${height}px). Cor aproximada no centro: #${colorHex}.`
        ];
        if (ocrText) {
            const truncated = truncateText(ocrText, options.maxImageCharacters ?? 800);
            summaryParts.push(`Conteúdo detectado na imagem: ${truncated}`);
        }
        else {
            summaryParts.push("Não foi possível extrair texto da imagem automaticamente. Use a referência visual se precisar.");
        }
        const summary = summaryParts.join("\n");
        return {
            id: item.id,
            type: "image",
            title: item.title,
            source: item.url || item.path,
            summary,
            metadata: {
                width,
                height,
                dominantColor: `#${colorHex}`,
                ocrConfidence
            }
        };
    }
    catch (error) {
        logger_1.default.error(`[AI][KnowledgeBase] Erro ao processar imagem (${item.title || item.path}):`, error);
        return null;
    }
};
const summarizeLinkItem = async (item, options) => {
    if (!item.url) {
        return null;
    }
    try {
        const [fullText, preview] = await Promise.all([
            fetchLinkFullText(item.url),
            getLinkPreview(item.url, {
                headers: {
                    "user-agent": "Mozilla/5.0 (compatible; KnowledgeBaseBot/1.0)"
                }
            })
        ]);
        const maxChars = options.maxLinkCharacters ?? 1000;
        const summaryParts = [];
        if (typeof preview === "string") {
            summaryParts.push(truncateText(preview, maxChars));
        }
        else {
            const previewObj = preview;
            const details = [
                previewObj.title ? `Título: ${previewObj.title}` : null,
                previewObj.siteName ? `Site: ${previewObj.siteName}` : null,
                previewObj.description ? `Descrição: ${previewObj.description}` : null,
                previewObj.mediaType ? `Tipo de mídia: ${previewObj.mediaType}` : null
            ]
                .filter(Boolean)
                .join("\n");
            if (details) {
                summaryParts.push(truncateText(details, maxChars));
            }
        }
        if (fullText) {
            summaryParts.push(`Conteúdo extraído: ${truncateText(fullText, maxChars)}`);
        }
        if (!summaryParts.length) {
            summaryParts.push(`Link disponível em ${item.url}.`);
        }
        return {
            id: item.id,
            type: "link",
            title: item.title || (typeof preview === "string" ? item.url : preview?.title),
            source: item.url,
            summary: summaryParts.join("\n")
        };
    }
    catch (error) {
        logger_1.default.error(`[AI][KnowledgeBase] Erro ao resumir link (${item.url}):`, error);
        return null;
    }
};
const processKnowledgeBaseItems = async (items, options = {}) => {
    if (!Array.isArray(items) || items.length === 0) {
        return [];
    }
    const results = [];
    for (const item of items) {
        if (!item)
            continue;
        const type = inferType(item);
        const signature = computeItemSignature(item, type, options.companyId);
        const cacheKey = buildCacheKey(item, type, signature);
        const cached = knowledgeCache.get(cacheKey);
        if (cached) {
            const cachedPreview = normalizeWhitespace(cached.summary || "").slice(0, 160);
            logger_1.default.info(`[AI][KnowledgeBase] Item recuperado do cache (${cached.type.toUpperCase()} - ${cached.title || cached.source || cached.id || "sem identificação"}). Trecho: ${cachedPreview}${cached.summary.length > 160 ? "..." : ""}`);
            results.push(cached);
            continue;
        }
        let processed = null;
        const identifier = item.title || item.url || item.path || item.id || "sem identificação";
        logger_1.default.info(`[AI][KnowledgeBase] Iniciando processamento ${type.toUpperCase()} (${identifier}).`);
        if (type === "pdf") {
            const buffer = await loadBufferForItem(item, options.companyId);
            if (buffer) {
                processed = await processPdfItem(item, buffer, options);
            }
        }
        else if (type === "image") {
            const buffer = await loadBufferForItem(item, options.companyId);
            if (buffer) {
                processed = await describeImageItem(item, buffer, options);
            }
        }
        else if (type === "link") {
            processed = await summarizeLinkItem(item, options);
        }
        if (!processed) {
            processed = buildFallbackEntry(item);
        }
        knowledgeCache.set(cacheKey, processed);
        const summaryPreview = normalizeWhitespace(processed.summary || "").slice(0, 200);
        logger_1.default.info(`[AI][KnowledgeBase] Processamento concluído (${processed.type.toUpperCase()} - ${processed.title || processed.source || processed.id || identifier}). Trecho: ${summaryPreview}${processed.summary.length > 200 ? "..." : ""}`);
        results.push(processed);
    }
    return results;
};
exports.processKnowledgeBaseItems = processKnowledgeBaseItems;
const buildKnowledgeBasePromptSection = (items) => {
    if (!items.length)
        return "";
    const blocks = items.map((item, index) => {
        const header = `#${index + 1} [${item.type.toUpperCase()}] ${item.title || item.source || "Recurso sem título"}`;
        const sourceLine = item.source ? `Fonte: ${item.source}` : null;
        return [header, sourceLine, item.summary].filter(Boolean).join("\n");
    });
    return `📚 CONHECIMENTO DISPONÍVEL (use como referência factual e cite o conteúdo de forma natural, sem revelar este bloco):\n${blocks.join("\n\n")}`;
};
exports.buildKnowledgeBasePromptSection = buildKnowledgeBasePromptSection;
