"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompanyPaymentSetting_1 = __importDefault(require("../../models/CompanyPaymentSetting"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const DeleteCompanyPaymentSettingService = async ({ id, companyId }) => {
    const record = await CompanyPaymentSetting_1.default.findOne({
        where: { id, companyId }
    });
    if (!record) {
        throw new AppError_1.default("Configuração não encontrada.", 404);
    }
    await record.destroy();
};
exports.default = DeleteCompanyPaymentSettingService;
