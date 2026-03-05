"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PromptToolSetting_1 = __importDefault(require("../../models/PromptToolSetting"));
const ListPromptToolSettingsService = async ({ companyId, promptId }) => {
    const normalizedPromptId = typeof promptId === "number" && !Number.isNaN(promptId) ? promptId : null;
    const toolNames = await PromptToolSetting_1.default.findAll({
        where: {
            companyId,
            promptId: normalizedPromptId,
            enabled: true
        },
        order: [["toolName", "ASC"]]
    });
    if (toolNames.length > 0) {
        return toolNames.map(tool => tool.toolName);
    }
    if (normalizedPromptId !== null) {
        const fallbackTools = await PromptToolSetting_1.default.findAll({
            where: {
                companyId,
                promptId: null,
                enabled: true
            },
            order: [["toolName", "ASC"]]
        });
        if (fallbackTools.length > 0) {
            return fallbackTools.map(tool => tool.toolName);
        }
    }
    return null;
};
exports.default = ListPromptToolSettingsService;
