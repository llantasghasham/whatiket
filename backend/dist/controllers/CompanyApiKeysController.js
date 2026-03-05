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
exports.remove = exports.update = exports.store = exports.index = void 0;
const Yup = __importStar(require("yup"));
const CompanyApiKey_1 = __importDefault(require("../models/CompanyApiKey"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const generateApiToken_1 = __importDefault(require("../utils/generateApiToken"));
const upsertSchema = Yup.object().shape({
    label: Yup.string().required("O nome do token é obrigatório."),
    webhookUrl: Yup.string().url("Webhook deve ser uma URL válida.").nullable(),
    webhookSecret: Yup.string().nullable(),
    active: Yup.boolean().optional(),
    regenerateToken: Yup.boolean().optional()
});
const index = async (req, res) => {
    const { companyId } = req.user;
    const records = await CompanyApiKey_1.default.findAll({
        where: { companyId },
        order: [["createdAt", "DESC"]]
    });
    return res.json(records);
};
exports.index = index;
const store = async (req, res) => {
    const { companyId } = req.user;
    const payload = await upsertSchema.validate(req.body);
    const token = (0, generateApiToken_1.default)();
    const record = await CompanyApiKey_1.default.create({
        companyId,
        label: payload.label,
        webhookUrl: payload.webhookUrl,
        webhookSecret: payload.webhookSecret,
        token
    });
    return res.status(201).json(record);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const payload = await upsertSchema.validate(req.body);
    const record = await CompanyApiKey_1.default.findOne({
        where: { id, companyId }
    });
    if (!record) {
        throw new AppError_1.default("Token não encontrado.", 404);
    }
    if (payload.regenerateToken) {
        record.token = (0, generateApiToken_1.default)();
    }
    await record.update({
        label: payload.label,
        webhookUrl: payload.webhookUrl,
        webhookSecret: payload.webhookSecret,
        active: typeof payload.active === "boolean" ? payload.active : record.active
    });
    return res.json(record);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await CompanyApiKey_1.default.findOne({
        where: { id, companyId }
    });
    if (!record) {
        throw new AppError_1.default("Token não encontrado.", 404);
    }
    await record.destroy();
    return res.status(204).send();
};
exports.remove = remove;
