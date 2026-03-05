"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleActive = exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateAutomationService_1 = __importDefault(require("../services/AutomationServices/CreateAutomationService"));
const UpdateAutomationService_1 = __importDefault(require("../services/AutomationServices/UpdateAutomationService"));
const DeleteAutomationService_1 = __importDefault(require("../services/AutomationServices/DeleteAutomationService"));
const ListAutomationsService_1 = __importDefault(require("../services/AutomationServices/ListAutomationsService"));
const ShowAutomationService_1 = __importDefault(require("../services/AutomationServices/ShowAutomationService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, triggerType, isActive, pageNumber } = req.query;
    const { automations, count, hasMore } = await (0, ListAutomationsService_1.default)({
        companyId,
        searchParam: searchParam,
        triggerType: triggerType,
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
        pageNumber: pageNumber
    });
    return res.json({ automations, count, hasMore });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { automationId } = req.params;
    const automation = await (0, ShowAutomationService_1.default)({
        id: Number(automationId),
        companyId
    });
    return res.json(automation);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const { name, description, triggerType, triggerConfig, isActive, actions } = req.body;
    const automation = await (0, CreateAutomationService_1.default)({
        companyId,
        name,
        description,
        triggerType,
        triggerConfig,
        isActive,
        actions
    });
    return res.status(201).json(automation);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { automationId } = req.params;
    const { name, description, triggerType, triggerConfig, isActive, actions } = req.body;
    const automation = await (0, UpdateAutomationService_1.default)({
        id: Number(automationId),
        companyId,
        name,
        description,
        triggerType,
        triggerConfig,
        isActive,
        actions
    });
    return res.json(automation);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { automationId } = req.params;
    await (0, DeleteAutomationService_1.default)({
        id: Number(automationId),
        companyId
    });
    return res.status(200).json({ message: "Automação removida com sucesso" });
};
exports.remove = remove;
const toggleActive = async (req, res) => {
    const { companyId } = req.user;
    const { automationId } = req.params;
    const { isActive } = req.body;
    const automation = await (0, UpdateAutomationService_1.default)({
        id: Number(automationId),
        companyId,
        isActive
    });
    return res.json(automation);
};
exports.toggleActive = toggleActive;
