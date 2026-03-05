"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Negocio_1 = __importDefault(require("../../models/Negocio"));
const triggerExternalWebhook_1 = __importDefault(require("../../services/ExternalWebhook/triggerExternalWebhook"));
const ensureExternalAuth = (req) => {
    if (!req.externalAuth) {
        throw new AppError_1.default("ERR_EXTERNAL_AUTH_REQUIRED", 401);
    }
    return req.externalAuth;
};
const index = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { pageNumber, searchParam } = req.query;
    const limit = 50;
    const offset = pageNumber ? (Number(pageNumber) - 1) * limit : 0;
    const whereCondition = { companyId };
    if (searchParam) {
        whereCondition.name = {
            [require("sequelize").Op.iLike]: `%${searchParam}%`
        };
    }
    const { count, rows: negocios } = await Negocio_1.default.findAndCountAll({
        where: whereCondition,
        order: [["name", "ASC"]],
        limit,
        offset
    });
    const hasMore = count > offset + negocios.length;
    return res.json({ negocios, count, hasMore });
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = ensureExternalAuth(req);
    const { id } = req.params;
    const negocio = await Negocio_1.default.findOne({
        where: { id: Number(id), companyId }
    });
    if (!negocio) {
        throw new AppError_1.default("ERR_NEGOCIO_NOT_FOUND", 404);
    }
    return res.json(negocio);
};
exports.show = show;
const store = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { name, description, kanbanBoards, users } = req.body;
    if (!name) {
        throw new AppError_1.default("ERR_NEGOCIO_NAME_REQUIRED", 400);
    }
    // Verificar se já existe negócio com mesmo nome na empresa
    const existingNegocio = await Negocio_1.default.findOne({
        where: { name, companyId: externalAuth.companyId }
    });
    if (existingNegocio) {
        throw new AppError_1.default("ERR_NEGOCIO_NAME_ALREADY_EXISTS", 400);
    }
    const negocio = await Negocio_1.default.create({
        name,
        description: description || null,
        kanbanBoards: kanbanBoards || [],
        users: users || [],
        companyId: externalAuth.companyId
    });
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "negocio.created",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            negocio
        }
    });
    return res.status(201).json(negocio);
};
exports.store = store;
const update = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const { name, description, kanbanBoards, users } = req.body;
    const negocio = await Negocio_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!negocio) {
        throw new AppError_1.default("ERR_NEGOCIO_NOT_FOUND", 404);
    }
    // Verificar se já existe outro negócio com mesmo nome
    if (name && name !== negocio.name) {
        const existingNegocio = await Negocio_1.default.findOne({
            where: { name, companyId: externalAuth.companyId }
        });
        if (existingNegocio) {
            throw new AppError_1.default("ERR_NEGOCIO_NAME_ALREADY_EXISTS", 400);
        }
    }
    await negocio.update({
        name: name !== undefined ? name : negocio.name,
        description: description !== undefined ? description : negocio.description,
        kanbanBoards: kanbanBoards !== undefined ? kanbanBoards : negocio.kanbanBoards,
        users: users !== undefined ? users : negocio.users
    });
    await negocio.reload();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "negocio.updated",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            negocio
        }
    });
    return res.json(negocio);
};
exports.update = update;
const remove = async (req, res) => {
    const externalAuth = ensureExternalAuth(req);
    const { id } = req.params;
    const negocio = await Negocio_1.default.findOne({
        where: { id: Number(id), companyId: externalAuth.companyId }
    });
    if (!negocio) {
        throw new AppError_1.default("ERR_NEGOCIO_NOT_FOUND", 404);
    }
    await negocio.destroy();
    await (0, triggerExternalWebhook_1.default)({
        url: externalAuth.webhookUrl,
        secret: externalAuth.webhookSecret,
        event: "negocio.deleted",
        data: {
            apiKeyId: externalAuth.apiKeyId,
            negocioId: Number(id)
        }
    });
    return res.status(204).send();
};
exports.remove = remove;
