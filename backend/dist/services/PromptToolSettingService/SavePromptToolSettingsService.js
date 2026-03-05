"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PromptToolSetting_1 = __importDefault(require("../../models/PromptToolSetting"));
const SavePromptToolSettingsService = async ({ companyId, promptId, toolsEnabled }) => {
    console.log("[SavePromptToolSettingsService] Received:", { companyId, promptId, toolsEnabled });
    if (typeof toolsEnabled === "undefined") {
        console.log("[SavePromptToolSettingsService] toolsEnabled is undefined, skipping");
        return;
    }
    const normalizedPromptId = promptId ?? null;
    const uniqueTools = Array.from(new Set(toolsEnabled || [])).filter(tool => typeof tool === "string" && tool.trim().length > 0);
    await PromptToolSetting_1.default.destroy({
        where: {
            companyId,
            promptId: normalizedPromptId
        }
    });
    if (uniqueTools.length === 0) {
        console.log("[SavePromptToolSettingsService] No tools to save after filtering");
        return;
    }
    console.log("[SavePromptToolSettingsService] Saving tools:", uniqueTools);
    await PromptToolSetting_1.default.bulkCreate(uniqueTools.map(toolName => ({
        companyId,
        promptId: normalizedPromptId,
        toolName,
        enabled: true
    })));
};
exports.default = SavePromptToolSettingsService;
