"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompanyIntegrationSetting_1 = __importDefault(require("../../models/CompanyIntegrationSetting"));
const DeleteCompanyIntegrationService = async ({ id, companyId }) => {
    await CompanyIntegrationSetting_1.default.destroy({
        where: {
            id,
            companyId
        }
    });
};
exports.default = DeleteCompanyIntegrationService;
