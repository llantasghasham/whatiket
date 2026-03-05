"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagar = exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateFinanceiroDespesaService_1 = __importDefault(require("../services/FinanceiroDespesaService/CreateFinanceiroDespesaService"));
const ListFinanceiroDespesasService_1 = __importDefault(require("../services/FinanceiroDespesaService/ListFinanceiroDespesasService"));
const ShowFinanceiroDespesaService_1 = __importDefault(require("../services/FinanceiroDespesaService/ShowFinanceiroDespesaService"));
const UpdateFinanceiroDespesaService_1 = __importDefault(require("../services/FinanceiroDespesaService/UpdateFinanceiroDespesaService"));
const DeleteFinanceiroDespesaService_1 = __importDefault(require("../services/FinanceiroDespesaService/DeleteFinanceiroDespesaService"));
const PagarFinanceiroDespesaService_1 = __importDefault(require("../services/FinanceiroDespesaService/PagarFinanceiroDespesaService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, fornecedorId, categoriaId, status, dataVencimentoInicio, dataVencimentoFim, pageNumber } = req.query;
    const result = await (0, ListFinanceiroDespesasService_1.default)({
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
    const record = await (0, ShowFinanceiroDespesaService_1.default)(id, Number(companyId));
    return res.json(record);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    console.log("DEBUG: companyId do usuário:", companyId);
    console.log("DEBUG: req.body:", req.body);
    const record = await (0, CreateFinanceiroDespesaService_1.default)({
        ...req.body,
        companyId: Number(companyId)
    });
    return res.status(201).json(record);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, UpdateFinanceiroDespesaService_1.default)(id, req.body, Number(companyId));
    return res.json(record);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteFinanceiroDespesaService_1.default)(id, Number(companyId));
    return res.status(204).send();
};
exports.remove = remove;
const pagar = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, PagarFinanceiroDespesaService_1.default)(id, Number(companyId), req.body);
    return res.json(record);
};
exports.pagar = pagar;
