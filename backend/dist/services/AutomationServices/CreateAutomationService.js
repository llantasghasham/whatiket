"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Automation_1 = __importDefault(require("../../models/Automation"));
const AutomationAction_1 = __importDefault(require("../../models/AutomationAction"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateAutomationService = async (data) => {
    const { companyId, name, description, triggerType, triggerConfig, isActive, actions } = data;
    if (!name || !triggerType) {
        throw new AppError_1.default("ERR_AUTOMATION_REQUIRED_FIELDS", 400);
    }
    const automation = await Automation_1.default.create({
        companyId,
        name,
        description,
        triggerType,
        triggerConfig: triggerConfig || {},
        isActive: isActive !== undefined ? isActive : true
    });
    if (actions && actions.length > 0) {
        const actionsToCreate = actions.map((action, index) => ({
            automationId: automation.id,
            actionType: action.actionType,
            actionConfig: action.actionConfig || {},
            order: action.order || index + 1,
            delayMinutes: action.delayMinutes || 0
        }));
        await AutomationAction_1.default.bulkCreate(actionsToCreate);
    }
    await automation.reload({
        include: [{ model: AutomationAction_1.default, as: "actions" }]
    });
    return automation;
};
exports.default = CreateAutomationService;
