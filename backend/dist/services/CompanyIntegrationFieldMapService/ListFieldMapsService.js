"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompanyIntegrationFieldMap_1 = __importDefault(require("../../models/CompanyIntegrationFieldMap"));
const ListFieldMapsService = async ({ integrationId, companyId }) => {
    return CompanyIntegrationFieldMap_1.default.findAll({
        where: { integrationId },
        include: [
            {
                association: "integration",
                where: { companyId },
                attributes: []
            }
        ],
        order: [["externalField", "ASC"]]
    });
};
exports.default = ListFieldMapsService;
