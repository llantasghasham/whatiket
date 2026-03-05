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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Prompt_1 = __importDefault(require("../../models/Prompt"));
const ShowPromptService_1 = __importDefault(require("./ShowPromptService"));
const SavePromptToolSettingsService_1 = __importDefault(require("../PromptToolSettingService/SavePromptToolSettingsService"));
const CreatePromptService = async (promptData) => {
    console.log("[CreatePromptService] Starting with promptData:", JSON.stringify(promptData, null, 2));
    const { name, apiKey, prompt, queueId, maxMessages, companyId, toolsEnabled, knowledgeBase } = promptData;
    console.log("[CreatePromptService] toolsEnabled:", toolsEnabled);
    const promptSchema = Yup.object().shape({
        name: Yup.string().required("ERR_PROMPT_NAME_INVALID"),
        prompt: Yup.string().required("ERR_PROMPT_INTELLIGENCE_INVALID"),
        apiKey: Yup.string().required("ERR_PROMPT_APIKEY_INVALID"),
        queueId: Yup.number().required("ERR_PROMPT_QUEUEID_INVALID"),
        maxMessages: Yup.number().required("ERR_PROMPT_MAX_MESSAGES_INVALID"),
        companyId: Yup.number().required("ERR_PROMPT_companyId_INVALID")
    });
    try {
        await promptSchema.validate({ name, apiKey, prompt, queueId, maxMessages, companyId });
        console.log("[CreatePromptService] Validation passed");
    }
    catch (err) {
        console.error("[CreatePromptService] Validation error:", err);
        throw new AppError_1.default(`${JSON.stringify(err, undefined, 2)}`);
    }
    let promptTable = await Prompt_1.default.create({
        ...promptData,
        knowledgeBase: knowledgeBase || []
    });
    console.log("[CreatePromptService] Prompt created with id:", promptTable.id);
    console.log("[CreatePromptService] About to call SavePromptToolSettingsService with:", { companyId, promptId: promptTable.id, toolsEnabled });
    try {
        await (0, SavePromptToolSettingsService_1.default)({
            companyId: Number(companyId),
            promptId: promptTable.id,
            toolsEnabled
        });
        console.log("[CreatePromptService] SavePromptToolSettingsService completed successfully");
    }
    catch (err) {
        console.error("[CreatePromptService] Error in SavePromptToolSettingsService:", err);
        throw err;
    }
    promptTable = await (0, ShowPromptService_1.default)({ promptId: promptTable.id, companyId });
    console.log("[CreatePromptService] Returning prompt with toolsEnabled:", promptTable.toolsEnabled);
    return promptTable;
};
exports.default = CreatePromptService;
