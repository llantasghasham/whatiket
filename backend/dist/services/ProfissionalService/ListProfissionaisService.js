"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Profissional_1 = __importDefault(require("../../models/Profissional"));
const ListProfissionaisService = async ({ companyId }) => {
    const profissionais = await Profissional_1.default.findAll({
        where: { companyId },
        order: [["nome", "ASC"]]
    });
    return profissionais;
};
exports.default = ListProfissionaisService;
