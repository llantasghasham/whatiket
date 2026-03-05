"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.store = exports.show = exports.index = void 0;
const ListProfissionaisService_1 = __importDefault(require("../services/ProfissionalService/ListProfissionaisService"));
const CreateProfissionalService_1 = __importDefault(require("../services/ProfissionalService/CreateProfissionalService"));
const ShowProfissionalService_1 = __importDefault(require("../services/ProfissionalService/ShowProfissionalService"));
const UpdateProfissionalService_1 = __importDefault(require("../services/ProfissionalService/UpdateProfissionalService"));
const DeleteProfissionalService_1 = __importDefault(require("../services/ProfissionalService/DeleteProfissionalService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const profissionais = await (0, ListProfissionaisService_1.default)({ companyId });
    return res.json(profissionais);
};
exports.index = index;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { profissionalId } = req.params;
    const profissional = await (0, ShowProfissionalService_1.default)({ id: profissionalId, companyId });
    return res.json(profissional);
};
exports.show = show;
const store = async (req, res) => {
    const { companyId } = req.user;
    const { nome, servicos, agenda, ativo, comissao, valorEmAberto, valoresRecebidos, valoresAReceber } = req.body;
    const profissional = await (0, CreateProfissionalService_1.default)({
        companyId,
        nome,
        servicos,
        agenda,
        ativo,
        comissao,
        valorEmAberto,
        valoresRecebidos,
        valoresAReceber
    });
    return res.status(201).json(profissional);
};
exports.store = store;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { profissionalId } = req.params;
    const { nome, servicos, agenda, ativo, comissao, valorEmAberto, valoresRecebidos, valoresAReceber } = req.body;
    const profissional = await (0, UpdateProfissionalService_1.default)({
        id: profissionalId,
        companyId,
        nome,
        servicos,
        agenda,
        ativo,
        comissao,
        valorEmAberto,
        valoresRecebidos,
        valoresAReceber
    });
    return res.json(profissional);
};
exports.update = update;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { profissionalId } = req.params;
    await (0, DeleteProfissionalService_1.default)({ id: profissionalId, companyId });
    return res.json({ message: "Profissional removido com sucesso" });
};
exports.remove = remove;
