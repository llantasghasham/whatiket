"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProdutoCategoria_1 = __importDefault(require("../../models/ProdutoCategoria"));
const ListService = async ({ companyId }) => {
    return ProdutoCategoria_1.default.findAll({
        where: { companyId },
        order: [["nome", "ASC"]]
    });
};
exports.default = ListService;
