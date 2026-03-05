"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Automation_1 = __importDefault(require("../../models/Automation"));
const AutomationAction_1 = __importDefault(require("../../models/AutomationAction"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const UpdateAutomationService = async (data) => {
    const { id, companyId, actions, ...updateData } = data;
    const automation = await Automation_1.default.findOne({
        where: { id, companyId }
    });
    if (!automation) {
        throw new AppError_1.default("ERR_AUTOMATION_NOT_FOUND", 404);
    }
    await automation.update(updateData);
    if (actions !== undefined) {
        // Remove ações existentes
        await AutomationAction_1.default.destroy({
            where: { automationId: automation.id }
        });
        // Cria novas ações
        if (actions.length > 0) {
            const actionsToCreate = actions.map((action, index) => ({
                automationId: automation.id,
                actionType: action.actionType,
                actionConfig: action.actionConfig || {},
                order: action.order || index + 1,
                delayMinutes: action.delayMinutes || 0
            }));
            await AutomationAction_1.default.bulkCreate(actionsToCreate);
        }
    }
    await automation.reload({
        include: [{ model: AutomationAction_1.default, as: "actions" }]
    });
    return automation;
};
exports.default = UpdateAutomationService;
