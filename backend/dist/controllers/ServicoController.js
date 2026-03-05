"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const ListServicosService_1 = __importDefault(require("../services/ServicoService/ListServicosService"));
const CreateServicoService_1 = __importDefault(require("../services/ServicoService/CreateServicoService"));
const ShowServicoService_1 = __importDefault(require("../services/ServicoService/ShowServicoService"));
const UpdateServicoService_1 = __importDefault(require("../services/ServicoService/UpdateServicoService"));
const DeleteServicoService_1 = __importDefault(require("../services/ServicoService/DeleteServicoService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const servicos = await (0, ListServicosService_1.default)({ companyId });
    return res.json(servicos);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { servicoId } = req.params;
    const servico = await (0, ShowServicoService_1.default)({ id: servicoId, companyId });
    return res.json(servico);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const { nome, descricao, valorOriginal, possuiDesconto, valorComDesconto } = req.body;
    const servico = await (0, CreateServicoService_1.default)({
        companyId,
        nome,
        descricao,
        valorOriginal,
        possuiDesconto,
        valorComDesconto
    });
    return res.status(201).json(servico);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { servicoId } = req.params;
    const { nome, descricao, valorOriginal, possuiDesconto, valorComDesconto } = req.body;
    const servico = await (0, UpdateServicoService_1.default)({
        id: servicoId,
        companyId,
        nome,
        descricao,
        valorOriginal,
        possuiDesconto,
        valorComDesconto
    });
    return res.json(servico);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { servicoId } = req.params;
    await (0, DeleteServicoService_1.default)({ id: servicoId, companyId });
    return res.json({ message: "Serviço removido com sucesso" });
};
exports.remove = remove;
