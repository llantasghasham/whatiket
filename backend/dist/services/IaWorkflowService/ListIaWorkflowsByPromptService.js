"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IaWorkflow_1 = __importDefault(require("../../models/IaWorkflow"));
const ListIaWorkflowsByPromptService = async ({ companyId, orchestratorPromptId }) => {
    const links = await IaWorkflow_1.default.findAll({
        where: { companyId, orchestratorPromptId }
    });
    return links;
};
exports.default = ListIaWorkflowsByPromptService;
