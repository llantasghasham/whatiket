"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const CreateFinanceiroPagamentoService_1 = __importDefault(require("../services/FinanceiroPagamentoService/CreateFinanceiroPagamentoService"));
const ListFinanceiroPagamentosService_1 = __importDefault(require("../services/FinanceiroPagamentoService/ListFinanceiroPagamentosService"));
const ShowFinanceiroPagamentoService_1 = __importDefault(require("../services/FinanceiroPagamentoService/ShowFinanceiroPagamentoService"));
const UpdateFinanceiroPagamentoService_1 = __importDefault(require("../services/FinanceiroPagamentoService/UpdateFinanceiroPagamentoService"));
const DeleteFinanceiroPagamentoService_1 = __importDefault(require("../services/FinanceiroPagamentoService/DeleteFinanceiroPagamentoService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { faturaId, metodoPagamento, searchParam, pageNumber } = req.query;
    const result = await (0, ListFinanceiroPagamentosService_1.default)({
        companyId: Number(companyId),
        faturaId,
        metodoPagamento,
        searchParam,
        pageNumber
    });
    return res.json(result);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const pagamento = await (0, ShowFinanceiroPagamentoService_1.default)(id, Number(companyId));
    return res.json(pagamento);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const pagamento = await (0, CreateFinanceiroPagamentoService_1.default)({
        ...req.body,
        companyId: Number(companyId)
    });
    return res.status(201).json(pagamento);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    const pagamento = await (0, UpdateFinanceiroPagamentoService_1.default)({
        id,
        companyId: Number(companyId),
        ...req.body
    });
    return res.json(pagamento);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { id } = req.params;
    await (0, DeleteFinanceiroPagamentoService_1.default)(id, Number(companyId));
    return res.status(204).send();
};
exports.remove = remove;
