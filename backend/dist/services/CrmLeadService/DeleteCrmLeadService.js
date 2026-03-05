"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CrmLead_1 = __importDefault(require("../../models/CrmLead"));
const DeleteCrmLeadService = async ({ id, companyId }) => {
    const lead = await CrmLead_1.default.findOne({
        where: { id, companyId }
    });
    if (!lead) {
        throw new AppError_1.default("Lead não encontrado.", 404);
    }
    await lead.destroy();
};
exports.default = DeleteCrmLeadService;
