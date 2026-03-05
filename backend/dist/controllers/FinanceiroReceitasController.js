"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateFinanceiroReceitaService_1 = __importDefault(require("../services/FinanceiroReceitaService/CreateFinanceiroReceitaService"));
const ListFinanceiroReceitasService_1 = __importDefault(require("../services/FinanceiroReceitaService/ListFinanceiroReceitasService"));
const ShowFinanceiroReceitaService_1 = __importDefault(require("../services/FinanceiroReceitaService/ShowFinanceiroReceitaService"));
const UpdateFinanceiroReceitaService_1 = __importDefault(require("../services/FinanceiroReceitaService/UpdateFinanceiroReceitaService"));
const DeleteFinanceiroReceitaService_1 = __importDefault(require("../services/FinanceiroReceitaService/DeleteFinanceiroReceitaService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, fornecedorId, categoriaId, status, dataVencimentoInicio, dataVencimentoFim, pageNumber } = req.query;
    const result = await (0, ListFinanceiroReceitasService_1.default)({
        companyId: Number(companyId),
        searchParam,
        fornecedorId: fornecedorId ? Number(fornecedorId) : undefined,
        categoriaId: categoriaId ? Number(categoriaId) : undefined,
        status,
        dataVencimentoInicio,
        dataVencimentoFim,
        pageNumber: pageNumber ? Number(pageNumber) : undefined
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, ShowFinanceiroReceitaService_1.default)(id, Number(companyId));
    return res.json(record);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const record = await (0, CreateFinanceiroReceitaService_1.default)({
        ...req.body,
        companyId: Number(companyId)
    });
    return res.status(201).json(record);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, UpdateFinanceiroReceitaService_1.default)(id, req.body, Number(companyId));
    return res.json(record);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteFinanceiroReceitaService_1.default)(id, Number(companyId));
    return res.status(204).send();
};
exports.remove = remove;
