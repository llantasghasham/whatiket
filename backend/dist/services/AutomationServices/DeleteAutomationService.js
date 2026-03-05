"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Automation_1 = __importDefault(require("../../models/Automation"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const DeleteAutomationService = async (data) => {
    const { id, companyId } = data;
    const automation = await Automation_1.default.findOne({
        where: { id, companyId }
    });
    if (!automation) {
        throw new AppError_1.default("ERR_AUTOMATION_NOT_FOUND", 404);
    }
    await automation.destroy();
};
exports.default = DeleteAutomationService;
