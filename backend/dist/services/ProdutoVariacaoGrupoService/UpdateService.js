"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ProdutoVariacaoGrupo_1 = __importDefault(require("../../models/ProdutoVariacaoGrupo"));
const UpdateService = async ({ companyId, grupoId, nome }) => {
    const trimmedName = nome?.trim();
    if (!trimmedName) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_GRUPO_INVALID_NAME", 400);
    }
    const grupo = await ProdutoVariacaoGrupo_1.default.findOne({ where: { id: grupoId, companyId } });
    if (!grupo) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_GRUPO_NOT_FOUND", 404);
    }
    const duplicated = await ProdutoVariacaoGrupo_1.default.findOne({
        where: {
            companyId,
            nome: trimmedName,
            id: {
                [sequelize_1.Op.ne]: grupoId
            }
        }
    });
    if (duplicated) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_GRUPO_DUPLICATED", 400);
    }
    await grupo.update({ nome: trimmedName });
    return grupo;
};
exports.default = UpdateService;
