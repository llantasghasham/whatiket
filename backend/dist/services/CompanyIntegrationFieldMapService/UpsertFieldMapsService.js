"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Yup = __importStar(require("yup"));
const sequelize_1 = require("sequelize");
const CompanyIntegrationFieldMap_1 = __importDefault(require("../../models/CompanyIntegrationFieldMap"));
const CompanyIntegrationSetting_1 = __importDefault(require("../../models/CompanyIntegrationSetting"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const fieldMapSchema = Yup.object().shape({
    id: Yup.number().optional(),
    externalField: Yup.string().required(),
    crmField: Yup.string().nullable(),
    transformExpression: Yup.string().nullable(),
    options: Yup.object().nullable()
});
const UpsertFieldMapsService = async ({ integrationId, companyId, fieldMaps }) => {
    const integration = await CompanyIntegrationSetting_1.default.findOne({
        where: { id: integrationId, companyId }
    });
    if (!integration) {
        throw new AppError_1.default("Integração não encontrada.", 404);
    }
    const validatedMaps = await Promise.all(fieldMaps.map(async (map) => {
        const payload = await fieldMapSchema.validate(map, { abortEarly: false });
        return {
            integrationId,
            ...payload
        };
    }));
    const results = await Promise.all(validatedMaps.map(async (map) => {
        if (map.id) {
            const [, updated] = await CompanyIntegrationFieldMap_1.default.update(map, {
                where: { id: map.id, integrationId },
                returning: true
            });
            return updated[0];
        }
        return CompanyIntegrationFieldMap_1.default.create(map);
    }));
    const ids = results.filter(Boolean).map(record => record.id);
    await CompanyIntegrationFieldMap_1.default.destroy({
        where: {
            integrationId,
            ...(ids.length > 0
                ? {
                    id: {
                        [sequelize_1.Op.notIn]: ids
                    }
                }
                : {})
        }
    });
    return CompanyIntegrationFieldMap_1.default.findAll({
        where: { integrationId },
        order: [["externalField", "ASC"]]
    });
};
exports.default = UpsertFieldMapsService;
