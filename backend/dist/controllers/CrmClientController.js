"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const ListCrmClientsService_1 = __importDefault(require("../services/CrmClientService/ListCrmClientsService"));
const CreateCrmClientService_1 = __importDefault(require("../services/CrmClientService/CreateCrmClientService"));
const ShowCrmClientService_1 = __importDefault(require("../services/CrmClientService/ShowCrmClientService"));
const UpdateCrmClientService_1 = __importDefault(require("../services/CrmClientService/UpdateCrmClientService"));
const DeleteCrmClientService_1 = __importDefault(require("../services/CrmClientService/DeleteCrmClientService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, status, type, ownerUserId, pageNumber, limit } = req.query;
    const result = await (0, ListCrmClientsService_1.default)({
        companyId,
        searchParam,
        status,
        type,
        ownerUserId: ownerUserId ? Number(ownerUserId) : undefined,
        pageNumber: pageNumber ? Number(pageNumber) : undefined,
        limit: limit ? Number(limit) : undefined
    });
    return res.json(result);
};
exports.index = index;
const store = async (req, res) => {
    const { companyId } = req.user;
    const data = req.body;
    const client = await (0, CreateCrmClientService_1.default)({
        ...data,
        companyId
    });
    return res.status(201).json(client);
};
exports.store = store;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { clientId } = req.params;
    const client = await (0, ShowCrmClientService_1.default)({
        id: Number(clientId),
        companyId
    });
    return res.json(client);
};
exports.show = show;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { clientId } = req.params;
    const data = req.body;
    const client = await (0, UpdateCrmClientService_1.default)({
        id: Number(clientId),
        companyId,
        ...data
    });
    return res.json(client);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { clientId } = req.params;
    await (0, DeleteCrmClientService_1.default)({
        id: Number(clientId),
        companyId
    });
    return res.status(204).send();
};
exports.remove = remove;
