"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertFieldMaps = exports.remove = exports.upsert = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const ListCompanyIntegrationsService_1 = __importDefault(require("../services/CompanyIntegrationService/ListCompanyIntegrationsService"));
const ShowCompanyIntegrationService_1 = __importDefault(require("../services/CompanyIntegrationService/ShowCompanyIntegrationService"));
const UpsertCompanyIntegrationService_1 = __importDefault(require("../services/CompanyIntegrationService/UpsertCompanyIntegrationService"));
const DeleteCompanyIntegrationService_1 = __importDefault(require("../services/CompanyIntegrationService/DeleteCompanyIntegrationService"));
const UpsertFieldMapsService_1 = __importDefault(require("../services/CompanyIntegrationFieldMapService/UpsertFieldMapsService"));
const ensureCompanyScope = (requestCompanyId, targetCompanyId) => {
    if (targetCompanyId && targetCompanyId !== requestCompanyId) {
        throw new AppError_1.default("Acesso negado.", 403);
    }
};
const index = async (req, res) => {
    const { companyId } = req.user;
    const records = await (0, ListCompanyIntegrationsService_1.default)({
        companyId: Number(companyId)
    });
    return res.json(records);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, ShowCompanyIntegrationService_1.default)({
        id: Number(id),
        companyId: Number(companyId)
    });
    return res.json(record);
};
exports.show = show;
const upsert = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    ensureCompanyScope(Number(companyId));
    const record = await (0, UpsertCompanyIntegrationService_1.default)({
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
    await (0, DeleteCompanyIntegrationService_1.default)({
        id: Number(id),
        companyId: Number(companyId)
    });
    return res.status(204).send();
};
exports.remove = remove;
const upsertFieldMaps = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const maps = await (0, UpsertFieldMapsService_1.default)({
        integrationId: Number(id),
        companyId: Number(companyId),
        fieldMaps: req.body?.fieldMaps || []
    });
    return res.json(maps);
};
exports.upsertFieldMaps = upsertFieldMaps;
