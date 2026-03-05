"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ListPromptToolSettingsService_1 = __importDefault(require("../PromptToolSettingService/ListPromptToolSettingsService"));
const normalizePromptId = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};
const collectPromptIds = (nodes = []) => {
    const ids = nodes
        .map(node => normalizePromptId(node?.data?.typebotIntegration?.iaId))
        .filter((id) => id !== null);
    return Array.from(new Set(ids));
};
const attachToolsToNodes = (nodes = [], toolsByPromptId) => {
    nodes.forEach(node => {
        const iaId = normalizePromptId(node?.data?.typebotIntegration?.iaId);
        if (iaId === null) {
            return;
        }
        const toolsEnabled = toolsByPromptId.get(iaId) || [];
        if (!node.data) {
            node.data = {};
        }
        if (!node.data.typebotIntegration) {
            node.data.typebotIntegration = {};
        }
        node.data.typebotIntegration.toolsEnabled = toolsEnabled || [];
    });
};
const AttachToolsEnabledToFlow = async (flow, companyId) => {
    if (!flow) {
        return;
    }
    const flowData = flow.get("flow");
    if (!flowData?.nodes || flowData.nodes.length === 0) {
        return;
    }
    const promptIds = collectPromptIds(flowData.nodes);
    if (promptIds.length === 0) {
        return;
    }
    const toolsByPromptId = new Map();
    for (const promptId of promptIds) {
        const toolsEnabled = await (0, ListPromptToolSettingsService_1.default)({
            companyId,
            promptId
        });
        toolsByPromptId.set(promptId, toolsEnabled);
    }
    attachToolsToNodes(flowData.nodes, toolsByPromptId);
    flow.setDataValue("flow", flowData);
};
exports.default = AttachToolsEnabledToFlow;
