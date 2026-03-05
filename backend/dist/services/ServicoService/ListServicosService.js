"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Servico_1 = __importDefault(require("../../models/Servico"));
const ListServicosService = async ({ companyId }) => {
    const servicos = await Servico_1.default.findAll({
        where: { companyId },
        order: [["nome", "ASC"]]
    });
    return servicos;
};
exports.default = ListServicosService;
