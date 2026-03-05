"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.upsert = exports.index = void 0;
const ListCompanyPaymentSettingsService_1 = __importDefault(require("../services/CompanyPaymentSettingService/ListCompanyPaymentSettingsService"));
const UpsertCompanyPaymentSettingService_1 = __importDefault(require("../services/CompanyPaymentSettingService/UpsertCompanyPaymentSettingService"));
const DeleteCompanyPaymentSettingService_1 = __importDefault(require("../services/CompanyPaymentSettingService/DeleteCompanyPaymentSettingService"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const ensureCompanyScope = (requestCompanyId, targetCompanyId) => {
    if (targetCompanyId && targetCompanyId !== requestCompanyId) {
        throw new AppError_1.default("Acesso negado.", 403);
    }
};
const index = async (req, res) => {
    const { companyId } = req.user;
    const records = await (0, ListCompanyPaymentSettingsService_1.default)({
        companyId: Number(companyId)
    });
    return res.json(records);
};
exports.index = index;
const upsert = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    ensureCompanyScope(Number(companyId));
    const record = await (0, UpsertCompanyPaymentSettingService_1.default)({
        id: id ? Number(id) : undefined,
        companyId: Number(companyId),
        ...req.body
    });
    return res.json(record);
};
exports.upsert = upsert;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    ensureCompanyScope(Number(companyId));
    await (0, DeleteCompanyPaymentSettingService_1.default)({
        id: Number(id),
        companyId: Number(companyId)
    });
    return res.status(204).send();
};
exports.remove = remove;
