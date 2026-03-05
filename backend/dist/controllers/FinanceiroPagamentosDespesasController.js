"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateFinanceiroPagamentoDespesaService_1 = __importDefault(require("../services/FinanceiroPagamentoDespesaService/CreateFinanceiroPagamentoDespesaService"));
const ListFinanceiroPagamentosDespesasService_1 = __importDefault(require("../services/FinanceiroPagamentoDespesaService/ListFinanceiroPagamentosDespesasService"));
const ShowFinanceiroPagamentoDespesaService_1 = __importDefault(require("../services/FinanceiroPagamentoDespesaService/ShowFinanceiroPagamentoDespesaService"));
const UpdateFinanceiroPagamentoDespesaService_1 = __importDefault(require("../services/FinanceiroPagamentoDespesaService/UpdateFinanceiroPagamentoDespesaService"));
const DeleteFinanceiroPagamentoDespesaService_1 = __importDefault(require("../services/FinanceiroPagamentoDespesaService/DeleteFinanceiroPagamentoDespesaService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, despesaId, metodoPagamento, dataPagamentoInicio, dataPagamentoFim, pageNumber } = req.query;
    const result = await (0, ListFinanceiroPagamentosDespesasService_1.default)({
        companyId: Number(companyId),
        searchParam,
        despesaId: despesaId ? Number(despesaId) : undefined,
        metodoPagamento,
        dataPagamentoInicio,
        dataPagamentoFim,
        pageNumber: pageNumber ? Number(pageNumber) : undefined
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, ShowFinanceiroPagamentoDespesaService_1.default)(id, Number(companyId));
    return res.json(record);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const record = await (0, CreateFinanceiroPagamentoDespesaService_1.default)(req.body, Number(companyId));
    return res.status(201).json(record);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const record = await (0, UpdateFinanceiroPagamentoDespesaService_1.default)(id, req.body, Number(companyId));
    return res.json(record);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteFinanceiroPagamentoDespesaService_1.default)(id, Number(companyId));
    return res.status(204).send();
};
exports.remove = remove;
