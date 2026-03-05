"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompanyPaymentSetting_1 = __importDefault(require("../../models/CompanyPaymentSetting"));
const ListCompanyPaymentSettingsService = async ({ companyId }) => {
    const records = await CompanyPaymentSetting_1.default.findAll({
        where: { companyId },
        order: [["provider", "ASC"]]
    });
    return records;
};
exports.default = ListCompanyPaymentSettingsService;
