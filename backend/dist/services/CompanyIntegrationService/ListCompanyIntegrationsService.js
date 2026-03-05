"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompanyIntegrationSetting_1 = __importDefault(require("../../models/CompanyIntegrationSetting"));
const CompanyIntegrationFieldMap_1 = __importDefault(require("../../models/CompanyIntegrationFieldMap"));
const ListCompanyIntegrationsService = async ({ companyId }) => {
    const records = await CompanyIntegrationSetting_1.default.findAll({
        where: { companyId },
        include: [
            {
                model: CompanyIntegrationFieldMap_1.default,
                as: "fieldMaps"
            }
        ],
        order: [
            ["name", "ASC"],
            [{ model: CompanyIntegrationFieldMap_1.default, as: "fieldMaps" }, "externalField", "ASC"]
        ]
    });
    return records;
};
exports.default = ListCompanyIntegrationsService;
