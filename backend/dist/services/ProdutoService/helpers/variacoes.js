"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareVariacoes = void 0;
// @ts-nocheck
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const ProdutoVariacaoOpcao_1 = __importDefault(require("../../../models/ProdutoVariacaoOpcao"));
const ProdutoVariacaoGrupo_1 = __importDefault(require("../../../models/ProdutoVariacaoGrupo"));
const toNumberOrNull = (value, allowNegative = false) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_INVALID_VALUE", 400);
    }
    if (!allowNegative && parsed < 0) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_INVALID_VALUE", 400);
    }
    return parsed;
};
const prepareVariacoes = async (companyId, variacoes) => {
    if (!variacoes || variacoes.length === 0) {
        return [];
    }
    const sanitizedEntries = [];
    const uniqueIdsSet = new Set();
    variacoes.forEach((item) => {
        const opcaoId = Number(item.opcaoId);
        if (!Number.isFinite(opcaoId)) {
            return;
        }
        uniqueIdsSet.add(opcaoId);
        const valorOverride = toNumberOrNull(item.valorOverride, true);
        const estoqueOverride = toNumberOrNull(item.estoqueOverride);
        const existingIndex = sanitizedEntries.findIndex((entry) => entry.opcaoId === opcaoId);
        if (existingIndex >= 0) {
            sanitizedEntries[existingIndex] = { opcaoId, valorOverride, estoqueOverride };
        }
        else {
            sanitizedEntries.push({ opcaoId, valorOverride, estoqueOverride });
        }
    });
    const uniqueIds = Array.from(uniqueIdsSet);
    if (uniqueIds.length === 0) {
        return [];
    }
    const opcoes = await ProdutoVariacaoOpcao_1.default.findAll({
        where: { id: uniqueIds },
        include: [
            {
                model: ProdutoVariacaoGrupo_1.default,
                where: { companyId },
                attributes: ["id", "companyId"],
                required: true
            }
        ]
    });
    if (opcoes.length !== uniqueIds.length) {
        throw new AppError_1.default("ERR_PRODUTO_VARIACAO_OPTION_NOT_FOUND", 404);
    }
    return sanitizedEntries;
};
exports.prepareVariacoes = prepareVariacoes;
