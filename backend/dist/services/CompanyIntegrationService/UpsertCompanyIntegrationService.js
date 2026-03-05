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
const CompanyIntegrationSetting_1 = __importDefault(require("../../models/CompanyIntegrationSetting"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const schema = Yup.object().shape({
    id: Yup.number().optional(),
    companyId: Yup.number().required(),
    name: Yup.string().required(),
    provider: Yup.string().nullable(),
    baseUrl: Yup.string().url().nullable(),
    apiKey: Yup.string().nullable(),
    apiSecret: Yup.string().nullable(),
    webhookSecret: Yup.string().nullable(),
    metadata: Yup.object().nullable(),
    active: Yup.boolean().default(true)
});
const UpsertCompanyIntegrationService = async (params) => {
    const payload = await schema.validate(params, { abortEarly: false });
    const [record] = await CompanyIntegrationSetting_1.default.upsert(payload, { returning: true });
    if (!record) {
        throw new AppError_1.default("Erro ao salvar integração.", 500);
    }
    return record;
};
exports.default = UpsertCompanyIntegrationService;
