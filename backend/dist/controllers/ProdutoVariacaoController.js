"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOpcao = exports.updateOpcao = exports.createOpcao = exports.deleteGrupo = exports.updateGrupo = exports.createGrupo = exports.listGrupos = void 0;
const ListService_1 = __importDefault(require("../services/ProdutoVariacaoGrupoService/ListService"));
const CreateService_1 = __importDefault(require("../services/ProdutoVariacaoGrupoService/CreateService"));
const UpdateService_1 = __importDefault(require("../services/ProdutoVariacaoGrupoService/UpdateService"));
const DeleteService_1 = __importDefault(require("../services/ProdutoVariacaoGrupoService/DeleteService"));
const CreateService_2 = __importDefault(require("../services/ProdutoVariacaoOpcaoService/CreateService"));
const UpdateService_2 = __importDefault(require("../services/ProdutoVariacaoOpcaoService/UpdateService"));
const DeleteService_2 = __importDefault(require("../services/ProdutoVariacaoOpcaoService/DeleteService"));
const listGrupos = async (req, res) => {
    const { companyId } = req.user;
    const grupos = await (0, ListService_1.default)(companyId);
    return res.json(grupos);
};
exports.listGrupos = listGrupos;
const createGrupo = async (req, res) => {
    const { companyId } = req.user;
    const { nome } = req.body;
    const grupo = await (0, CreateService_1.default)({ companyId, nome });
    return res.status(201).json(grupo);
};
exports.createGrupo = createGrupo;
const updateGrupo = async (req, res) => {
    const { companyId } = req.user;
    const { grupoId } = req.params;
    const { nome } = req.body;
    const grupo = await (0, UpdateService_1.default)({
        companyId,
        grupoId: Number(grupoId),
        nome
    });
    return res.json(grupo);
};
exports.updateGrupo = updateGrupo;
const deleteGrupo = async (req, res) => {
    const { companyId } = req.user;
    const { grupoId } = req.params;
    await (0, DeleteService_1.default)({ companyId, grupoId: Number(grupoId) });
    return res.status(204).send();
};
exports.deleteGrupo = deleteGrupo;
const createOpcao = async (req, res) => {
    const { companyId } = req.user;
    const { grupoId, nome, ordem } = req.body;
    const opcao = await (0, CreateService_2.default)({
        companyId,
        grupoId: Number(grupoId),
        nome,
        ordem: ordem !== undefined ? Number(ordem) : undefined
    });
    return res.status(201).json(opcao);
};
exports.createOpcao = createOpcao;
const updateOpcao = async (req, res) => {
    const { companyId } = req.user;
    const { opcaoId } = req.params;
    const { nome, ordem } = req.body;
    const opcao = await (0, UpdateService_2.default)({
        companyId,
        opcaoId: Number(opcaoId),
        nome,
        ordem: ordem !== undefined ? Number(ordem) : undefined
    });
    return res.json(opcao);
};
exports.updateOpcao = updateOpcao;
const deleteOpcao = async (req, res) => {
    const { companyId } = req.user;
    const { opcaoId } = req.params;
    await (0, DeleteService_2.default)({ companyId, opcaoId: Number(opcaoId) });
    return res.status(204).send();
};
exports.deleteOpcao = deleteOpcao;
