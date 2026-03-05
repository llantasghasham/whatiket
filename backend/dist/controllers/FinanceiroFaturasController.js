"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateFinanceiroFaturaService_1 = __importDefault(require("../services/FinanceiroFaturaService/CreateFinanceiroFaturaService"));
const ListFinanceiroFaturasService_1 = __importDefault(require("../services/FinanceiroFaturaService/ListFinanceiroFaturasService"));
const ShowFinanceiroFaturaService_1 = __importDefault(require("../services/FinanceiroFaturaService/ShowFinanceiroFaturaService"));
const UpdateFinanceiroFaturaService_1 = __importDefault(require("../services/FinanceiroFaturaService/UpdateFinanceiroFaturaService"));
const DeleteFinanceiroFaturaService_1 = __importDefault(require("../services/FinanceiroFaturaService/DeleteFinanceiroFaturaService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, status, tipoRecorrencia, ativa, clientId, projectId, pageNumber } = req.query;
    const result = await (0, ListFinanceiroFaturasService_1.default)({
        companyId: Number(companyId),
        searchParam,
        status,
        tipoRecorrencia,
        ativa,
        clientId,
        projectId,
        pageNumber
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, ShowFinanceiroFaturaService_1.default)(id, Number(companyId));
    return res.json(record);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const record = await (0, CreateFinanceiroFaturaService_1.default)({
        ...req.body,
        companyId: Number(companyId)
    });
    return res.status(201).json(record);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, UpdateFinanceiroFaturaService_1.default)({
        id,
        companyId: Number(companyId),
        ...req.body
    });
    return res.json(record);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteFinanceiroFaturaService_1.default)(id, Number(companyId));
    return res.status(204).send();
};
exports.remove = remove;
