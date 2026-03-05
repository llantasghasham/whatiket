"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncVariacoes = void 0;
// @ts-nocheck
const ProdutoVariacaoItem_1 = __importDefault(require("../../../models/ProdutoVariacaoItem"));
const syncVariacoes = async (produtoId, variacoes) => {
    console.log("syncVariacoes - produtoId:", produtoId, "variacoes:", variacoes);
    await ProdutoVariacaoItem_1.default.destroy({ where: { produtoId } });
    if (!variacoes || variacoes.length === 0) {
        console.log("syncVariacoes - sem variações para criar");
        return;
    }
    const payloads = variacoes.map((item) => ({
        produtoId,
        opcaoId: item.opcaoId,
        valorOverride: item.valorOverride,
        estoqueOverride: item.estoqueOverride
    }));
    console.log("syncVariacoes - payloads para bulkCreate:", payloads);
    await ProdutoVariacaoItem_1.default.bulkCreate(payloads);
};
exports.syncVariacoes = syncVariacoes;
