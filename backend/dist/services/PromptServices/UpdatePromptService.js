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
const ShowPromptService_1 = __importDefault(require("./ShowPromptService"));
const SavePromptToolSettingsService_1 = __importDefault(require("../PromptToolSettingService/SavePromptToolSettingsService"));
const UpdatePromptService = async ({ promptId, promptData, companyId }) => {
    const promptTable = await (0, ShowPromptService_1.default)({ promptId: promptId, companyId });
    const promptSchema = Yup.object().shape({
        name: Yup.string().required("ERR_PROMPT_NAME_INVALID"),
        prompt: Yup.string().required("ERR_PROMPT_PROMPT_INVALID"),
        apiKey: Yup.string().required("ERR_PROMPT_APIKEY_INVALID"),
        queueId: Yup.number().required("ERR_PROMPT_QUEUEID_INVALID"),
        maxMessages: Yup.number().required("ERR_PROMPT_MAX_MESSAGES_INVALID"),
        provider: Yup.string().oneOf(['openai', 'gemini']).required("ERR_PROMPT_PROVIDER_INVALID"),
        model: Yup.string().required("ERR_PROMPT_MODEL_INVALID")
    });
    const { name, apiKey, prompt, maxTokens, temperature, promptTokens, completionTokens, totalTokens, queueId, maxMessages, voice, voiceKey, voiceRegion, provider, model, toolsEnabled, knowledgeBase } = promptData;
    try {
        await promptSchema.validate({ name, apiKey, prompt, maxTokens, temperature, promptTokens, completionTokens, totalTokens, queueId, maxMessages, provider, model });
    }
    catch (err) {
        throw new AppError_1.default(`${JSON.stringify(err, undefined, 2)}`);
    }
    await promptTable.update({ name, apiKey, prompt, maxTokens, temperature, promptTokens, completionTokens, totalTokens, queueId, maxMessages, voice, voiceKey, voiceRegion, provider, model, knowledgeBase: knowledgeBase || [] });
    console.log("[UpdatePromptService] About to call SavePromptToolSettingsService with:", { companyId, promptId, toolsEnabled });
    try {
        await (0, SavePromptToolSettingsService_1.default)({
            companyId: Number(companyId),
            promptId: Number(promptId),
            toolsEnabled
        });
        console.log("[UpdatePromptService] SavePromptToolSettingsService completed successfully");
    }
    catch (err) {
        console.error("[UpdatePromptService] Error in SavePromptToolSettingsService:", err);
        throw err;
    }
    return (0, ShowPromptService_1.default)({ promptId, companyId });
};
exports.default = UpdatePromptService;
