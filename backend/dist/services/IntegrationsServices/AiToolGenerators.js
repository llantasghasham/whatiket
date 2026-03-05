"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCatalogToolNames = exports.buildGeminiToolDeclarationsFromCatalog = exports.buildOpenAiToolDeclarationsFromCatalog = void 0;
const generative_ai_1 = require("@google/generative-ai");
const AiToolCatalog_1 = require("./AiToolCatalog");
const buildOpenAiToolDeclarationsFromCatalog = () => {
    return AiToolCatalog_1.AI_TOOL_CATALOG.filter(tool => tool.providers.includes("openai")).map(tool => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.openaiParameters || {
                type: "object",
                properties: {},
                additionalProperties: true
            }
        }
    }));
};
exports.buildOpenAiToolDeclarationsFromCatalog = buildOpenAiToolDeclarationsFromCatalog;
const buildGeminiToolDeclarationsFromCatalog = () => {
    return AiToolCatalog_1.AI_TOOL_CATALOG.filter(tool => tool.providers.includes("gemini")).map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.geminiParameters || {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {},
            required: []
        }
    }));
};
exports.buildGeminiToolDeclarationsFromCatalog = buildGeminiToolDeclarationsFromCatalog;
const listCatalogToolNames = () => AiToolCatalog_1.AI_TOOL_CATALOG.map(tool => tool.name);
exports.listCatalogToolNames = listCatalogToolNames;
