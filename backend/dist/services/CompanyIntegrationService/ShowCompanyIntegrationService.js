"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompanyIntegrationSetting_1 = __importDefault(require("../../models/CompanyIntegrationSetting"));
const CompanyIntegrationFieldMap_1 = __importDefault(require("../../models/CompanyIntegrationFieldMap"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowCompanyIntegrationService = async ({ id, companyId }) => {
    const record = await CompanyIntegrationSetting_1.default.findOne({
        where: { id, companyId },
        include: [
            {
                model: CompanyIntegrationFieldMap_1.default,
                as: "fieldMaps"
            }
        ]
    });
    if (!record) {
        throw new AppError_1.default("Integração não encontrada.", 404);
    }
    return record;
};
exports.default = ShowCompanyIntegrationService;
